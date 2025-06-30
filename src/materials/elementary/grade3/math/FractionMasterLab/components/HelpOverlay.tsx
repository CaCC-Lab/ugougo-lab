/**
 * ヘルプオーバーレイコンポーネント
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  SportsEsports as GameIcon,
  FitnessCenter as TrainingIcon,
  Help as HelpIcon,
  Lightbulb as LightbulbIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites?: string[];
}

interface HelpOverlayProps {
  open: boolean;
  onClose: () => void;
  modules: LearningModule[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const HelpOverlay: React.FC<HelpOverlayProps> = ({
  open,
  onClose,
  modules
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
      default: return '不明';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            分数マスターラボ - ヘルプガイド
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="学習の進め方" icon={<TimelineIcon />} />
            <Tab label="各モジュール" icon={<SchoolIcon />} />
            <Tab label="よくある質問" icon={<QuestionAnswerIcon />} />
            <Tab label="分数のヒント" icon={<LightbulbIcon />} />
          </Tabs>
        </Box>

        {/* 学習の進め方 */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
            推奨学習フロー
          </Typography>
          
          <Card elevation={2} sx={{ mb: 3, border: `2px solid ${theme.palette.primary.main}` }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                📚 段階的学習のススメ
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                分数は「10歳の壁」と呼ばれる重要な学習項目です。以下の順序で段階的に学習することをおすすめします。
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="1. まなぶモード" 
                    secondary="分数の基本的な意味を視覚的に理解" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><GameIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="2. つかうモード" 
                    secondary="ピザやケーキを使った具体的な体験" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PsychologyIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="3. くらべるモード" 
                    secondary="分数の大小関係や等価性の理解" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TrainingIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="4. とっくんモード" 
                    secondary="分数の計算問題に挑戦" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">💡 効果的な学習のコツ</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemText primary="• 焦らず一つずつ理解を積み重ねる" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 視覚的な表現と数字を結びつける" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 身近なものに例えて考える" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• わからない時はヒント機能を活用" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* 各モジュール */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            学習モジュール詳細
          </Typography>
          
          {modules.map((module, index) => (
            <Card key={module.id} elevation={1} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: 'primary.main', mr: 2 }}>
                    {module.icon}
                  </Box>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {module.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={getDifficultyText(module.difficulty)}
                      color={getDifficultyColor(module.difficulty) as any}
                      size="small"
                    />
                    <Chip 
                      label={`${module.estimatedTime}分`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {module.description}
                </Typography>
                
                {module.prerequisites && module.prerequisites.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    前提: {module.prerequisites.join(', ')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </TabPanel>

        {/* よくある質問 */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            よくある質問
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Q: 分数がよくわからないのですが...</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                A: 大丈夫です！まずは「まなぶモード」から始めてください。
                分数は「全体をいくつかに分けた時の部分」を表す数です。
                ピザを例にすると、ピザ全体を4つに分けて、そのうち1つを表すのが「1/4」です。
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Q: スコアはどうやって決まりますか？</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                A: 各モジュールの完了時に20〜100ポイントがもらえます。
                正解率や学習時間に応じてボーナスポイントも加算されます。
                100ポイントごとにレベルアップします！
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Q: モジュールはどの順番で進めればいいですか？</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                A: 「まなぶ」→「つかう」→「くらべる」→「とっくん」の順番がおすすめです。
                前のモジュールを完了すると次のモジュールが利用できるようになります。
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Q: 進捗は保存されますか？</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">
                A: はい、学習進捗は自動的に保存されます。
                ブラウザを閉じても、次回開いた時に続きから学習できます。
              </Typography>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* 分数のヒント */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            分数理解のヒント
          </Typography>
          
          <Card elevation={2} sx={{ mb: 3, backgroundColor: theme.palette.info.light }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                🍕 分数を身近に感じよう
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• ピザを友達と分ける時" secondary="8等分したピザの3切れ = 3/8" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• チョコレートを分ける時" secondary="12個入りの4個 = 4/12 = 1/3" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 時間を表す時" secondary="30分 = 1時間の半分 = 1/2時間" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ mb: 3, backgroundColor: theme.palette.warning.light }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                🔢 分数の読み方
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• 分子（上の数）" secondary="選んだ部分の数" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 分母（下の数）" secondary="全体をいくつに分けたか" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 3/4の読み方" secondary="「よんぶんのさん」または「さん よんぶんの いち」" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ backgroundColor: theme.palette.success.light }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                ✨ 覚えておきたいポイント
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="• 分母が同じ分数は比べやすい" secondary="1/4 < 3/4（分子を比べる）" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 分子と分母が同じなら1" secondary="3/3 = 4/4 = 5/5 = 1" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 分子が0なら0" secondary="0/3 = 0/10 = 0" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="• 同じ数で分子と分母を割ると簡単に" secondary="6/8 = 3/4（両方を2で割る）" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};