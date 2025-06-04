import { useState } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Chip,
  Box
} from '@mui/material';
import type { GradeLevel } from '../../../types';
import { GRADE_LEVEL_LABELS } from '../../../utils/constants';

// なぜこのコンポーネントが必要か：
// 1. 学年選択を統一的なUIで提供
// 2. 学年をグループ化して見やすく表示
// 3. 選択した学年に応じてテーマが自動的に切り替わる

interface GradeSelectorProps {
  value?: GradeLevel;
  onChange?: (gradeLevel: GradeLevel) => void;
  // コンパクト表示（ヘッダーなどで使用）
  compact?: boolean;
  disabled?: boolean;
}

export const GradeSelector = ({ 
  value, 
  onChange, 
  compact = false,
  disabled = false 
}: GradeSelectorProps) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | ''>(value || '');

  // 学年をグループ化して表示するためのデータ構造
  const gradeGroups = [
    {
      label: '小学校',
      grades: ['elementary1', 'elementary2', 'elementary3', 'elementary4', 'elementary5', 'elementary6'] as GradeLevel[],
      color: '#FF6B6B' as const, // 小学生向けの明るい色
    },
    {
      label: '中学校',
      grades: ['juniorHigh1', 'juniorHigh2', 'juniorHigh3'] as GradeLevel[],
      color: '#3F51B5' as const, // 中学生向けの標準的な色
    },
    {
      label: '高校',
      grades: ['highSchool1', 'highSchool2', 'highSchool3'] as GradeLevel[],
      color: '#1976D2' as const, // 高校生向けのプロフェッショナルな色
    },
  ];

  const handleChange = (event: SelectChangeEvent) => {
    const newGrade = event.target.value as GradeLevel;
    setSelectedGrade(newGrade);
    onChange?.(newGrade);
  };

  // コンパクト表示の場合はChipで表示
  if (compact && selectedGrade) {
    const groupColor = gradeGroups.find(group => 
      group.grades.includes(selectedGrade as GradeLevel)
    )?.color || '#000';

    return (
      <Chip
        label={GRADE_LEVEL_LABELS[selectedGrade as GradeLevel]}
        size="small"
        sx={{ 
          backgroundColor: groupColor,
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    );
  }

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="grade-selector-label">学年を選択</InputLabel>
      <Select
        labelId="grade-selector-label"
        id="grade-selector"
        value={selectedGrade}
        label="学年を選択"
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>選択してください</em>
        </MenuItem>
        
        {gradeGroups.map((group) => [
          // グループヘッダー（選択不可）
          <MenuItem
            key={`group-${group.label}`}
            disabled
            sx={{
              backgroundColor: group.color,
              color: 'white',
              fontWeight: 'bold',
              '&.Mui-disabled': {
                opacity: 1,
              },
            }}
          >
            {group.label}
          </MenuItem>,
          // 各学年
          ...group.grades.map((grade) => (
            <MenuItem
              key={grade}
              value={grade}
              sx={{ pl: 4 }} // インデントで階層を表現
            >
              {GRADE_LEVEL_LABELS[grade]}
            </MenuItem>
          )),
        ])}
      </Select>
    </FormControl>
  );
};