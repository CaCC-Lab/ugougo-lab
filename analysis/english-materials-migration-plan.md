# 英語教材の移行計画

作成日: 2025年6月29日

## 概要

`english-speaking-practice` と `pronunciation-practice` を `EnglishSpeakingGym` に統合する際の段階的移行計画です。ユーザーの混乱を最小限に抑えながら、スムーズな移行を実現します。

## 移行スケジュール

### Phase 1: 開発期間（Week 1-3）
**期間**: 2025年6月29日 - 2025年7月19日

#### 状態
- **EnglishSpeakingGym**: 開発中（enabled: false）
- **旧教材**: 通常運用（enabled: true）

#### アクション
- EnglishSpeakingGym の開発
- 内部テストの実施
- ドキュメントの準備

### Phase 2: ベータ期間（Week 4-5）
**期間**: 2025年7月20日 - 2025年8月2日

#### 状態
- **EnglishSpeakingGym**: ベータ版公開（enabled: true, status: 'testing'）
- **旧教材**: 通常運用（enabled: true）＋ベータ案内表示

#### materialMetadata.ts の更新
```typescript
// EnglishSpeakingGym
{
  id: 'english-speaking-gym',
  status: 'testing',
  enabled: true,
  tags: ['統合教材', '発音', '会話', 'スピーキング', '重要', 'ベータ版'],
  // ... 
}

// 旧教材にベータ案内を追加
{
  id: 'english-speaking-practice',
  enabled: true,
  betaNotice: '新しい統合教材「英語スピーキングジム」のベータ版が利用可能です！',
  // ...
}
```

#### アクション
- ユーザーフィードバックの収集
- バグ修正と改善
- 使用状況のモニタリング

### Phase 3: 並行運用期間（Week 6-7）
**期間**: 2025年8月3日 - 2025年8月16日

#### 状態
- **EnglishSpeakingGym**: 正式版公開（enabled: true, status: 'published'）
- **旧教材**: 非推奨表示（enabled: true, deprecated: true）

#### materialMetadata.ts の更新
```typescript
// 旧教材
{
  id: 'english-speaking-practice',
  enabled: true,
  status: 'deprecated',
  deprecationNotice: 'この教材は2025年8月31日に終了予定です。新しい「英語スピーキングジム」への移行をお願いします。',
  redirectSuggestion: 'english-speaking-gym',
  // ...
}
```

#### UI表示
- 旧教材に非推奨バナーを表示
- 新教材への誘導ボタン
- 移行ガイドへのリンク

### Phase 4: 完全移行（Week 8）
**期間**: 2025年8月17日以降

#### 状態
- **EnglishSpeakingGym**: 唯一の英語スピーキング教材
- **旧教材**: 無効化（enabled: false）

#### materialMetadata.ts の最終更新
```typescript
// 旧教材
{
  id: 'english-speaking-practice',
  enabled: false,
  status: 'archived',
  redirectTo: 'english-speaking-gym',
  archivedMessage: 'この教材は「英語スピーキングジム」に統合されました。',
  // ...
}
```

## 技術的実装

### 1. リダイレクト機能
```typescript
// src/utils/materialRedirect.ts
export const materialRedirects: Record<string, string> = {
  'english-speaking-practice': 'english-speaking-gym',
  'pronunciation-practice': 'english-speaking-gym'
};

export function checkRedirect(materialId: string): string | null {
  return materialRedirects[materialId] || null;
}
```

### 2. 移行通知コンポーネント
```typescript
// src/components/MigrationNotice.tsx
interface MigrationNoticeProps {
  oldMaterialId: string;
  newMaterialId: string;
  deadline?: string;
}

export function MigrationNotice({ oldMaterialId, newMaterialId, deadline }: MigrationNoticeProps) {
  return (
    <Alert severity="info">
      <AlertTitle>教材の移行のお知らせ</AlertTitle>
      この教材は新しい統合教材に移行されます。
      {deadline && `移行期限: ${deadline}`}
      <Button onClick={() => navigate(`/materials/${newMaterialId}`)}>
        新しい教材を試す
      </Button>
    </Alert>
  );
}
```

### 3. 学習データの移行
```typescript
// src/utils/dataMigration.ts
export async function migrateEnglishLearningData() {
  // 旧教材の進捗データを取得
  const speakingData = localStorage.getItem('english-speaking-practice-progress');
  const pronunciationData = localStorage.getItem('pronunciation-practice-progress');
  
  if (!speakingData && !pronunciationData) return;
  
  // 新形式に変換
  const migratedData = {
    phonetics: pronunciationData ? JSON.parse(pronunciationData) : {},
    conversation: speakingData ? JSON.parse(speakingData) : {},
    migratedAt: new Date().toISOString()
  };
  
  // 新教材用に保存
  localStorage.setItem('english-speaking-gym-progress', JSON.stringify(migratedData));
  
  // 移行フラグを立てる
  localStorage.setItem('english-materials-migrated', 'true');
}
```

## ユーザーコミュニケーション

### 1. お知らせ内容
```
【重要】英語学習教材の統合について

より効果的な学習体験を提供するため、以下の2つの教材を統合します：
- 英語スピーキング練習システム
- 発音練習ツール

新しい「英語スピーキングジム」では：
✨ 発音から会話まで一貫して学習
✨ より詳細な学習進捗管理
✨ 豊富な練習コンテンツ

移行スケジュール：
- 7月20日: ベータ版公開
- 8月3日: 正式版公開
- 8月31日: 旧教材終了

学習データは自動的に移行されます。
```

### 2. FAQ
**Q: 学習進捗はどうなりますか？**
A: 自動的に新教材に引き継がれます。

**Q: 新教材の使い方は？**
A: 基本的な操作は同じです。詳細なガイドを用意しています。

**Q: 旧教材を使い続けたい場合は？**
A: 8月31日まで利用可能ですが、新機能は新教材のみに追加されます。

## モニタリング指標

### 移行成功の判断基準
1. **採用率**: 並行運用期間中に70%以上のユーザーが新教材を試用
2. **継続率**: 新教材を試用したユーザーの80%以上が継続利用
3. **満足度**: フィードバックで85%以上の肯定的評価
4. **技術指標**: エラー率1%未満、パフォーマンス劣化なし

### トラブルシューティング

#### 問題: 移行率が低い
対策:
- より目立つ通知の表示
- インセンティブの提供（バッジなど）
- 移行ガイドの改善

#### 問題: 技術的な問題
対策:
- ロールバック計画の準備
- 段階的なユーザー移行
- サポート体制の強化

## 移行後の処理

### コードクリーンアップ（Phase 5）
1. **旧教材のコード削除**
   - コンポーネントファイル
   - データファイル
   - テストファイル

2. **依存関係の整理**
   - 不要なインポートの削除
   - パッケージの整理

3. **ドキュメント更新**
   - READMEの更新
   - 開発ドキュメントの更新

### アーカイブ
- 旧教材のコードは別ブランチに保存
- 学習データのバックアップ
- 移行ログの保存

## チェックリスト

### 開発完了時
- [ ] EnglishSpeakingGym の基本機能実装
- [ ] データ移行機能の実装
- [ ] リダイレクト機能の実装
- [ ] 移行通知UIの実装

### ベータ公開時
- [ ] お知らせの掲載
- [ ] フィードバック収集の準備
- [ ] モニタリング設定

### 正式公開時
- [ ] 移行ガイドの公開
- [ ] サポート体制の準備
- [ ] ロールバック計画の確認

### 完全移行時
- [ ] 全ユーザーへの最終通知
- [ ] 旧教材の無効化
- [ ] コードクリーンアップ計画