/**
 * 発音練習用の音素データ
 * 中学1年生が学ぶべき基本的な英語の音素を定義
 */

export interface Phoneme {
  id: string;
  symbol: string;  // IPA記号
  label: string;   // 表示名
  type: 'vowel' | 'consonant';  // 母音・子音
  difficulty: 'easy' | 'medium' | 'hard';  // 難易度
  examples: string[];  // 例となる単語
  mouthShape: string;  // 口の形の説明
  tonguePosition: string;  // 舌の位置の説明
  japaneseComparison: string;  // 日本語との比較
  commonMistakes: string[];  // よくある間違い
  practiceWords: Array<{
    word: string;
    phonetic: string;  // 発音記号
    meaning: string;   // 日本語訳
  }>;
}

export const phonemeData: Phoneme[] = [
  // 母音
  {
    id: 'phoneme-i',
    symbol: 'iː',
    label: '長い「イー」',
    type: 'vowel',
    difficulty: 'easy',
    examples: ['see', 'tea', 'me'],
    mouthShape: '唇を横に引いて、笑顔のような形',
    tonguePosition: '舌を上の歯茎に近づける',
    japaneseComparison: '日本語の「イ」より口を横に大きく引く',
    commonMistakes: ['日本語の「イ」と同じに発音してしまう'],
    practiceWords: [
      { word: 'see', phonetic: 'siː', meaning: '見る' },
      { word: 'tea', phonetic: 'tiː', meaning: 'お茶' },
      { word: 'he', phonetic: 'hiː', meaning: '彼' }
    ]
  },
  {
    id: 'phoneme-i-short',
    symbol: 'ɪ',
    label: '短い「イ」',
    type: 'vowel',
    difficulty: 'medium',
    examples: ['sit', 'big', 'pin'],
    mouthShape: '「イー」より口をリラックスさせる',
    tonguePosition: '舌を少し下げて、中央に',
    japaneseComparison: '「イ」と「エ」の中間のような音',
    commonMistakes: ['長い「イー」と混同する', '日本語の「イ」で代用する'],
    practiceWords: [
      { word: 'sit', phonetic: 'sɪt', meaning: '座る' },
      { word: 'big', phonetic: 'bɪɡ', meaning: '大きい' },
      { word: 'this', phonetic: 'ðɪs', meaning: 'これ' }
    ]
  },
  {
    id: 'phoneme-ae',
    symbol: 'æ',
    label: '「ア」と「エ」の中間',
    type: 'vowel',
    difficulty: 'hard',
    examples: ['cat', 'bad', 'happy'],
    mouthShape: '口を大きく横に開く',
    tonguePosition: '舌を前方で平らに',
    japaneseComparison: '日本語にない音。「ア」を言いながら「エ」の口の形',
    commonMistakes: ['「ア」だけで発音する', '「エ」に寄りすぎる'],
    practiceWords: [
      { word: 'cat', phonetic: 'kæt', meaning: '猫' },
      { word: 'bad', phonetic: 'bæd', meaning: '悪い' },
      { word: 'happy', phonetic: 'hæpi', meaning: '幸せな' }
    ]
  },
  {
    id: 'phoneme-a',
    symbol: 'ɑː',
    label: '深い「アー」',
    type: 'vowel',
    difficulty: 'easy',
    examples: ['car', 'father', 'park'],
    mouthShape: '口を大きく開ける',
    tonguePosition: '舌を下げて、奥に引く',
    japaneseComparison: '日本語の「アー」より口を大きく開ける',
    commonMistakes: ['口の開きが小さい'],
    practiceWords: [
      { word: 'car', phonetic: 'kɑːr', meaning: '車' },
      { word: 'park', phonetic: 'pɑːrk', meaning: '公園' },
      { word: 'art', phonetic: 'ɑːrt', meaning: '芸術' }
    ]
  },
  
  // 子音
  {
    id: 'phoneme-r',
    symbol: 'r',
    label: 'R音',
    type: 'consonant',
    difficulty: 'hard',
    examples: ['red', 'run', 'rice'],
    mouthShape: '唇を少し突き出す',
    tonguePosition: '舌先を口の中で巻く（どこにも触れない）',
    japaneseComparison: '日本語の「ラ行」とは全く違う音',
    commonMistakes: ['日本語の「ラ」で代用する', '舌を震わせる'],
    practiceWords: [
      { word: 'red', phonetic: 'red', meaning: '赤い' },
      { word: 'run', phonetic: 'rʌn', meaning: '走る' },
      { word: 'rice', phonetic: 'raɪs', meaning: '米' }
    ]
  },
  {
    id: 'phoneme-l',
    symbol: 'l',
    label: 'L音',
    type: 'consonant',
    difficulty: 'medium',
    examples: ['look', 'like', 'love'],
    mouthShape: '口を軽く開ける',
    tonguePosition: '舌先を上の歯茎につける',
    japaneseComparison: '日本語の「ラ行」より舌をしっかり付ける',
    commonMistakes: ['日本語の「ラ行」と混同する', 'Rと区別できない'],
    practiceWords: [
      { word: 'look', phonetic: 'lʊk', meaning: '見る' },
      { word: 'like', phonetic: 'laɪk', meaning: '好き' },
      { word: 'love', phonetic: 'lʌv', meaning: '愛' }
    ]
  },
  {
    id: 'phoneme-th-voiceless',
    symbol: 'θ',
    label: 'TH音（無声）',
    type: 'consonant',
    difficulty: 'hard',
    examples: ['think', 'thank', 'three'],
    mouthShape: '舌を上下の歯の間に軽く挟む',
    tonguePosition: '舌先を歯の間から少し出す',
    japaneseComparison: '日本語にない音。「ス」とは違う',
    commonMistakes: ['「ス」で代用する', '舌を出しすぎる'],
    practiceWords: [
      { word: 'think', phonetic: 'θɪŋk', meaning: '考える' },
      { word: 'thank', phonetic: 'θæŋk', meaning: '感謝する' },
      { word: 'three', phonetic: 'θriː', meaning: '3' }
    ]
  },
  {
    id: 'phoneme-th-voiced',
    symbol: 'ð',
    label: 'TH音（有声）',
    type: 'consonant',
    difficulty: 'hard',
    examples: ['this', 'that', 'the'],
    mouthShape: '舌を上下の歯の間に軽く挟む',
    tonguePosition: '舌先を歯の間から少し出す（振動させる）',
    japaneseComparison: '日本語にない音。「ザ」とは違う',
    commonMistakes: ['「ザ」で代用する', '無声THと混同する'],
    practiceWords: [
      { word: 'this', phonetic: 'ðɪs', meaning: 'これ' },
      { word: 'that', phonetic: 'ðæt', meaning: 'あれ' },
      { word: 'the', phonetic: 'ðə', meaning: '（冠詞）' }
    ]
  },
  {
    id: 'phoneme-v',
    symbol: 'v',
    label: 'V音',
    type: 'consonant',
    difficulty: 'medium',
    examples: ['very', 'love', 'have'],
    mouthShape: '下唇を上の歯に軽く当てる',
    tonguePosition: '舌は特に動かさない',
    japaneseComparison: '日本語の「ブ」とは違い、唇を合わせない',
    commonMistakes: ['「ブ」で代用する', 'Fと区別できない'],
    practiceWords: [
      { word: 'very', phonetic: 'veri', meaning: 'とても' },
      { word: 'love', phonetic: 'lʌv', meaning: '愛' },
      { word: 'have', phonetic: 'hæv', meaning: '持つ' }
    ]
  },
  {
    id: 'phoneme-f',
    symbol: 'f',
    label: 'F音',
    type: 'consonant',
    difficulty: 'easy',
    examples: ['fish', 'fun', 'five'],
    mouthShape: '下唇を上の歯に軽く当てる',
    tonguePosition: '舌は特に動かさない',
    japaneseComparison: '日本語の「フ」より息を強く出す',
    commonMistakes: ['日本語の「フ」で代用する', '息が弱い'],
    practiceWords: [
      { word: 'fish', phonetic: 'fɪʃ', meaning: '魚' },
      { word: 'fun', phonetic: 'fʌn', meaning: '楽しい' },
      { word: 'five', phonetic: 'faɪv', meaning: '5' }
    ]
  }
];

// 難易度別に音素を取得
export const getPhonemesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
  return phonemeData.filter(p => p.difficulty === difficulty);
};

// タイプ別に音素を取得
export const getPhonemesByType = (type: 'vowel' | 'consonant') => {
  return phonemeData.filter(p => p.type === type);
};