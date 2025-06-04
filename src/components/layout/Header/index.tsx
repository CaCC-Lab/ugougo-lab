import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { Menu as MenuIcon, School as SchoolIcon } from '@mui/icons-material';
import { GradeSelector } from '../../common/GradeSelector';
import { Button } from '../../common/Button';
import { GradeLevel } from '../../../types/material';

// なぜこのコンポーネントが必要か：
// 1. アプリケーション全体で統一的なナビゲーションを提供
// 2. 学年選択を常に表示し、いつでも切り替え可能にする
// 3. レスポンシブ対応で、モバイルでも使いやすいUI

interface HeaderProps {
  onMenuClick?: () => void;
  currentGrade?: GradeLevel;
  onGradeChange?: (grade: GradeLevel) => void;
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export const Header = ({
  onMenuClick,
  currentGrade,
  onGradeChange,
  isAuthenticated = false,
  onLoginClick,
  onLogoutClick,
}: HeaderProps) => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* モバイル用メニューボタン */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="メニューを開く"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* ロゴとタイトル */}
        <SchoolIcon sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }} />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          動く教材
        </Typography>

        {/* モバイル用の短いタイトル */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            display: { xs: 'block', sm: 'none' }
          }}
        >
          動く教材
        </Typography>

        {/* 学年選択（ログイン時のみ表示） */}
        {isAuthenticated && currentGrade && (
          <Box sx={{ mr: 2, minWidth: { xs: 120, sm: 200 } }}>
            <GradeSelector
              value={currentGrade}
              onChange={onGradeChange}
              compact={true}
            />
          </Box>
        )}

        {/* ログイン/ログアウトボタン */}
        {isAuthenticated ? (
          <Button
            color="inherit"
            onClick={onLogoutClick}
            size="small"
          >
            ログアウト
          </Button>
        ) : (
          <Button
            color="inherit"
            onClick={onLoginClick}
            variant="outlined"
            sx={{ 
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            ログイン
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};