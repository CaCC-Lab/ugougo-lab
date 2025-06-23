/**
 * ゲーミフィケーションダッシュボード
 * 
 * 学習者の進歩、バッジ、ソーシャル要素を統合した
 * 包括的なゲーミフィケーション体験を提供するメインダッシュボード
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  IconButton,
  Fade,
  Zoom,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Whatshot as FireIcon,
  Timeline as TimelineIcon,
  Leaderboard as LeaderboardIcon,
  Groups as GroupsIcon,
  Psychology as BrainIcon,
  Speed as SpeedIcon,
  Favorite as HeartIcon,
  AutoAwesome as MagicIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// アニメーション定義
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
  100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
`;

const bounceAnimation = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -30px, 0); }
  70% { transform: translate3d(0, -15px, 0); }
  90% { transform: translate3d(0, -4px, 0); }
`;

// スタイルドコンポーネント
const GlowingCard = styled(Card)<{ glow?: boolean }>`
  transition: all 0.3s ease;
  ${props => props.glow && `
    animation: ${glowAnimation} 2s infinite;
    border: 2px solid #FFD700;
  `}
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const AnimatedAvatar = styled(Avatar)<{ bounce?: boolean }>`
  ${props => props.bounce && `
    animation: ${bounceAnimation} 1.5s infinite;
  `}
`;

const XPBar = styled(LinearProgress)`
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  
  .MuiLinearProgress-bar {
    background: linear-gradient(45deg, #2196F3, #21CBF3);
    border-radius: 6px;
  }
`;

interface GamificationDashboardProps {
  userId: string;
  onClose?: () => void;
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
      id={`gamification-tabpanel-${index}`}
      aria-labelledby={`gamification-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ userId, onClose }) => {
  // 状態管理
  const [currentTab, setCurrentTab] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [levelProgress, setLevelProgress] = useState<any>(null);
  const [recentBadges, setRecentBadges] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [currentChallenges, setCurrentChallenges] = useState<any[]>([]);
  const [studyGroups, setStudyGroups] = useState<any[]>([]);
  const [storyContinuation, setStoryContinuation] = useState<any>(null);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);

  // データ読み込み
  useEffect(() => {
    loadGamificationData();
  }, [userId]);

  const loadGamificationData = async () => {
    try {
      // 実際の実装では、APIから各種データを取得
      setUserProfile(mockUserProfile);
      setLevelProgress(mockLevelProgress);
      setRecentBadges(mockRecentBadges);
      setLeaderboardData(mockLeaderboardData);
      setCurrentChallenges(mockChallenges);
      setStudyGroups(mockStudyGroups);
      setStoryContinuation(mockStoryContinuation);
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // レベルアップアニメーション
  const triggerLevelUpAnimation = () => {
    setShowBadgeAnimation(true);
    setTimeout(() => setShowBadgeAnimation(false), 3000);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'auto', p: 2 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}>
          🎮 学習アドベンチャー
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          あなたの学習の冒険を確認しよう！
        </Typography>
      </Box>

      {/* プロフィールサマリー */}
      <GlowingCard sx={{ mb: 3 }} glow={userProfile?.hasLeveledUp}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {/* アバター */}
            <Grid item>
              <AnimatedAvatar
                bounce={userProfile?.hasLeveledUp}
                sx={{ 
                  width: 80, 
                  height: 80,
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)'
                }}
              >
                {userProfile?.avatar || '🎓'}
              </AnimatedAvatar>
            </Grid>

            {/* 基本情報 */}
            <Grid item xs>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {userProfile?.displayName || '学習者'}
                <Chip 
                  label={`レベル ${levelProgress?.overallLevel || 1}`}
                  color="primary"
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    経験値: {levelProgress?.currentXP || 0} / {levelProgress?.nextLevelXP || 100}
                  </Typography>
                  <Typography variant="body2">
                    {Math.round((levelProgress?.currentXP || 0) / (levelProgress?.nextLevelXP || 100) * 100)}%
                  </Typography>
                </Box>
                <XPBar 
                  variant="determinate" 
                  value={(levelProgress?.currentXP || 0) / (levelProgress?.nextLevelXP || 100) * 100}
                />
              </Box>

              {/* 統計サマリー */}
              <Grid container spacing={2}>
                <Grid item>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FireIcon sx={{ color: '#FF6B6B', mr: 0.5 }} />
                    <Typography variant="body2">
                      {userProfile?.currentStreak || 0}日連続
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrophyIcon sx={{ color: '#FFD700', mr: 0.5 }} />
                    <Typography variant="body2">
                      バッジ {recentBadges?.length || 0}個
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BrainIcon sx={{ color: '#9C27B0', mr: 0.5 }} />
                    <Typography variant="body2">
                      習熟度 {userProfile?.masteryScore || 0}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* アクションボタン */}
            <Grid item>
              <Button
                variant="contained"
                startIcon={<MagicIcon />}
                onClick={triggerLevelUpAnimation}
                sx={{
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FF5252, #26C6DA)',
                  }
                }}
              >
                学習を続ける
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </GlowingCard>

      {/* タブナビゲーション */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'medium'
            }
          }}
        >
          <Tab 
            label="ダッシュボード" 
            icon={<TimelineIcon />}
            iconPosition="start"
          />
          <Tab 
            label="バッジコレクション" 
            icon={<TrophyIcon />}
            iconPosition="start"
          />
          <Tab 
            label="ランキング" 
            icon={<LeaderboardIcon />}
            iconPosition="start"
          />
          <Tab 
            label="チャレンジ" 
            icon={<StarIcon />}
            iconPosition="start"
          />
          <Tab 
            label="仲間" 
            icon={<GroupsIcon />}
            iconPosition="start"
          />
          <Tab 
            label="ストーリー" 
            icon={<MagicIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* タブコンテンツ */}
      <TabPanel value={currentTab} index={0}>
        <DashboardContent 
          levelProgress={levelProgress}
          recentActivity={userProfile?.recentActivity || []}
          skillProgress={userProfile?.skillProgress || {}}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <BadgeCollection 
          badges={recentBadges}
          showAnimation={showBadgeAnimation}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <LeaderboardView 
          data={leaderboardData}
          userRank={userProfile?.currentRank}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <ChallengeHub 
          challenges={currentChallenges}
          onJoinChallenge={(challengeId) => {
            console.log('Joining challenge:', challengeId);
          }}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={4}>
        <SocialHub 
          studyGroups={studyGroups}
          friends={userProfile?.friends || []}
          onJoinGroup={(groupId) => {
            console.log('Joining group:', groupId);
          }}
        />
      </TabPanel>

      <TabPanel value={currentTab} index={5}>
        <StoryProgress 
          storyContinuation={storyContinuation}
          onContinueStory={() => {
            console.log('Continuing story');
          }}
        />
      </TabPanel>
    </Box>
  );
};

// ダッシュボードコンテンツコンポーネント
const DashboardContent: React.FC<{
  levelProgress: any;
  recentActivity: any[];
  skillProgress: any;
}> = ({ levelProgress, recentActivity, skillProgress }) => {
  return (
    <Grid container spacing={3}>
      {/* スキル進捗 */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <BrainIcon sx={{ mr: 1, color: '#9C27B0' }} />
              スキル習熟度
            </Typography>
            
            {Object.entries(skillProgress).map(([skill, progress]: [string, any]) => (
              <Box key={skill} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{skill}</Typography>
                  <Typography variant="body2">{progress}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* 最近の活動 */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TimelineIcon sx={{ mr: 1, color: '#2196F3' }} />
              最近の活動
            </Typography>
            
            <List>
              {recentActivity.map((activity, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: activity.color }}>
                      {activity.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={activity.timestamp}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* 今日の目標 */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ mr: 1, color: '#FFD700' }} />
              今日の目標
            </Typography>
            
            <Grid container spacing={2}>
              {[
                { label: '教材完了', current: 2, target: 3, icon: '📚' },
                { label: '学習時間', current: 45, target: 60, icon: '⏰' },
                { label: '正答率', current: 85, target: 90, icon: '🎯' }
              ].map((goal, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {goal.icon}
                    </Typography>
                    <Typography variant="h6">
                      {goal.current} / {goal.target}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {goal.label}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(goal.current / goal.target) * 100}
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// バッジコレクションコンポーネント
const BadgeCollection: React.FC<{
  badges: any[];
  showAnimation: boolean;
}> = ({ badges, showAnimation }) => {
  return (
    <Grid container spacing={2}>
      {badges.map((badge, index) => (
        <Grid item xs={6} sm={4} md={3} key={badge.id}>
          <Fade in={true} timeout={1000 + index * 200}>
            <Card sx={{ 
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4
              }
            }}>
              <CardContent>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  {badge.icon}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, fontSize: '0.9rem' }}>
                  {badge.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {badge.description}
                </Typography>
                <Chip 
                  label={badge.rarity}
                  size="small"
                  sx={{ 
                    mt: 1,
                    bgcolor: badge.rarityColor,
                    color: 'white'
                  }}
                />
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      ))}
    </Grid>
  );
};

// リーダーボードビューコンポーネント
const LeaderboardView: React.FC<{
  data: any[];
  userRank?: number;
}> = ({ data, userRank }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <LeaderboardIcon sx={{ mr: 1, color: '#FFD700' }} />
          今週のランキング
        </Typography>
        
        <List>
          {data.map((entry, index) => (
            <React.Fragment key={entry.id}>
              <ListItem sx={{
                bgcolor: entry.rank === userRank ? 'primary.light' : 'transparent',
                borderRadius: 1,
                mb: 1
              }}>
                <ListItemAvatar>
                  <Badge
                    badgeContent={entry.rank}
                    color={entry.rank <= 3 ? 'secondary' : 'default'}
                  >
                    <Avatar src={entry.avatar}>
                      {entry.displayName[0]}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={entry.displayName}
                  secondary={`${entry.score} XP`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {entry.trend === 'up' && <TrendingUpIcon color="success" />}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    #{entry.rank}
                  </Typography>
                </Box>
              </ListItem>
              {index < data.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// チャレンジハブコンポーネント
const ChallengeHub: React.FC<{
  challenges: any[];
  onJoinChallenge: (challengeId: string) => void;
}> = ({ challenges, onJoinChallenge }) => {
  return (
    <Grid container spacing={2}>
      {challenges.map((challenge) => (
        <Grid item xs={12} md={6} key={challenge.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  {challenge.title}
                </Typography>
                <Chip 
                  label={challenge.difficulty}
                  color={challenge.difficulty === 'beginner' ? 'success' : 
                         challenge.difficulty === 'intermediate' ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {challenge.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {challenge.participantCount} 人参加中
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  残り時間: {challenge.timeRemaining}
                </Typography>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => onJoinChallenge(challenge.id)}
                >
                  参加する
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// ソーシャルハブコンポーネント
const SocialHub: React.FC<{
  studyGroups: any[];
  friends: any[];
  onJoinGroup: (groupId: string) => void;
}> = ({ studyGroups, friends, onJoinGroup }) => {
  return (
    <Grid container spacing={3}>
      {/* 学習グループ */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <GroupsIcon sx={{ mr: 1, color: '#2196F3' }} />
              学習グループ
            </Typography>
            
            {studyGroups.map((group) => (
              <Paper key={group.id} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {group.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {group.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {group.memberCount} / {group.maxMembers} メンバー
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => onJoinGroup(group.id)}
                  >
                    参加
                  </Button>
                </Box>
              </Paper>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* フレンド */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <HeartIcon sx={{ mr: 1, color: '#E91E63' }} />
              学習仲間
            </Typography>
            
            <List>
              {friends.map((friend) => (
                <ListItem key={friend.id}>
                  <ListItemAvatar>
                    <Badge
                      color="success"
                      variant="dot"
                      invisible={!friend.isOnline}
                    >
                      <Avatar src={friend.avatar}>
                        {friend.displayName[0]}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.displayName}
                    secondary={friend.isOnline ? 'オンライン' : `最終ログイン: ${friend.lastSeen}`}
                  />
                  <IconButton size="small">
                    <Typography variant="body2">💬</Typography>
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// ストーリー進行コンポーネント
const StoryProgress: React.FC<{
  storyContinuation: any;
  onContinueStory: () => void;
}> = ({ storyContinuation, onContinueStory }) => {
  if (!storyContinuation) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h2" sx={{ mb: 2 }}>📚</Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            まだストーリーが始まっていません
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            学習を進めると、あなただけの冒険物語が始まります！
          </Typography>
          <Button variant="contained" onClick={onContinueStory}>
            ストーリーを開始
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <MagicIcon sx={{ mr: 1, color: '#9C27B0' }} />
          {storyContinuation.title}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
          {storyContinuation.currentText}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            進行度: {storyContinuation.progressPercentage}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={storyContinuation.progressPercentage}
            sx={{ width: '200px', height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Button 
          variant="contained" 
          fullWidth
          onClick={onContinueStory}
          sx={{
            background: 'linear-gradient(45deg, #9C27B0, #E91E63)',
            '&:hover': {
              background: 'linear-gradient(45deg, #8E24AA, #D81B60)',
            }
          }}
        >
          冒険を続ける
        </Button>
      </CardContent>
    </Card>
  );
};

// モックデータ
const mockUserProfile = {
  displayName: '学習探検家',
  avatar: '🎓',
  hasLeveledUp: false,
  currentStreak: 7,
  masteryScore: 78,
  currentRank: 15,
  friends: [
    { id: '1', displayName: '数学マスター', avatar: '🧮', isOnline: true },
    { id: '2', displayName: '理科博士', avatar: '🔬', isOnline: false, lastSeen: '1時間前' }
  ],
  recentActivity: [
    { title: '分数の視覚化を完了', timestamp: '30分前', icon: '🎯', color: '#4CAF50' },
    { title: '新しいバッジを獲得', timestamp: '1時間前', icon: '🏆', color: '#FFD700' },
    { title: '学習グループに参加', timestamp: '2時間前', icon: '👥', color: '#2196F3' }
  ],
  skillProgress: {
    '問題解決': 85,
    '創造性': 72,
    '協力': 90,
    '持続力': 68
  }
};

const mockLevelProgress = {
  overallLevel: 12,
  currentXP: 2850,
  nextLevelXP: 3200
};

const mockRecentBadges = [
  { id: '1', name: '分数マスター', description: '分数を完全理解', icon: '🍰', rarity: 'Rare', rarityColor: '#9C27B0' },
  { id: '2', name: '毎日学習者', description: '7日連続学習', icon: '📅', rarity: 'Common', rarityColor: '#4CAF50' },
  { id: '3', name: 'ヘルパー', description: '仲間を5回支援', icon: '🤝', rarity: 'Epic', rarityColor: '#FF9800' }
];

const mockLeaderboardData = [
  { id: '1', rank: 1, displayName: '学習王', score: 5420, trend: 'up', avatar: '' },
  { id: '2', rank: 2, displayName: '知識の探検家', score: 5180, trend: 'up', avatar: '' },
  { id: '3', rank: 3, displayName: '努力の天才', score: 4950, trend: 'stable', avatar: '' }
];

const mockChallenges = [
  {
    id: '1',
    title: '速算チャレンジ',
    description: '制限時間内に計算問題を解こう！',
    difficulty: 'intermediate',
    participantCount: 24,
    timeRemaining: '2日 3時間'
  },
  {
    id: '2',
    title: '創作物語コンテスト',
    description: '科学をテーマにした物語を作ろう',
    difficulty: 'advanced',
    participantCount: 12,
    timeRemaining: '5日 12時間'
  }
];

const mockStudyGroups = [
  {
    id: '1',
    name: '算数探検隊',
    description: '楽しく算数を学ぼう！',
    memberCount: 8,
    maxMembers: 12
  },
  {
    id: '2',
    name: '理科実験クラブ',
    description: '一緒に実験して発見しよう',
    memberCount: 6,
    maxMembers: 10
  }
];

const mockStoryContinuation = {
  title: '銀河系学習探検隊',
  currentText: 'あなたは宇宙ステーション・ラーニングで基礎訓練を終え、いよいよ最初の惑星探検に向かいます。数学惑星マセマティカが輝いて見えます。そこで新しい発見が待っているでしょうか？',
  progressPercentage: 35
};

export default GamificationDashboard;