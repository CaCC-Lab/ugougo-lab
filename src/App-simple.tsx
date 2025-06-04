import { useState } from 'react';

// 最小限の動作確認用アプリ
function AppSimple() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        動く教材プロジェクト - 動作確認
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>基本的なReactアプリが動作しています。</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          カウント: {count}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>今後実装予定の機能</h2>
        <ul>
          <li>✅ React基本動作</li>
          <li>⏳ 教材システム</li>
          <li>⏳ インタラクティブ機能</li>
          <li>⏳ 学年別テーマ</li>
        </ul>
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6',
        borderRadius: '4px'
      }}>
        <h3>次のステップ</h3>
        <p>このページが正常に表示されれば、基本的な環境は正常です。</p>
        <p>次に段階的に機能を追加していきましょう。</p>
      </div>
    </div>
  );
}

export default AppSimple;