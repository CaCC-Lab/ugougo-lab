import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Organ } from '../HumanBodyAnimation';

interface OrganInfoProps {
  organ: Organ;
  onClose: () => void;
}

export const OrganInfo: React.FC<OrganInfoProps> = ({ organ, onClose }) => {
  const getOrganDetails = (organId: string) => {
    const details: { [key: string]: { emoji: string; facts: string[] } } = {
      heart: {
        emoji: '❤️',
        facts: [
          '1日に約10万回拍動します',
          '血液を全身に送るポンプの役割',
          '大きさは握りこぶしくらい',
          '4つの部屋（心房2つ、心室2つ）があります'
        ]
      },
      lungs: {
        emoji: '🫁',
        facts: [
          '左右合わせて約6億個の肺胞があります',
          '酸素を取り込み、二酸化炭素を出します',
          '表面積はテニスコート約半分',
          '1日に約2万回呼吸します'
        ]
      },
      stomach: {
        emoji: '🍽️',
        facts: [
          '胃液で食べ物を溶かします',
          '容量は約1.5リットル',
          '食べ物は2〜4時間滞在',
          'pH1〜2の強い酸性の胃液を分泌'
        ]
      },
      smallIntestine: {
        emoji: '🌀',
        facts: [
          '長さは約6〜7メートル',
          '栄養の90%以上をここで吸収',
          '内側には絨毛という突起がびっしり',
          '表面積は約200平方メートル'
        ]
      },
      liver: {
        emoji: '🟫',
        facts: [
          '体の中で最も大きな臓器',
          '500以上の働きがあります',
          '栄養を蓄えたり、毒を分解',
          '胆汁を作って脂肪の消化を助けます'
        ]
      }
    };

    return details[organId] || { emoji: '🏥', facts: ['臓器の情報'] };
  };

  const details = getOrganDetails(organ.id);

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4">{details.emoji}</Typography>
            <Typography variant="h6">
              {organ.name}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Typography variant="body2" paragraph>
          {organ.description}
        </Typography>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          主な働き
        </Typography>
        <Typography variant="body2" paragraph sx={{ 
          bgcolor: 'primary.light', 
          color: 'primary.contrastText',
          p: 1.5,
          borderRadius: 1
        }}>
          {organ.function}
        </Typography>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          豆知識
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {details.facts.map((fact, index) => (
            <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
              {fact}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};