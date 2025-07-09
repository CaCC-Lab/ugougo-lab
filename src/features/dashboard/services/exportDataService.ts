import type { 
  LearningAnalytics, 
  LearningRecord, 
  LearningProgress,
  AnalyticsSummary,
  ExportData 
} from '../types';

export class ExportDataService {
  /**
   * データをエクスポートする
   */
  async exportData(
    analyticsData: LearningAnalytics,
    summary: AnalyticsSummary,
    config: ExportData,
    role: 'student' | 'parent' | 'teacher'
  ): Promise<void> {
    try {
      switch (config.format) {
        case 'pdf':
          await this.exportToPDF(analyticsData, summary, config, role);
          break;
        case 'csv':
          await this.exportToCSV(analyticsData, summary, config, role);
          break;
        case 'json':
          await this.exportToJSON(analyticsData, summary, config, role);
          break;
        default:
          throw new Error(`未対応のエクスポート形式: ${config.format}`);
      }
    } catch (error) {
      throw new Error(`エクスポートに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * PDFとしてエクスポート（ブラウザの印刷機能を使用）
   */
  private async exportToPDF(
    analyticsData: LearningAnalytics,
    summary: AnalyticsSummary,
    config: ExportData,
    role: 'student' | 'parent' | 'teacher'
  ): Promise<void> {
    // PDF用のHTMLコンテンツを生成
    const htmlContent = this.generatePDFContent(analyticsData, summary, config, role);
    
    // 新しいウィンドウを開いてPDF生成
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error('ポップアップがブロックされました。ポップアップを許可してからお試しください。');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // 印刷ダイアログを表示
    printWindow.focus();
    printWindow.print();
    
    // 印刷後にウィンドウを閉じる
    setTimeout(() => {
      printWindow.close();
    }, 500);
  }

  /**
   * CSVとしてエクスポート
   */
  private async exportToCSV(
    analyticsData: LearningAnalytics,
    summary: AnalyticsSummary,
    config: ExportData,
    role: 'student' | 'parent' | 'teacher'
  ): Promise<void> {
    const csvData = this.generateCSVContent(analyticsData, summary, config, role);
    const filename = this.generateFileName('csv', role);
    
    this.downloadFile(csvData, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * JSONとしてエクスポート
   */
  private async exportToJSON(
    analyticsData: LearningAnalytics,
    summary: AnalyticsSummary,
    config: ExportData,
    role: 'student' | 'parent' | 'teacher'
  ): Promise<void> {
    const jsonData = this.generateJSONContent(analyticsData, summary, config, role);
    const filename = this.generateFileName('json', role);
    
    this.downloadFile(jsonData, filename, 'application/json;charset=utf-8;');
  }

  /**
   * PDF用のHTMLコンテンツを生成
   */
  private generatePDFContent(
    analyticsData: LearningAnalytics,
    summary: AnalyticsSummary,
    config: ExportData,
    role: 'student' | 'parent' | 'teacher'
  ): string {
    const roleTitle = {
      student: '生徒',
      parent: '保護者',
      teacher: '教師'
    }[role];

    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>学習分析レポート - ${roleTitle}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1976d2;
        }
        .summary {
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .metric {
            display: inline-block;
            margin: 10px 20px;
            text-align: center;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #1976d2;
        }
        .metric-label {
            font-size: 0.9em;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1976d2;
            border-left: 4px solid #1976d2;
            padding-left: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 0.9em;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>学習分析レポート</h1>
        <h2>${roleTitle}用ダッシュボード</h2>
        <p>期間: ${config.dateRange.start ? new Date(config.dateRange.start).toLocaleDateString('ja-JP') : '全期間'} 〜 ${config.dateRange.end ? new Date(config.dateRange.end).toLocaleDateString('ja-JP') : '現在'}</p>
        <p>出力日時: ${config.generatedAt.toLocaleDateString('ja-JP')} ${config.generatedAt.toLocaleTimeString('ja-JP')}</p>
    </div>

    <div class="summary">
        <h3>サマリー</h3>
        <div class="metric">
            <div class="metric-value">${summary.totalHours}</div>
            <div class="metric-label">総学習時間（時間）</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.averageAccuracy}%</div>
            <div class="metric-label">平均正答率</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.streakDays}</div>
            <div class="metric-label">連続学習日数</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.completedMaterials}</div>
            <div class="metric-label">完了教材数</div>
        </div>
    </div>

    ${config.includeRawData ? this.generateRawDataSection(analyticsData) : ''}

    <div class="footer">
        <p>ウゴウゴラボ 学習分析システム</p>
        <p>このレポートは自動生成されました</p>
    </div>
</body>
</html>`;
  }

  /**
   * 詳細データセクションを生成
   */
  private generateRawDataSection(analyticsData: LearningAnalytics): string {
    const recentRecords = analyticsData.records.slice(-10); // 最新10件

    return `
    <div class="section">
        <div class="section-title">最近の学習記録</div>
        <table>
            <thead>
                <tr>
                    <th>日時</th>
                    <th>教材名</th>
                    <th>正答率</th>
                    <th>学習時間</th>
                </tr>
            </thead>
            <tbody>
                ${recentRecords.map(record => `
                    <tr>
                        <td>${new Date(record.timestamp).toLocaleDateString('ja-JP')}</td>
                        <td>${record.materialId}</td>
                        <td>${Math.round(record.accuracy * 100)}%</td>
                        <td>${Math.round(record.timeSpent / 60)}分</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">教材別進捗</div>
        <table>
            <thead>
                <tr>
                    <th>教材名</th>
                    <th>習熟度</th>
                    <th>学習回数</th>
                    <th>総学習時間</th>
                </tr>
            </thead>
            <tbody>
                ${analyticsData.progress.map(progress => `
                    <tr>
                        <td>${progress.materialId}</td>
                        <td>${Math.round(progress.masteryLevel * 100)}%</td>
                        <td>${progress.attempts}回</td>
                        <td>${Math.round(progress.totalTimeSpent / 60)}分</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
  }

  /**
   * CSV形式のコンテンツを生成
   */
  private generateCSVContent(
    analyticsData: LearningAnalytics,
    summary: AnalyticsSummary,
    config: ExportData,
    role: 'student' | 'parent' | 'teacher'
  ): string {
    const lines: string[] = [];
    
    // ヘッダー情報
    lines.push(`学習分析レポート - ${role === 'student' ? '生徒' : role === 'parent' ? '保護者' : '教師'}`);
    lines.push(`出力日時,${config.generatedAt.toLocaleString('ja-JP')}`);
    lines.push(`期間,${config.dateRange.start ? new Date(config.dateRange.start).toLocaleDateString('ja-JP') : '全期間'} - ${config.dateRange.end ? new Date(config.dateRange.end).toLocaleDateString('ja-JP') : '現在'}`);
    lines.push(''); // 空行

    // サマリー
    lines.push('サマリー');
    lines.push('項目,値');
    lines.push(`総学習時間（時間）,${summary.totalHours}`);
    lines.push(`平均正答率（%）,${summary.averageAccuracy}`);
    lines.push(`連続学習日数,${summary.streakDays}`);
    lines.push(`完了教材数,${summary.completedMaterials}`);
    lines.push(''); // 空行

    if (config.includeRawData) {
      // 学習記録
      lines.push('学習記録');
      lines.push('日時,教材ID,正答率（%）,学習時間（分）,問題数,正解数');
      
      analyticsData.records.forEach(record => {
        lines.push([
          new Date(record.timestamp).toLocaleString('ja-JP'),
          record.materialId,
          Math.round(record.accuracy * 100),
          Math.round(record.timeSpent / 60),
          record.totalQuestions,
          record.correctAnswers
        ].join(','));
      });
      
      lines.push(''); // 空行

      // 教材別進捗
      lines.push('教材別進捗');
      lines.push('教材ID,習熟度（%）,学習回数,総学習時間（分）,最終学習日');
      
      analyticsData.progress.forEach(progress => {
        lines.push([
          progress.materialId,
          Math.round(progress.masteryLevel * 100),
          progress.attempts,
          Math.round(progress.totalTimeSpent / 60),
          new Date(progress.lastStudied).toLocaleDateString('ja-JP')
        ].join(','));
      });
    }

    return lines.join('\n');
  }

  /**
   * JSON形式のコンテンツを生成
   */
  private generateJSONContent(
    analyticsData: LearningAnalytics,
    summary: AnalyticsSummary,
    config: ExportData,
    role: 'student' | 'parent' | 'teacher'
  ): string {
    const exportData = {
      metadata: {
        exportedAt: config.generatedAt.toISOString(),
        exportedBy: role,
        dateRange: config.dateRange,
        includeCharts: config.includeCharts,
        includeRawData: config.includeRawData,
        version: '1.0'
      },
      summary,
      analytics: config.includeRawData ? analyticsData : {
        recordsCount: analyticsData.records.length,
        progressCount: analyticsData.progress.length,
        timeRange: analyticsData.timeRange
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * ファイル名を生成
   */
  private generateFileName(format: string, role: string): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const roleLabel = {
      student: '生徒',
      parent: '保護者', 
      teacher: '教師'
    }[role];
    
    return `学習分析レポート_${roleLabel}_${dateStr}.${format}`;
  }

  /**
   * ファイルをダウンロード
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // メモリリークを防ぐためURLを解放
    URL.revokeObjectURL(url);
  }
}

// シングルトンインスタンスをエクスポート
export const exportDataService = new ExportDataService();