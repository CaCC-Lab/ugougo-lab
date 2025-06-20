# 学習履歴システム実装ガイド

## 概要

本プロジェクトには、学習者の進捗や成果を自動的に記録する学習履歴システムが実装されています。このシステムは、文部科学省が推進する「個別最適化学習」の実現を支援します。

## システムの特徴

- **自動記録**: 学習時間、インタラクション、成績を自動的に記録
- **最小限の実装**: 既存教材に約20行の変更で追加可能
- **パフォーマンス最適化**: デバウンス処理とバッチ処理で軽量動作
- **プライバシー配慮**: データはローカルストレージに保存（サーバー送信なし）

## 実装方法

### 方法1: MaterialWrapperを使用（推奨）

最も簡単な方法は、`MaterialWrapper`コンポーネントで教材をラップすることです。

```tsx
import { MaterialWrapper } from '../components/wrappers/MaterialWrapper';
import YourMaterial from '../components/YourMaterial';

const TrackedYourMaterial = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="your-material-id"
      materialName="教材の名前"
      minDuration={10} // 最小記録時間（秒）
      autoSave={true} // 自動保存
      showMetricsButton={true} // 学習レポートボタン
      showAssistant={true} // 学習アシスタント
    >
      <YourMaterial onClose={onClose} />
    </MaterialWrapper>
  );
};
```

### 方法2: useLearningTrackerContextを使用

教材内部から学習記録を細かく制御したい場合は、コンテキストを使用します。

```tsx
import { useLearningTrackerContext } from './wrappers/MaterialWrapper';

function YourMaterial() {
  const { recordAnswer, recordInteraction, recordHintUsed } = useLearningTrackerContext();
  
  const handleAnswer = (isCorrect: boolean) => {
    recordAnswer(isCorrect, {
      problem: '問題内容',
      userAnswer: 'ユーザーの回答',
      correctAnswer: '正解'
    });
  };
  
  const handleHintClick = () => {
    recordHintUsed();
    // ヒントを表示
  };
  
  // ... 教材の実装
}
```

### 方法3: 高階コンポーネント（HOC）を使用

```tsx
import { withLearningTracker } from '../components/wrappers/MaterialWrapper';

const TrackedMaterial = withLearningTracker(YourMaterial, {
  materialId: 'your-material-id',
  materialName: '教材の名前',
  showMetricsButton: true,
  showAssistant: true
});
```

## 記録されるデータ

### 基本データ
- **materialId**: 教材の識別子
- **timestamp**: 学習日時
- **duration**: 学習時間（秒）
- **score**: スコア（0-100）
- **completed**: 完了フラグ

### 詳細データ
- **mistakes**: 間違いの詳細（問題、回答、正解）
- **hintsUsed**: ヒント使用回数
- **interactions**: クリック、ドラッグ、キー入力の回数

## 学習データの活用

### 1. 学習レポート
`LearningMetrics`コンポーネントで、詳細な学習レポートを表示できます。

- 総学習時間
- 平均スコア
- 連続学習日数
- 週間進捗グラフ
- 教材別の習熟度

### 2. 学習アシスタント
`LearningAssistant`コンポーネントで、個別化された学習支援を提供します。

- 進捗状況の表示
- エラーパターンの分析
- 改善提案
- 励ましメッセージ

### 3. 推奨システム
学習履歴に基づいて、次に取り組むべき教材を推奨します。

```tsx
const { getRecommendedMaterials } = useLearningStore();
const recommended = getRecommendedMaterials();
```

## 実装済み教材

現在、以下の教材で学習履歴が実装されています：

1. **FractionMasterTool** - 分数マスターツール（完全統合）
2. **AlgebraicExpressionTool** - 代数式学習ツール
3. **AdditionSubtractionVisualizer** - たし算・ひき算ビジュアライザー（本ガイドで実装）

## パフォーマンスの考慮事項

### 最適化手法
1. **デバウンス処理**: 頻繁なイベントは100msでデバウンス
2. **バッチ記録**: 5秒ごとにまとめて処理
3. **最小記録時間**: 10秒以上の使用のみ記録
4. **データ制限**: 最新1000件のみ保存

### メモリ使用量
- 1レコード: 約200-500バイト
- 1000レコード: 約200-500KB
- 全体: 最大約1MB（ブラウザの制限内）

## プライバシーとセキュリティ

- データはブラウザのローカルストレージに保存
- サーバーへの送信なし
- ユーザーはいつでもデータを削除可能
- 個人を特定する情報は記録しない

## トラブルシューティング

### 学習記録が保存されない
1. ブラウザのローカルストレージが有効か確認
2. プライベートブラウジングモードでないか確認
3. 最小記録時間（10秒）を満たしているか確認

### パフォーマンスが低下する
1. 古いレコードを削除（1000件制限）
2. デバウンス間隔を調整
3. 不要なインタラクション記録を無効化

## 今後の展開

### Phase 1（実装済み）
- 基本的な時間記録
- MaterialWrapperコンポーネント
- 3教材での実装

### Phase 2（計画中）
- 10教材への展開
- 詳細なインタラクション記録
- 進捗ダッシュボードの改善

### Phase 3（将来）
- 全52教材への展開
- AI分析機能
- 学習パターンの予測

## 貢献方法

新しい教材に学習履歴を追加する場合：

1. MaterialWrapperでラップ
2. 適切なmaterialIdを設定
3. 必要に応じてrecordAnswer等を実装
4. テストとドキュメント更新

質問や提案は、GitHubのIssueで受け付けています。