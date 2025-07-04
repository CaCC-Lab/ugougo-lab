import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MaterialWrapper } from '../../../../../components/wrappers/MaterialWrapper';

// 各教材コンポーネント
import AdditionSubtractionContent from './AdditionSubtractionContent';
import MultiplicationContent from './MultiplicationContent';
import NumberBlocksContent from './NumberBlocksContent';

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
      id={`math-calculation-tabpanel-${index}`}
      aria-labelledby={`math-calculation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `math-calculation-tab-${index}`,
    'aria-controls': `math-calculation-tabpanel-${index}`,
  };
}

// MathCalculationMaster統合版コンポーネント（内部）
function MathCalculationMasterContent({ onClose }: { onClose: () => void }) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            計算マスター
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          たし算・ひき算・かけ算・数の合成を楽しく学ぼう！タブを切り替えて好きな計算を練習できます。
        </Typography>

        {/* タブ */}
        <Paper elevation={1} sx={{ bgcolor: 'background.default' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="計算マスタータブ"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: 60,
                fontSize: '1rem',
                fontWeight: 'bold',
              }
            }}
          >
            <Tab label="たし算・ひき算" {...a11yProps(0)} />
            <Tab label="かけ算九九" {...a11yProps(1)} />
            <Tab label="数の合成・分解" {...a11yProps(2)} />
          </Tabs>
        </Paper>
      </Box>

      {/* タブコンテンツ */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={tabValue} index={0}>
          <AdditionSubtractionContent />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <MultiplicationContent />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <NumberBlocksContent />
        </TabPanel>
      </Box>
    </Box>
  );
}

// MathCalculationMaster統合版（MaterialWrapperでラップ）
export default function MathCalculationMaster({ onClose }: { onClose: () => void }) {
  return (
    <MaterialWrapper
      materialId="math-calculation-master"
      materialName="計算マスター"
      showMetricsButton={true}
      showAssistant={true}
    >
      <MathCalculationMasterContent onClose={onClose} />
    </MaterialWrapper>
  );
}