import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@materials': '/src/materials',
      '@features': '/src/features',
      '@hooks': '/src/hooks',
      '@stores': '/src/stores',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@types': '/src/types'
    }
  },
  build: {
    // コード分割の最適化
    rollupOptions: {
      output: {
        manualChunks: {
          // React関連
          'react-vendor': ['react', 'react-dom'],
          // MUI関連
          'mui-vendor': ['@mui/material'],
          'mui-icons': ['@mui/icons-material'],
          // アニメーション関連
          'animation': ['framer-motion', 'canvas-confetti'],
          // 図形描画関連
          'graphics': ['react-konva', 'konva'],
          // 3D関連
          'three': ['three']
        }
      }
    },
    // ビルドのターゲット設定
    target: 'es2015',
    // チャンクサイズの警告閾値（KB）
    chunkSizeWarningLimit: 1000,
    // CSS最適化
    cssMinify: true,
    // ソースマップの生成（本番環境ではfalse推奨）
    sourcemap: false,
    // 圧縮設定
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // 開発サーバーの設定
  server: {
    port: parseInt(process.env.PORT || '5173'),
    host: true, // ネットワークアクセスを許可
    strictPort: false,
    open: true,
    hmr: {
      port: 24678, // WebSocket専用ポート（固定）
      host: 'localhost'
    },
    // WebSocket接続の最適化
    cors: true,
    // ファイル監視の設定
    watch: {
      usePolling: false,
      interval: 100
    }
  },
  // プレビューサーバーの設定
  preview: {
    port: 4173,
    strictPort: false
  }
})
