# 代数入門システム（AlgebraIntroductionSystem）

## 概要
算数から数学への転換点である代数的思考への移行を支援する、中学1年生向けのインタラクティブな学習教材です。具体的な数から文字式、そして方程式へと段階的に理解を深めていきます。

## 主な機能

### 1. 3段階の学習ステップ
- **第1段階：具体的な数から記号へ**
  - □（プレースホルダー）を使った式の理解
  - 逆算の基礎概念の習得
  
- **第2段階：記号から文字へ**
  - □からx、y、aなどの文字への移行
  - 文字式の意味の理解
  
- **第3段階：文字式と方程式**
  - 天秤メタファーによる方程式の視覚的理解
  - 代数的操作の体験

### 2. インタラクティブな学習体験
- **天秤シミュレーター**：方程式の両辺のバランスを視覚的に確認
- **文字式アニメーション**：変数に値を代入する過程をアニメーションで表示
- **代数的操作ツール**：同類項をまとめる操作を体感的に学習

### 3. 学習サポート機能
- **誤解パターンの検出**：よくある間違いを自動検出し、適切なフィードバックを提供
- **段階的ヒント**：困ったときに表示される段階的なヒント
- **学習進度の可視化**：進捗状況、正答率、学習時間の記録と表示

## 教育的特徴

### 認知的配慮
- 具体から抽象への段階的移行
- 視覚的表現による概念の理解促進
- 操作的活動による体感的学習

### よくある誤解への対応
- 空欄のまま答えを提出
- 符号（プラス・マイナス）の混乱
- 文字の使い方への戸惑い
- 等号の意味の誤解

### 個別最適化
- 学習履歴の記録と分析
- 誤解パターンに基づく個別フィードバック
- 理解度に応じた問題の提示

## 技術仕様

### 使用技術
- React + TypeScript
- Material-UI（UI コンポーネント）
- Framer Motion（アニメーション）
- React Konva（天秤の描画）

### データ管理
- LocalStorage による学習進度の保存
- 誤解パターンの記録と分析
- 学習時間の自動計測

## 今後の拡張予定
- より複雑な方程式への対応
- 文字式の展開・因数分解
- 連立方程式への発展
- 学習データの詳細分析機能