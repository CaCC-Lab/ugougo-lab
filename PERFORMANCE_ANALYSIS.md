# パフォーマンス分析レポート

## 現状分析（2025年1月23日）

### バンドルサイズ
- **総サイズ**: 3,182.68 kB (gzip: 806.33 kB)
- **目標**: 1,000 kB以下 (gzip: 250 kB以下)
- **削減必要量**: 約2,200 kB (69%削減)

### 依存関係の使用状況分析

#### 大きなライブラリの使用状況

1. **three.js (0.152.2)**
   - 使用箇所: 1ファイル (CelestialMotionSimulator.tsx)
   - 推定サイズ: 500-600 kB
   - 最適化案: 動的インポート or CSS/SVGアニメーションで代替

2. **@mui/icons-material (7.1.1)**
   - 使用箇所: 101ファイル
   - 推定サイズ: 300-400 kB
   - 最適化案: 個別インポートに変更、未使用アイコンの削除

3. **recharts (2.15.3)**
   - 使用箇所: 4ファイル
   - 推定サイズ: 200-300 kB
   - 最適化案: 動的インポート or 軽量ライブラリに変更

4. **konva + react-konva**
   - 使用箇所: 10ファイル
   - 推定サイズ: 150-200 kB
   - 最適化案: 必要な機能のみインポート

5. **@tanstack/react-query (4.29.12)**
   - 使用箇所: 0ファイル（未使用）
   - 推定サイズ: 50-70 kB
   - 最適化案: 即削除

6. **canvas-confetti (1.9.3)**
   - 使用状況: 要確認
   - 推定サイズ: 10-20 kB
   - 最適化案: 使用状況により削除 or 動的インポート

7. **lodash-es (4.17.21)**
   - 使用状況: 要確認
   - 推定サイズ: 使用関数による
   - 最適化案: 個別インポート or ネイティブJS代替

## 最適化戦略

### フェーズ1: 即実行可能な最適化（削減目標: 500-700 kB）
1. 未使用ライブラリの削除
   - @tanstack/react-query
   - @types/three（開発依存に移動）
   - 未使用のlodash-es関数

2. MUIアイコンの最適化
   - バレルインポートから個別インポートへ
   - 使用頻度の低いアイコンをSVGに置き換え

### フェーズ2: 動的インポート実装（削減目標: 800-1000 kB）
1. 教材別コード分割
   - 各教材を個別のチャンクに分割
   - React.lazyとSuspenseで遅延ロード

2. 重いライブラリの動的インポート
   - three.js（CelestialMotionSimulator）
   - recharts（グラフ表示時のみ）
   - konva（Canvas使用教材のみ）

### フェーズ3: ライブラリ最適化（削減目標: 400-500 kB）
1. three.js → CSS/SVGアニメーション
2. recharts → 軽量チャートライブラリ
3. MUI Tree Shaking強化

### フェーズ4: ビルド設定最適化（削減目標: 200-300 kB）
1. Viteの手動チャンク分割
2. 圧縮設定の最適化
3. Service Worker実装

## 実装優先順位

1. **最優先**: 未使用ライブラリ削除（即効性高）
2. **高優先**: MUIアイコン最適化（影響範囲大）
3. **中優先**: 動的インポート実装（実装コスト中）
4. **低優先**: ライブラリ置き換え（実装コスト高）

## Phase 2最適化実装結果（2025年1月23日）

### 実施した最適化

#### 1. 未使用ライブラリの削除（完了）
- @tanstack/react-query: 削除済み
- lodash-es: 削除済み
- @types/three: devDependenciesに移動済み

#### 2. MUIアイコン最適化（完了）
- すべてのバレルインポートを個別インポートに変換
- 変更ファイル数: 10ファイル
- 推定削減サイズ: 200-300 kB

#### 3. 動的インポート実装（完了）
実装済みコンポーネント:
- CelestialMotionSimulator (three.js使用)
- ProportionGraphTool (Konva使用)
- LeverPrincipleExperiment (Konva使用)

#### 4. ビルド設定最適化（完了）
vite.config.tsに以下を追加:
- manualChunks設定でライブラリを分離
- terser圧縮設定
- console.log削除設定

### 最適化後のバンドル構成

| チャンク | サイズ | gzip後 | 内容 |
|---------|--------|--------|------|
| index.js | 1,565.61 kB | 347.71 kB | メインアプリケーション |
| three.js | 434.14 kB | 106.26 kB | Three.js |
| mui-vendor.js | 386.93 kB | 112.18 kB | MUI本体 |
| graphics.js | 284.03 kB | 84.77 kB | Konva.js |
| react-vendor.js | 139.87 kB | 45.20 kB | React本体 |
| animation.js | 111.54 kB | 36.95 kB | framer-motion |
| mui-icons.js | 36.96 kB | 13.53 kB | MUIアイコン |

動的インポートされたチャンク:
- CelestialMotionSimulator.js: 19.35 kB (6.65 kB gzip)
- LeverPrincipleExperiment.js: 11.86 kB (4.42 kB gzip)
- ProportionGraphTool.js: 9.10 kB (3.63 kB gzip)

### 成果
- **総バンドルサイズ**: 3,182.68 kB → 約3,000 kB（約200 kB削減）
- **gzip後サイズ**: 806.33 kB → 762 kB（約44 kB削減）
- **初期ロード改善**: 重いコンポーネントの遅延ロード実現

### 残課題
1. メインチャンク（index.js）がまだ1.5MBと大きい
2. CalculusVisualizer.tsxでのeval使用（セキュリティリスク）
3. さらなる教材の動的インポート化

### 次のステップ（Phase 3推奨）
1. 各教材コンポーネントの動的インポート拡大
2. Route-based code splittingの実装
3. Service Workerによるキャッシュ戦略
4. evalを使用しない数式評価ライブラリへの移行