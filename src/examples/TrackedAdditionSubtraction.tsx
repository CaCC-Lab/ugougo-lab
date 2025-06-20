import React from 'react';
import AdditionSubtractionVisualizer from '../components/AdditionSubtractionVisualizer';
import { MaterialWrapper } from '../components/wrappers/MaterialWrapper';

/**
 * 学習追跡機能付きのたし算・ひき算ビジュアライザー
 * 
 * MaterialWrapperを使用して、既存の教材に学習追跡機能を追加する例
 */
const TrackedAdditionSubtraction: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <MaterialWrapper
      materialId="addition-subtraction-visualizer"
      materialName="たし算・ひき算ビジュアライザー"
      minDuration={10} // 10秒以上の使用で記録
      autoSave={true} // 自動保存を有効化
      showMetricsButton={true} // 学習レポートボタンを表示
      showAssistant={true} // 学習アシスタントを表示
    >
      <AdditionSubtractionVisualizer onClose={onClose} />
    </MaterialWrapper>
  );
};

export default TrackedAdditionSubtraction;

// 使用例：
// App.tsxで以下のように使用します：
// 
// import TrackedAdditionSubtraction from './examples/TrackedAdditionSubtraction';
// 
// // ダイアログ内で使用
// <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
//   <DialogContent>
//     <TrackedAdditionSubtraction onClose={handleClose} />
//   </DialogContent>
// </Dialog>