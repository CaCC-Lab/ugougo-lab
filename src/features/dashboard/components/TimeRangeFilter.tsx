import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Popover,
  TextField,
  Stack,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useDashboardStore } from '../stores/dashboardStore';
import { type TimeRange } from '../types';

const presetRanges: { label: string; value: TimeRange['preset']; getDates: () => { start: Date; end: Date } }[] = [
  {
    label: '週間',
    value: 'week',
    getDates: () => ({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    })
  },
  {
    label: '月間',
    value: 'month',
    getDates: () => ({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    })
  },
  {
    label: '3ヶ月',
    value: 'quarter',
    getDates: () => ({
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date()
    })
  },
  {
    label: '年間',
    value: 'year',
    getDates: () => ({
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      end: new Date()
    })
  }
];

const TimeRangeFilter: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { timeRange, setTimeRange } = useDashboardStore();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [customStart, setCustomStart] = useState(timeRange.start.toISOString().split('T')[0]);
  const [customEnd, setCustomEnd] = useState(timeRange.end.toISOString().split('T')[0]);
  
  const handlePresetClick = (preset: typeof presetRanges[0]) => {
    const dates = preset.getDates();
    setTimeRange({
      ...dates,
      preset: preset.value
    });
  };
  
  const handleCustomRangeOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCustomRangeClose = () => {
    setAnchorEl(null);
  };
  
  const handleCustomRangeApply = () => {
    setTimeRange({
      start: new Date(customStart),
      end: new Date(customEnd),
      preset: 'custom'
    });
    handleCustomRangeClose();
  };
  
  const open = Boolean(anchorEl);
  
  return (
    <Box>
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={1}
        alignItems={isMobile ? 'stretch' : 'center'}
      >
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
          期間選択:
        </Typography>
        
        <ButtonGroup
          variant="outlined"
          size="small"
          orientation={isMobile ? 'vertical' : 'horizontal'}
          fullWidth={isMobile}
        >
          {presetRanges.map((preset) => (
            <Button
              key={preset.value}
              onClick={() => handlePresetClick(preset)}
              variant={timeRange.preset === preset.value ? 'contained' : 'outlined'}
              sx={{
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                py: isMobile ? 1.5 : 1
              }}
            >
              {preset.label}
            </Button>
          ))}
          
          <Button
            onClick={handleCustomRangeOpen}
            variant={timeRange.preset === 'custom' ? 'contained' : 'outlined'}
            startIcon={<CalendarIcon />}
            sx={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              py: isMobile ? 1.5 : 1
            }}
          >
            カスタム
          </Button>
        </ButtonGroup>
        
        {!isMobile && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            {timeRange.start.toLocaleDateString('ja-JP')} 〜 {timeRange.end.toLocaleDateString('ja-JP')}
          </Typography>
        )}
      </Stack>
      
      {isMobile && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1, textAlign: 'center' }}
        >
          {timeRange.start.toLocaleDateString('ja-JP')} 〜 {timeRange.end.toLocaleDateString('ja-JP')}
        </Typography>
      )}
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCustomRangeClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            カスタム期間の設定
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="開始日"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="終了日"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: customStart
              }}
            />
            
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button size="small" onClick={handleCustomRangeClose}>
                キャンセル
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleCustomRangeApply}
                disabled={!customStart || !customEnd || customStart > customEnd}
              >
                適用
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
};

export default TimeRangeFilter;