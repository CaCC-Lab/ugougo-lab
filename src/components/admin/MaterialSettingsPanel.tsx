/**
 * 教材表示設定管理パネル
 * Phase 2: 教材表示設定システム
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Typography,
  Divider,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Tooltip,
  Alert,
  Snackbar,
  ButtonGroup,
  Badge,
  InputAdornment,
  Tab,
  Tabs,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
  Subject as SubjectIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
  Save as SaveIcon,
  RestartAlt as RestartAltIcon,
  FilterList as FilterListIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  IndeterminateCheckBox as IndeterminateCheckBoxIcon,
} from '@mui/icons-material';
import { useMaterialSettingsStore } from '../../stores/materialSettingsStore';
import type { MaterialGrade, MaterialSubject, MaterialStatus, MaterialCategory } from '../../types/material';
import { generateMaterialStatistics } from '../../utils/materialMetadata';

interface MaterialSettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const MaterialSettingsPanel: React.FC<MaterialSettingsPanelProps> = ({ open, onClose }) => {
  const {
    materials,
    displaySettings,
    currentFilter,
    presets,
    toggleMaterial,
    toggleGrade,
    toggleSubject,
    toggleStatus,
    toggleCategory,
    updateMaterialStatus,
    setMaterialEnabled,
    enableAll,
    disableAll,
    applyPreset,
    exportSettings,
    importSettings,
    setFilter,
    clearFilter,
    getVisibleMaterials,
    toggleGlobalEnabled,
    toggleShowDevelopment,
    toggleShowDisabled,
    resetSettings,
  } = useMaterialSettingsStore();

  const [tabValue, setTabValue] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 統計情報を取得
  const statistics = useMemo(() => generateMaterialStatistics(), []);

  // 表示される教材
  const visibleMaterials = useMemo(() => {
    const filtered = getVisibleMaterials();
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return filtered.filter(
        material =>
          material.title.toLowerCase().includes(searchLower) ||
          material.description.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [getVisibleMaterials, searchText]);

  // タブ切り替え
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // ファイルエクスポート
  const handleExport = () => {
    const settings = exportSettings();
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-settings-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: '設定をエクスポートしました',
      severity: 'success',
    });
  };

  // ファイルインポート
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        importSettings(json);
        setSnackbar({
          open: true,
          message: '設定をインポートしました',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: '設定のインポートに失敗しました',
          severity: 'error',
        });
      }
    };
    reader.readAsText(file);
    
    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 設定リセット
  const handleReset = () => {
    if (window.confirm('すべての設定を初期状態にリセットしますか？')) {
      resetSettings();
      setSnackbar({
        open: true,
        message: '設定をリセットしました',
        severity: 'success',
      });
    }
  };

  // 学年グループの選択状態を計算
  const getGradeGroupState = (grades: MaterialGrade[]) => {
    const enabledCount = grades.filter(grade => displaySettings.byGrade[grade]).length;
    if (enabledCount === 0) return 'none';
    if (enabledCount === grades.length) return 'all';
    return 'some';
  };

  // 教科グループの選択状態を計算
  const getSubjectGroupState = (subjects: MaterialSubject[]) => {
    const enabledCount = subjects.filter(subject => displaySettings.bySubject[subject]).length;
    if (enabledCount === 0) return 'none';
    if (enabledCount === subjects.length) return 'all';
    return 'some';
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            <Typography variant="h6">教材表示設定</Typography>
            <Chip 
              label={`${visibleMaterials.length} / ${materials.length} 教材`}
              size="small"
              color="primary"
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="設定タブ">
              <Tab label="教材一覧" icon={<SubjectIcon />} iconPosition="start" />
              <Tab label="グループ設定" icon={<CategoryIcon />} iconPosition="start" />
              <Tab label="詳細設定" icon={<SettingsIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* 教材一覧タブ */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 3 }}>
              {/* 検索バー */}
              <TextField
                fullWidth
                variant="outlined"
                placeholder="教材を検索..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* グローバル設定 */}
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displaySettings.globalEnabled}
                        onChange={toggleGlobalEnabled}
                        color="primary"
                      />
                    }
                    label="教材システム全体を有効化"
                  />
                  <ButtonGroup variant="outlined" size="small">
                    <Button onClick={enableAll}>すべて有効</Button>
                    <Button onClick={disableAll}>すべて無効</Button>
                  </ButtonGroup>
                </Box>
              </Paper>

              {/* 教材リスト */}
              <List sx={{ maxHeight: '50vh', overflow: 'auto' }}>
                {visibleMaterials.map((material) => (
                  <ListItem
                    key={material.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{material.title}</Typography>
                          <Chip label={material.gradeJapanese} size="small" />
                          <Chip label={material.subjectJapanese} size="small" color="primary" />
                          <Chip 
                            label={material.status} 
                            size="small" 
                            color={
                              material.status === 'published' ? 'success' :
                              material.status === 'testing' ? 'warning' : 'default'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {material.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {material.tags?.map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={displaySettings.byMaterial[material.id]}
                        onChange={() => toggleMaterial(material.id)}
                        disabled={!displaySettings.globalEnabled}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          </TabPanel>

          {/* グループ設定タブ */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 3 }}>
              {/* プリセット */}
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  プリセット適用
                </Typography>
                <ButtonGroup variant="outlined" fullWidth>
                  <Button onClick={() => applyPreset('all')}>全教材</Button>
                  <Button onClick={() => applyPreset('elementary')}>小学生</Button>
                  <Button onClick={() => applyPreset('juniorHigh')}>中学生</Button>
                  <Button onClick={() => applyPreset('highSchool')}>高校生</Button>
                </ButtonGroup>
              </Paper>

              {/* 学年別設定 */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <SchoolIcon />
                    <Typography>学年別設定</Typography>
                    <Box sx={{ ml: 'auto', mr: 2 }}>
                      {getGradeGroupState(['小学1年生', '小学2年生', '小学3年生', '小学4年生', '小学5年生', '小学6年生']) === 'all' && 
                        <Chip label="小学生 ✓" size="small" color="primary" />}
                      {getGradeGroupState(['中学1年生', '中学2年生', '中学3年生']) === 'all' && 
                        <Chip label="中学生 ✓" size="small" color="primary" />}
                      {getGradeGroupState(['高校1年生', '高校2年生', '高校3年生']) === 'all' && 
                        <Chip label="高校生 ✓" size="small" color="primary" />}
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.entries(displaySettings.byGrade).map(([grade, enabled]) => (
                      <Grid item xs={6} sm={4} key={grade}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={enabled}
                              onChange={() => toggleGrade(grade as MaterialGrade)}
                              disabled={!displaySettings.globalEnabled}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{grade}</span>
                              <Chip 
                                label={statistics.byGrade[grade] || 0} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* 教科別設定 */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SubjectIcon />
                    <Typography>教科別設定</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.entries(displaySettings.bySubject).map(([subject, enabled]) => (
                      <Grid item xs={6} sm={4} key={subject}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={enabled}
                              onChange={() => toggleSubject(subject as MaterialSubject)}
                              disabled={!displaySettings.globalEnabled}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{subject}</span>
                              <Chip 
                                label={statistics.bySubject[subject] || 0} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* カテゴリー別設定 */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon />
                    <Typography>カテゴリー別設定</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.entries(displaySettings.byCategory).map(([category, enabled]) => (
                      <Grid item xs={6} sm={4} key={category}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={enabled}
                              onChange={() => toggleCategory(category as MaterialCategory)}
                              disabled={!displaySettings.globalEnabled}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{category}</span>
                              <Chip 
                                label={statistics.byCategory[category as MaterialCategory] || 0} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* ステータス別設定 */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LabelIcon />
                    <Typography>ステータス別設定</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.entries(displaySettings.byStatus).map(([status, enabled]) => (
                      <Grid item xs={12} sm={4} key={status}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={enabled}
                              onChange={() => toggleStatus(status as MaterialStatus)}
                              disabled={!displaySettings.globalEnabled}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>
                                {status === 'published' ? '公開中' :
                                 status === 'testing' ? 'テスト中' : '開発中'}
                              </span>
                              <Chip 
                                label={statistics.byStatus[status as MaterialStatus] || 0} 
                                size="small" 
                                variant="outlined"
                                color={
                                  status === 'published' ? 'success' :
                                  status === 'testing' ? 'warning' : 'default'
                                }
                              />
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          </TabPanel>

          {/* 詳細設定タブ */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ px: 3 }}>
              <Stack spacing={3}>
                {/* 表示オプション */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    表示オプション
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displaySettings.showDevelopment}
                        onChange={toggleShowDevelopment}
                      />
                    }
                    label="開発中の教材を表示"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={displaySettings.showDisabled}
                        onChange={toggleShowDisabled}
                      />
                    }
                    label="無効化された教材を表示"
                  />
                </Paper>

                {/* インポート/エクスポート */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    設定の管理
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleExport}
                    >
                      設定をエクスポート
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      component="label"
                    >
                      設定をインポート
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        hidden
                        onChange={handleImport}
                      />
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RestartAltIcon />}
                      onClick={handleReset}
                    >
                      設定をリセット
                    </Button>
                  </Box>
                </Paper>

                {/* 統計情報 */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    統計情報
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        総教材数
                      </Typography>
                      <Typography variant="h6">
                        {statistics.total}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        有効な教材
                      </Typography>
                      <Typography variant="h6">
                        {statistics.enabled}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        公開中
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {statistics.byStatus.published}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        開発中
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {statistics.byStatus.development}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            </Box>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* スナックバー */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MaterialSettingsPanel;