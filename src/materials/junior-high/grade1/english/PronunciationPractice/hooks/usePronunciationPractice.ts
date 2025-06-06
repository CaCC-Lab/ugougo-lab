import { useState, useCallback, useRef, useEffect } from 'react';
import { phonemeData, Phoneme } from '../data/phonemeData';

export interface PracticeResult {
  phonemeId: string;
  score: number;
  timestamp: Date;
  recognizedText: string;
  targetText: string;
}

export interface PracticeState {
  currentPhoneme: Phoneme | null;
  isRecording: boolean;
  isPracticing: boolean;
  practiceResults: PracticeResult[];
  currentScore: number | null;
  recognizedText: string;
  feedback: string;
  practiceMode: 'phoneme' | 'word';
  difficulty: 'easy' | 'medium' | 'hard' | 'all';
}

export const usePronunciationPractice = () => {
  const [state, setState] = useState<PracticeState>({
    currentPhoneme: null,
    isRecording: false,
    isPracticing: false,
    practiceResults: [],
    currentScore: null,
    recognizedText: '',
    feedback: '',
    practiceMode: 'phoneme',
    difficulty: 'easy'
  });

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Web Speech APIの初期化
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  // 音素を選択
  const selectPhoneme = useCallback((phoneme: Phoneme) => {
    setState(prev => ({
      ...prev,
      currentPhoneme: phoneme,
      currentScore: null,
      recognizedText: '',
      feedback: ''
    }));
  }, []);

  // 練習モードを切り替え
  const setPracticeMode = useCallback((mode: 'phoneme' | 'word') => {
    setState(prev => ({
      ...prev,
      practiceMode: mode,
      currentScore: null,
      recognizedText: '',
      feedback: ''
    }));
  }, []);

  // 難易度を設定
  const setDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard' | 'all') => {
    setState(prev => ({
      ...prev,
      difficulty,
      currentPhoneme: null,
      currentScore: null,
      recognizedText: '',
      feedback: ''
    }));
  }, []);

  // 音声認識を開始
  const startRecording = useCallback(async () => {
    if (!recognitionRef.current || !state.currentPhoneme) return;

    setState(prev => ({ ...prev, isRecording: true, isPracticing: true }));

    try {
      // マイクの許可を取得
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        // 発音を評価
        const score = evaluatePronunciation(
          transcript,
          state.currentPhoneme!,
          state.practiceMode
        );
        
        const feedback = generateFeedback(score, state.currentPhoneme!);
        
        setState(prev => ({
          ...prev,
          recognizedText: transcript,
          currentScore: score,
          feedback,
          isRecording: false,
          isPracticing: false
        }));

        // 結果を保存
        const result: PracticeResult = {
          phonemeId: state.currentPhoneme!.id,
          score,
          timestamp: new Date(),
          recognizedText: transcript,
          targetText: state.practiceMode === 'phoneme' 
            ? state.currentPhoneme!.examples[0]
            : state.currentPhoneme!.practiceWords[0].word
        };

        setState(prev => ({
          ...prev,
          practiceResults: [...prev.practiceResults, result]
        }));
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setState(prev => ({
          ...prev,
          isRecording: false,
          isPracticing: false,
          feedback: 'マイクのエラーが発生しました。もう一度お試しください。'
        }));
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Microphone access error:', error);
      setState(prev => ({
        ...prev,
        isRecording: false,
        isPracticing: false,
        feedback: 'マイクへのアクセスが拒否されました。'
      }));
    }
  }, [state.currentPhoneme, state.practiceMode]);

  // 音声認識を停止
  const stopRecording = useCallback(() => {
    if (recognitionRef.current && state.isRecording) {
      recognitionRef.current.stop();
      setState(prev => ({ ...prev, isRecording: false }));
    }
  }, [state.isRecording]);

  // 発音を評価する関数
  const evaluatePronunciation = (
    recognized: string,
    phoneme: Phoneme,
    mode: 'phoneme' | 'word'
  ): number => {
    const recognizedLower = recognized.toLowerCase().trim();
    let score = 0;

    if (mode === 'phoneme') {
      // 音素モード：例の単語のいずれかと一致するか
      const matches = phoneme.examples.some(example => 
        recognizedLower.includes(example.toLowerCase())
      );
      score = matches ? 80 + Math.random() * 20 : 30 + Math.random() * 30;
    } else {
      // 単語モード：練習単語と一致するか
      const targetWord = phoneme.practiceWords[0].word.toLowerCase();
      if (recognizedLower === targetWord) {
        score = 90 + Math.random() * 10;
      } else if (recognizedLower.includes(targetWord) || targetWord.includes(recognizedLower)) {
        score = 60 + Math.random() * 20;
      } else {
        score = 20 + Math.random() * 30;
      }
    }

    return Math.round(score);
  };

  // フィードバックを生成
  const generateFeedback = (score: number, phoneme: Phoneme): string => {
    if (score >= 90) {
      return '素晴らしい！とても正確な発音です！';
    } else if (score >= 70) {
      return 'よくできました！もう少し練習すれば完璧です。';
    } else if (score >= 50) {
      return `まずまずです。${phoneme.mouthShape}を意識してみましょう。`;
    } else {
      return `もう一度挑戦してみましょう。${phoneme.commonMistakes[0]}に注意してください。`;
    }
  };

  // 練習履歴から統計を計算
  const getStatistics = useCallback(() => {
    const results = state.practiceResults;
    if (results.length === 0) return null;

    const phonemeScores = results.reduce((acc, result) => {
      if (!acc[result.phonemeId]) {
        acc[result.phonemeId] = [];
      }
      acc[result.phonemeId].push(result.score);
      return acc;
    }, {} as Record<string, number[]>);

    const statistics = Object.entries(phonemeScores).map(([phonemeId, scores]) => {
      const phoneme = phonemeData.find(p => p.id === phonemeId);
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      const best = Math.max(...scores);
      const improvement = scores.length > 1 
        ? scores[scores.length - 1] - scores[0]
        : 0;

      return {
        phonemeId,
        phonemeLabel: phoneme?.label || '',
        averageScore: Math.round(average),
        bestScore: best,
        practiceCount: scores.length,
        improvement: Math.round(improvement)
      };
    });

    return statistics.sort((a, b) => b.practiceCount - a.practiceCount);
  }, [state.practiceResults]);

  // 音声を再生（Text-to-Speech）
  const playSound = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // ゆっくり話す
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // リセット
  const reset = useCallback(() => {
    setState({
      currentPhoneme: null,
      isRecording: false,
      isPracticing: false,
      practiceResults: [],
      currentScore: null,
      recognizedText: '',
      feedback: '',
      practiceMode: 'phoneme',
      difficulty: 'easy'
    });
  }, []);

  return {
    state,
    selectPhoneme,
    setPracticeMode,
    setDifficulty,
    startRecording,
    stopRecording,
    getStatistics,
    playSound,
    reset
  };
};