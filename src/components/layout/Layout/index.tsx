import { ReactNode, useState } from 'react';
import { Box, Container, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { Header } from '../Header';
import { GradeLevel } from '../../../types/material';

// なぜこのコンポーネントが必要か：
// 1. アプリケーション全体の一貫したレイアウトを提供
// 2. レスポンシブ対応（モバイル、タブレット、デスクトップ）
// 3. サイドナビゲーションの表示/非表示を管理

interface LayoutProps {
  children: ReactNode;
  // サイドバーのコンテンツ（教材一覧など）
  sidebar?: ReactNode;
  // 現在の学年
  currentGrade?: GradeLevel;
  onGradeChange?: (grade: GradeLevel) => void;
  // 認証状態
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export const Layout = ({
  children,
  sidebar,
  currentGrade,
  onGradeChange,
  isAuthenticated = false,
  onLoginClick,
  onLogoutClick,
}: LayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ドロワーの幅を学年に応じて調整
  // なぜ調整するか：小学生向けは大きめのUIが必要
  const drawerWidth = currentGrade?.startsWith('elementary') ? 280 : 240;

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // サイドバーの内容
  const drawerContent = (
    <Box sx={{ p: 2 }}>
      {sidebar}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <Header
        onMenuClick={handleDrawerToggle}
        currentGrade={currentGrade}
        onGradeChange={onGradeChange}
        isAuthenticated={isAuthenticated}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
      />

      {/* サイドバー（デスクトップは固定、モバイルはドロワー） */}
      {sidebar && (
        <>
          {/* モバイル用ドロワー */}
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // モバイルでのパフォーマンス向上
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawerContent}
          </Drawer>

          {/* デスクトップ用固定サイドバー */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                position: 'relative',
                height: '100%',
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </>
      )}

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* AppBarの高さ分のスペーサー */}
        <Toolbar />
        
        {/* コンテンツエリア */}
        <Container
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            py: 3,
            // 学年に応じて余白を調整
            px: currentGrade?.startsWith('elementary') ? 3 : 2,
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

// Toolbarコンポーネント（AppBarの高さ分のスペーサー）
const Toolbar = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        ...theme.mixins.toolbar,
      }}
    />
  );
};