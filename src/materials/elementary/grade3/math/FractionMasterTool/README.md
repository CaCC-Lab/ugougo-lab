# 分数マスターツール

小学3年生向けの高度な分数学習教材です。視覚的な表現と段階的な学習により、分数の概念から四則演算まで包括的に理解できます。

## 主な機能

### 1. 分数を探る（Explore Mode）
- **5種類の視覚表現**
  - ピザ：円形の分割で直感的理解
  - ケーキ：立体的な表現で深い理解
  - チョコレートバー：線形分割で比較しやすい
  - 円：シンプルな円グラフ表現
  - 長方形：格子状分割で大きな分母にも対応

- **インタラクティブな操作**
  - 分子・分母を自由に調整
  - リアルタイムで視覚表現が更新
  - 小数表記も同時表示

### 2. 大小比較（Compare Mode）
- **視覚的な比較機能**
  - 2つの分数を並べて表示
  - アニメーション付き比較結果
  - 不等号の自動表示

- **通分による比較**
  - 分母が異なる場合の通分表示
  - 段階的な理解を促進

### 3. 通分を学ぶ（Common Denominator Mode）
- **4段階のステップ学習**
  1. 元の分数を確認
  2. 最小公倍数を見つける（視覚的表示）
  3. 分母を揃える過程をアニメーション表示
  4. 通分完了の確認

- **認知科学的アプローチ**
  - 具体的な倍数リストから抽象的概念へ
  - 視覚的な変換過程の表示

### 4. 四則演算（Operations Mode）
- **対応する演算**
  - 足し算：通分→分子の加算→約分
  - 引き算：通分→分子の減算→約分
  - かけ算：分子同士・分母同士の乗算→約分
  - 割り算：逆数の概念→かけ算への変換

- **ステップバイステップ表示**
  - 各段階の詳細な説明
  - 進捗バーで現在位置を表示
  - 前後のステップへの自由な移動

### 5. 学習支援機能
- **個別最適化ヒントシステム**
  - ユーザーレベルに応じた3段階のヒント
  - 基本・発展・応用のレベル別提供
  - 文脈に応じた適切なヒント生成

- **学習記録連携**
  - learningStoreとの自動連携
  - 進捗状況の記録
  - 学習時間の追跡

## 技術的特徴

- **React + TypeScript**による型安全な実装
- **Konva.js**を使用した高品質なグラフィック描画
- **Framer Motion**による滑らかなアニメーション
- **Material-UI**による一貫性のあるUI

## 教育的配慮

1. **段階的複雑性**
   - 簡単な分数（分母12以下）から開始
   - 徐々に複雑な概念を導入

2. **多感覚アプローチ**
   - 視覚的表現の多様性
   - インタラクティブな操作
   - 即時フィードバック

3. **エラーを学習機会に**
   - 間違いを批判せず、理解を促す
   - 次のステップへの具体的な案内

4. **認知負荷の管理**
   - 一度に表示する情報量を制限
   - 明確な段階分け
   - 必要に応じて前のステップに戻れる

## 使用方法

1. モードタブから学習したい内容を選択
2. 各モードの指示に従って操作
3. 困ったときは右下のヒントボタンを活用
4. ステップを進めながら理解を深める

## 今後の拡張予定

- 分数の文章題への応用
- ゲーミフィケーション要素の追加
- より高度な分数概念（帯分数、仮分数）の導入
- 協調学習機能の実装