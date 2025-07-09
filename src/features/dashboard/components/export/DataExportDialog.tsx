import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  DataObject as JsonIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useLearningAnalytics } from '../../hooks/useLearningAnalytics';
import { exportDataService } from '../../services/exportDataService';
import type { ExportData } from '../../types';

interface DataExportDialogProps {
  open: boolean;
  onClose: () => void;
}

const DataExportDialog: React.FC<DataExportDialogProps> = ({ open, onClose }) => {
  const [format, setFormat] = useState<ExportData['format']>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  
  const { selectedRole, timeRange } = useDashboardStore();
  const { analyticsData, summary } = useLearningAnalytics();
  
  const handleExport = async () => {
    if (!analyticsData || !summary) {
      setExportError('エクスポートするデータがありません');
      return;
    }
    
    setIsExporting(true);
    setExportError(null);
    
    try {
      const exportConfig: ExportData = {
        format,
        dateRange: timeRange,
        includeCharts,
        includeRawData,
        generatedAt: new Date()
      };
      
      await exportDataService.exportData(analyticsData, summary, exportConfig, selectedRole);
      
      // エクスポート成功
      onClose();
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };
  
  const getFormatIcon = (formatType: ExportData['format']) => {
    switch (formatType) {
      case 'pdf':
        return <PdfIcon />;
      case 'csv':
        return <CsvIcon />;
      case 'json':
        return <JsonIcon />;
      default:
        return <DownloadIcon />;
    }
  };
  
  const getFormatDescription = (formatType: ExportData['format']) => {
    switch (formatType) {
      case 'pdf':
        return '印刷やプレゼンテーションに適した形式';
      case 'csv':
        return 'ExcelやGoogleシートで開ける形式';
      case 'json':
        return 'プログラムで処理しやすい形式';
      default:
        return '';
    }
  };
  
  const getEstimatedFileSize = () => {
    if (!analyticsData) return '不明';
    
    const baseSize = {
      pdf: 500,
      csv: 50,
      json: 100
    };
    
    let size = baseSize[format];
    if (includeCharts) size += 200;
    if (includeRawData) size += 300;
    
    return size > 1000 ? `${(size / 1000).toFixed(1)}MB` : `${size}KB`;
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            データエクスポート
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* フォーマット選択 */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                <Typography variant="subtitle1" gutterBottom>
                  エクスポート形式
                </Typography>
              </FormLabel>
              <RadioGroup
                value={format}
                onChange={(e) => setFormat(e.target.value as ExportData['format'])}
              >
                <FormControlLabel
                  value="pdf"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center">
                      <PdfIcon sx={{ mr: 1, color: 'error.main' }} />
                      <Box>
                        <Typography variant="body1">PDF</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getFormatDescription('pdf')}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="csv"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center">
                      <CsvIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Box>
                        <Typography variant="body1">CSV</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getFormatDescription('csv')}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="json"
                  control={<Radio />}
                  label={
                    <Box display="flex" alignItems="center">
                      <JsonIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Box>
                        <Typography variant="body1">JSON</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getFormatDescription('json')}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {/* オプション選択 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              含める内容
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <Typography variant="body2">
                    グラフ・チャート
                  </Typography>
                  <Tooltip title="学習時間推移、正答率グラフなどを含める">
                    <InfoIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <Typography variant="body2">
                    詳細データ
                  </Typography>
                  <Tooltip title="学習記録の詳細データを含める（ファイルサイズが大きくなります）">
                    <InfoIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              }
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {/* エクスポート情報 */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                エクスポート情報
              </Typography>
              <Box display="flex" gap={1} mb={1}>
                <Chip
                  label={`期間: ${timeRange.preset || 'カスタム'}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`対象: ${selectedRole === 'student' ? '生徒' : selectedRole === 'parent' ? '保護者' : '教師'}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`推定サイズ: ${getEstimatedFileSize()}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
              
              {format === 'pdf' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    PDFファイルは印刷やプレゼンテーションに適しています。
                    グラフを含む場合、生成に時間がかかる場合があります。
                  </Typography>
                </Alert>
              )}
              
              {format === 'csv' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    CSVファイルはExcelやGoogleシートで開けます。
                    グラフは含まれず、データのみがエクスポートされます。
                  </Typography>
                </Alert>
              )}
              
              {format === 'json' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    JSONファイルはプログラムでの処理に適しています。
                    すべてのデータが構造化された形式で出力されます。
                  </Typography>
                </Alert>
              )}
            </Box>
          </Grid>
          
          {/* エラー表示 */}
          {exportError && (
            <Grid item xs={12}>
              <Alert severity="error">
                {exportError}
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          キャンセル
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={isExporting || !analyticsData}
          startIcon={
            isExporting ? (
              <CircularProgress size={16} />
            ) : (
              getFormatIcon(format)
            )
          }
        >
          {isExporting ? 'エクスポート中...' : 'エクスポート'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataExportDialog;