import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Box,
  Chip
} from '@mui/material';
import {
  School as StudentIcon,
  FamilyRestroom as ParentIcon,
  SupervisorAccount as TeacherIcon
} from '@mui/icons-material';
import { useDashboardStore } from '../stores/dashboardStore';
import { type UserRole } from '../types';

const roleOptions: { value: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'student',
    label: '生徒',
    icon: <StudentIcon />,
    color: '#2196F3'
  },
  {
    value: 'parent',
    label: '保護者',
    icon: <ParentIcon />,
    color: '#4CAF50'
  },
  {
    value: 'teacher',
    label: '教師',
    icon: <TeacherIcon />,
    color: '#FF9800'
  }
];

const RoleSelector: React.FC = () => {
  const { selectedRole, setRole } = useDashboardStore();
  
  const handleChange = (event: SelectChangeEvent<UserRole>) => {
    setRole(event.target.value as UserRole);
  };
  
  const currentRole = roleOptions.find(r => r.value === selectedRole);
  
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="role-select-label">表示モード</InputLabel>
      <Select
        labelId="role-select-label"
        value={selectedRole}
        label="表示モード"
        onChange={handleChange}
        renderValue={(value) => {
          const role = roleOptions.find(r => r.value === value);
          return role ? (
            <Box display="flex" alignItems="center" gap={1}>
              {role.icon}
              <span>{role.label}モード</span>
            </Box>
          ) : value;
        }}
      >
        {roleOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  color: option.color,
                  minWidth: 24
                }}
              >
                {option.icon}
              </Box>
              <Box flex={1}>
                <Box fontWeight="medium">{option.label}モード</Box>
                <Box fontSize="0.75rem" color="text.secondary">
                  {option.value === 'student' && '個人の学習状況を詳細に確認'}
                  {option.value === 'parent' && '子供の学習進捗を把握'}
                  {option.value === 'teacher' && 'クラス全体の状況を管理'}
                </Box>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
      
      {currentRole && (
        <Box mt={1}>
          <Chip
            size="small"
            icon={currentRole.icon as React.ReactElement}
            label={`${currentRole.label}として表示中`}
            sx={{
              backgroundColor: `${currentRole.color}20`,
              color: currentRole.color,
              '& .MuiChip-icon': {
                color: currentRole.color
              }
            }}
          />
        </Box>
      )}
    </FormControl>
  );
};

export default RoleSelector;