// 対話シナリオデータ

export interface DialogueOption {
  id: string;
  text: string;
  phonetics?: string; // 発音記号
  katakanaHint?: string; // カタカナヒント
  isCorrect?: boolean;
  feedback?: string;
}

export interface DialogueTurn {
  id: string;
  speaker: 'system' | 'user';
  text: string;
  translation?: string;
  options?: DialogueOption[];
  correctOrder?: string[]; // 並び替え問題用の正解順序
  words?: string[]; // 並び替え用の単語リスト
  pronunciationTips?: string[];
}

export interface DialogueScenario {
  id: string;
  title: string;
  titleJa: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'daily' | 'introduction' | 'shopping' | 'school' | 'travel';
  description: string;
  dialogue: DialogueTurn[];
  vocabularyNotes?: {
    word: string;
    meaning: string;
    example: string;
  }[];
}

export const dialogueScenarios: DialogueScenario[] = [
  // Beginner - 自己紹介
  {
    id: 'intro-basic',
    title: 'Self Introduction',
    titleJa: '自己紹介',
    difficulty: 'beginner',
    category: 'introduction',
    description: '初対面の人に自己紹介をしてみよう',
    dialogue: [
      {
        id: 'intro-1',
        speaker: 'system',
        text: 'Hello! What\'s your name?',
        translation: 'こんにちは！お名前は何ですか？',
        pronunciationTips: [
          'Hello は「ヘロー」ではなく「ハロー」と発音',
          'What\'s の t は音が消えることが多い'
        ]
      },
      {
        id: 'intro-2',
        speaker: 'user',
        text: '',
        options: [
          {
            id: 'opt1',
            text: 'My name is Taro.',
            phonetics: 'maɪ neɪm ɪz tɑːroʊ',
            katakanaHint: 'マイ ネイム イズ タロウ',
            isCorrect: true,
            feedback: '正解！とても自然な自己紹介です。'
          },
          {
            id: 'opt2',
            text: 'I name Taro.',
            isCorrect: false,
            feedback: '惜しい！「My name is」が正しい表現です。'
          },
          {
            id: 'opt3',
            text: 'Me Taro.',
            isCorrect: false,
            feedback: 'カジュアルすぎます。「My name is Taro」がより丁寧です。'
          }
        ]
      },
      {
        id: 'intro-3',
        speaker: 'system',
        text: 'Nice to meet you, Taro! How old are you?',
        translation: 'はじめまして、タロウ！何歳ですか？',
        pronunciationTips: [
          'Nice の発音は「ナイス」',
          'meet you は「ミーチュー」とつなげて発音'
        ]
      },
      {
        id: 'intro-4',
        speaker: 'user',
        text: '',
        words: ['I', 'am', 'thirteen', 'years', 'old'],
        correctOrder: ['I', 'am', 'thirteen', 'years', 'old'],
        pronunciationTips: [
          'thirteen の th は舌を軽く噛んで発音',
          'years old は「イヤーズ オールド」とリンクして発音'
        ]
      }
    ],
    vocabularyNotes: [
      {
        word: 'name',
        meaning: '名前',
        example: 'What is your name?'
      },
      {
        word: 'meet',
        meaning: '会う',
        example: 'Nice to meet you.'
      },
      {
        word: 'years old',
        meaning: '〜歳',
        example: 'I am 13 years old.'
      }
    ]
  },

  // Beginner - 日常会話
  {
    id: 'daily-greeting',
    title: 'Daily Greetings',
    titleJa: '日常の挨拶',
    difficulty: 'beginner',
    category: 'daily',
    description: '朝の挨拶から始めてみよう',
    dialogue: [
      {
        id: 'daily-1',
        speaker: 'system',
        text: 'Good morning! How are you today?',
        translation: 'おはよう！今日の調子はどう？',
        pronunciationTips: [
          'Good morning の d は軽く発音',
          'How are you は「ハウ アー ユー」とつなげて'
        ]
      },
      {
        id: 'daily-2',
        speaker: 'user',
        text: '',
        options: [
          {
            id: 'opt1',
            text: 'I\'m fine, thank you.',
            phonetics: 'aɪm faɪn θæŋk juː',
            katakanaHint: 'アイム ファイン サンキュー',
            isCorrect: true,
            feedback: '完璧です！最も一般的な返答です。'
          },
          {
            id: 'opt2',
            text: 'I\'m good, thanks!',
            phonetics: 'aɪm gʊd θæŋks',
            katakanaHint: 'アイム グッド サンクス',
            isCorrect: true,
            feedback: '素晴らしい！カジュアルで自然な表現です。'
          },
          {
            id: 'opt3',
            text: 'I fine.',
            isCorrect: false,
            feedback: '「am」が抜けています。「I\'m fine」が正しいです。'
          }
        ]
      },
      {
        id: 'daily-3',
        speaker: 'system',
        text: 'That\'s great! What did you have for breakfast?',
        translation: 'それは良かった！朝食は何を食べましたか？',
        pronunciationTips: [
          'That\'s の t は音が消えることが多い',
          'breakfast は「ブレックファースト」'
        ]
      },
      {
        id: 'daily-4',
        speaker: 'user',
        text: '',
        words: ['I', 'had', 'rice', 'and', 'miso', 'soup'],
        correctOrder: ['I', 'had', 'rice', 'and', 'miso', 'soup'],
        pronunciationTips: [
          'had の d は軽く発音',
          'rice の r は巻き舌で',
          'and は「アンド」より「アン」に近い'
        ]
      }
    ]
  },

  // Intermediate - 買い物
  {
    id: 'shopping-clothes',
    title: 'Shopping for Clothes',
    titleJa: '服を買いに行く',
    difficulty: 'intermediate',
    category: 'shopping',
    description: '洋服店での買い物会話を練習しよう',
    dialogue: [
      {
        id: 'shop-1',
        speaker: 'system',
        text: 'Welcome to our store! Can I help you?',
        translation: 'いらっしゃいませ！何かお手伝いしましょうか？',
        pronunciationTips: [
          'Welcome の l は舌を上の歯茎につけて',
          'Can I は「キャナイ」とつなげて発音'
        ]
      },
      {
        id: 'shop-2',
        speaker: 'user',
        text: '',
        options: [
          {
            id: 'opt1',
            text: 'Yes, I\'m looking for a T-shirt.',
            phonetics: 'jes aɪm lʊkɪŋ fɔːr ə tiːʃɜːrt',
            katakanaHint: 'イエス アイム ルッキング フォー ア ティーシャツ',
            isCorrect: true,
            feedback: '素晴らしい！丁寧で自然な表現です。'
          },
          {
            id: 'opt2',
            text: 'I want T-shirt.',
            isCorrect: false,
            feedback: '「a」が必要です。「I want a T-shirt」または「I\'m looking for a T-shirt」がより自然です。'
          },
          {
            id: 'opt3',
            text: 'Give me T-shirt.',
            isCorrect: false,
            feedback: '少し失礼な表現です。「I\'m looking for」を使うとより丁寧です。'
          }
        ]
      },
      {
        id: 'shop-3',
        speaker: 'system',
        text: 'What size are you looking for?',
        translation: 'どのサイズをお探しですか？',
        pronunciationTips: [
          'What の t は軽く発音',
          'size の z は濁音で「サイズ」'
        ]
      },
      {
        id: 'shop-4',
        speaker: 'user',
        text: '',
        words: ['I', 'need', 'a', 'medium', 'size', 'please'],
        correctOrder: ['I', 'need', 'a', 'medium', 'size', 'please'],
        pronunciationTips: [
          'medium は「ミーディアム」',
          'please で文を締めると丁寧'
        ]
      },
      {
        id: 'shop-5',
        speaker: 'system',
        text: 'Here are some medium T-shirts. Do you have a color preference?',
        translation: 'こちらがMサイズのTシャツです。色のご希望はありますか？'
      },
      {
        id: 'shop-6',
        speaker: 'user',
        text: '',
        options: [
          {
            id: 'opt1',
            text: 'I like the blue one.',
            phonetics: 'aɪ laɪk ðə bluː wʌn',
            katakanaHint: 'アイ ライク ザ ブルー ワン',
            isCorrect: true,
            feedback: '完璧です！特定の商品を指す自然な表現です。'
          },
          {
            id: 'opt2',
            text: 'Blue is good.',
            isCorrect: true,
            feedback: '良いですね！シンプルで分かりやすい表現です。'
          },
          {
            id: 'opt3',
            text: 'I want blue color.',
            isCorrect: false,
            feedback: '意味は通じますが、「I like the blue one」の方が自然です。'
          }
        ]
      }
    ],
    vocabularyNotes: [
      {
        word: 'looking for',
        meaning: '〜を探している',
        example: 'I\'m looking for a gift.'
      },
      {
        word: 'size',
        meaning: 'サイズ',
        example: 'What size do you wear?'
      },
      {
        word: 'preference',
        meaning: '好み、希望',
        example: 'Do you have any preference?'
      }
    ]
  },

  // Advanced - 学校生活
  {
    id: 'school-presentation',
    title: 'Class Presentation',
    titleJa: 'クラスでの発表',
    difficulty: 'advanced',
    category: 'school',
    description: '授業での発表や質疑応答を練習しよう',
    dialogue: [
      {
        id: 'pres-1',
        speaker: 'user',
        text: '',
        words: ['Today', 'I\'d', 'like', 'to', 'talk', 'about', 'my', 'favorite', 'hobby'],
        correctOrder: ['Today', 'I\'d', 'like', 'to', 'talk', 'about', 'my', 'favorite', 'hobby'],
        pronunciationTips: [
          'I\'d は「アイド」と短縮形で発音',
          'talk about は「トーク アバウト」とリンク',
          'favorite の a は「エイ」の音'
        ]
      },
      {
        id: 'pres-2',
        speaker: 'system',
        text: 'That sounds interesting! Please go ahead.',
        translation: '面白そうですね！どうぞ続けてください。'
      },
      {
        id: 'pres-3',
        speaker: 'user',
        text: '',
        options: [
          {
            id: 'opt1',
            text: 'My hobby is playing video games. I especially enjoy RPGs.',
            phonetics: 'maɪ hɒbi ɪz pleɪɪŋ vɪdiəʊ geɪmz',
            isCorrect: true,
            feedback: '素晴らしい！具体的で分かりやすい説明です。'
          },
          {
            id: 'opt2',
            text: 'I like play game very much.',
            isCorrect: false,
            feedback: '「playing games」と動名詞を使いましょう。また「video games」と具体的に言うとより良いです。'
          },
          {
            id: 'opt3',
            text: 'Game is my hobby.',
            isCorrect: false,
            feedback: '文法的には正しいですが、「My hobby is playing video games」の方が自然です。'
          }
        ]
      },
      {
        id: 'pres-4',
        speaker: 'system',
        text: 'How long have you been playing video games?',
        translation: 'どのくらいビデオゲームをしていますか？',
        pronunciationTips: [
          'How long は「ハウ ロング」',
          'have you been は現在完了進行形'
        ]
      },
      {
        id: 'pres-5',
        speaker: 'user',
        text: '',
        words: ['I', 'have', 'been', 'playing', 'for', 'about', 'five', 'years'],
        correctOrder: ['I', 'have', 'been', 'playing', 'for', 'about', 'five', 'years'],
        pronunciationTips: [
          'have been は「ハヴ ビーン」とつなげて',
          'about は「アバウト」で「だいたい」の意味'
        ]
      }
    ],
    vocabularyNotes: [
      {
        word: 'presentation',
        meaning: '発表、プレゼンテーション',
        example: 'I will give a presentation tomorrow.'
      },
      {
        word: 'especially',
        meaning: '特に',
        example: 'I especially like math.'
      },
      {
        word: 'How long',
        meaning: 'どのくらいの期間',
        example: 'How long have you lived here?'
      }
    ]
  }
];

// 発音のコツデータ
export const pronunciationTips = {
  consonants: {
    th: {
      title: 'th の発音',
      description: '舌を上下の歯の間に軽く挟んで息を出す',
      examples: ['think', 'this', 'thank you'],
      katakanaWarning: '「サンキュー」ではなく舌を噛んで「thank you」'
    },
    r: {
      title: 'r の発音',
      description: '舌を巻いて、口の中のどこにも触れないようにする',
      examples: ['red', 'right', 'room'],
      katakanaWarning: '「ライト」ではなく巻き舌で「right」'
    },
    l: {
      title: 'l の発音',
      description: '舌先を上の歯茎にしっかりつける',
      examples: ['light', 'love', 'hello'],
      katakanaWarning: '「ヘロー」ではなく舌をつけて「hello」'
    },
    v: {
      title: 'v の発音',
      description: '下唇を上の歯に軽く当てて振動させる',
      examples: ['very', 'have', 'love'],
      katakanaWarning: '「ベリー」ではなく唇を振動させて「very」'
    },
    f: {
      title: 'f の発音',
      description: '下唇を上の歯に軽く当てて息を出す',
      examples: ['fish', 'coffee', 'life'],
      katakanaWarning: '「コーヒー」ではなく息を出して「coffee」'
    }
  },
  vowels: {
    a: {
      title: 'a の様々な発音',
      variations: [
        { sound: 'æ', examples: ['cat', 'apple', 'bad'], description: '口を横に広げて「ア」と「エ」の間' },
        { sound: 'eɪ', examples: ['make', 'take', 'name'], description: '「エイ」と二重母音で' },
        { sound: 'ɑː', examples: ['car', 'park', 'father'], description: '口を大きく開けて「アー」' }
      ]
    }
  },
  linking: {
    title: 'リンキング（音のつながり）',
    rules: [
      {
        rule: '子音＋母音',
        example: 'an apple → アナップル',
        description: '子音で終わる単語の次に母音で始まる単語が来ると音がつながる'
      },
      {
        rule: '同じ子音の連続',
        example: 'good day → グッデイ',
        description: '同じ子音が続くと一つにまとめて発音'
      }
    ]
  }
};