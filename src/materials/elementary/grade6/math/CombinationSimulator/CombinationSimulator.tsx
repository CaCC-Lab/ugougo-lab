import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid, 
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Chip,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import { 
  AccountTree, 
  Calculate, 
  Shuffle,
  CheckCircle,
  School
} from '@mui/icons-material';
import { MaterialBase } from '@components/educational';
import { TreeDiagram } from './components/TreeDiagram';
import { PermutationVisualizer } from './components/PermutationVisualizer';
import { CombinationVisualizer } from './components/CombinationVisualizer';
import { ProblemExamples } from './components/ProblemExamples';
import { useCombinatorics } from './hooks/useCombinatorics';

type ProblemType = 'permutation' | 'combination';

interface Item {
  id: string;
  label: string;
  color: string;
  emoji: string;
}

const CombinationSimulator: React.FC = () => {
  const [problemType, setProblemType] = useState<ProblemType>('permutation');
  const [totalItems, setTotalItems] = useState(4);
  const [selectItems, setSelectItems] = useState(2);
  const [showTreeDiagram, setShowTreeDiagram] = useState(true);
  const [showCalculation, setShowCalculation] = useState(false);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const defaultItems: Item[] = [
    { id: 'A', label: 'A', color: '#FF6B6B', emoji: '🍎' },
    { id: 'B', label: 'B', color: '#4ECDC4', emoji: '🍌' },
    { id: 'C', label: 'C', color: '#45B7D1', emoji: '🍊' },
    { id: 'D', label: 'D', color: '#96CEB4', emoji: '🍇' },
    { id: 'E', label: 'E', color: '#FECA57', emoji: '🍓' },
  ];

  const [items, setItems] = useState<Item[]>(defaultItems.slice(0, totalItems));

  const { 
    calculatePermutation, 
    calculateCombination, 
    generatePermutations,
    generateCombinations,
    factorial
  } = useCombinatorics();

  useEffect(() => {
    setItems(defaultItems.slice(0, totalItems));
    if (selectItems > totalItems) {
      setSelectItems(totalItems);
    }
  }, [totalItems]);

  const handleProblemTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: ProblemType | null
  ) => {
    if (newType !== null) {
      setProblemType(newType);
    }
  };

  const getResult = () => {
    if (problemType === 'permutation') {
      return calculatePermutation(totalItems, selectItems);
    } else {
      return calculateCombination(totalItems, selectItems);
    }
  };

  const getAllPatterns = () => {
    if (problemType === 'permutation') {
      return generatePermutations(items, selectItems);
    } else {
      return generateCombinations(items, selectItems);
    }
  };

  const getCalculationSteps = () => {
    if (problemType === 'permutation') {
      return {
        formula: `P(${totalItems}, ${selectItems}) = ${totalItems}! / (${totalItems} - ${selectItems})!`,
        steps: [
          `= ${totalItems}! / ${totalItems - selectItems}!`,
          `= ${Array.from({length: selectItems}, (_, i) => totalItems - i).join(' × ')}`,
          `= ${getResult()}`
        ]
      };
    } else {
      return {
        formula: `C(${totalItems}, ${selectItems}) = ${totalItems}! / (${selectItems}! × (${totalItems} - ${selectItems})!)`,
        steps: [
          `= ${totalItems}! / (${selectItems}! × ${totalItems - selectItems}!)`,
          `= ${Array.from({length: selectItems}, (_, i) => totalItems - i).join(' × ')} / ${selectItems}!`,
          `= ${calculatePermutation(totalItems, selectItems)} / ${factorial(selectItems)}`,
          `= ${getResult()}`
        ]
      };
    }
  };

  return (
    <MaterialBase
      title="場合の数シミュレーター"
      description="順列と組み合わせを視覚的に理解しよう"
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              問題設定
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                問題の種類
              </Typography>
              <ToggleButtonGroup
                value={problemType}
                exclusive
                onChange={handleProblemTypeChange}
                aria-label="problem type"
                fullWidth
              >
                <ToggleButton value="permutation" aria-label="permutation">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Shuffle />
                    <Box>
                      <Typography variant="subtitle2">順列</Typography>
                      <Typography variant="caption" display="block">
                        並べる順番が重要
                      </Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="combination" aria-label="combination">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccountTree />
                    <Box>
                      <Typography variant="subtitle2">組み合わせ</Typography>
                      <Typography variant="caption" display="block">
                        選ぶだけで順番は関係ない
                      </Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  全体の個数: {totalItems}個
                </Typography>
                <Slider
                  value={totalItems}
                  onChange={(_, value) => setTotalItems(value as number)}
                  min={2}
                  max={5}
                  marks
                  valueLabelDisplay="auto"
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {items.map((item) => (
                    <Chip
                      key={item.id}
                      label={`${item.emoji} ${item.label}`}
                      sx={{ bgcolor: item.color, color: 'white' }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  選ぶ個数: {selectItems}個
                </Typography>
                <Slider
                  value={selectItems}
                  onChange={(_, value) => setSelectItems(value as number)}
                  min={1}
                  max={totalItems}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant={showTreeDiagram ? 'contained' : 'outlined'}
                startIcon={<AccountTree />}
                onClick={() => setShowTreeDiagram(!showTreeDiagram)}
                size="small"
              >
                樹形図
              </Button>
              <Button
                variant={showCalculation ? 'contained' : 'outlined'}
                startIcon={<Calculate />}
                onClick={() => setShowCalculation(!showCalculation)}
                size="small"
              >
                計算式
              </Button>
              <Button
                variant="outlined"
                startIcon={<School />}
                onClick={() => setSelectedExample(selectedExample ? null : 'default')}
                size="small"
              >
                例題
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, minHeight: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                {problemType === 'permutation' ? '順列' : '組み合わせ'}の結果
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" />
                <Typography variant="h5" color="primary">
                  {getResult()}通り
                </Typography>
              </Box>
            </Box>

            {showTreeDiagram && (
              <Box sx={{ mb: 3 }}>
                <TreeDiagram
                  items={items}
                  selectCount={selectItems}
                  problemType={problemType}
                />
              </Box>
            )}

            <Box>
              {problemType === 'permutation' ? (
                <PermutationVisualizer
                  items={items}
                  selectCount={selectItems}
                  patterns={getAllPatterns() as Item[][]}
                />
              ) : (
                <CombinationVisualizer
                  items={items}
                  selectCount={selectItems}
                  patterns={getAllPatterns() as Item[][]}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {showCalculation && (
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  計算方法
                </Typography>
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {getCalculationSteps().formula}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  計算過程：
                </Typography>
                {getCalculationSteps().steps.map((step, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{ ml: 2, fontFamily: 'monospace', mb: 0.5 }}
                  >
                    {step}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          )}

          {selectedExample && (
            <Box sx={{ mt: showCalculation ? 2 : 0 }}>
              <ProblemExamples
                problemType={problemType}
                onSelectExample={(example) => {
                  setTotalItems(example.total);
                  setSelectItems(example.select);
                }}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </MaterialBase>
  );
};

export default CombinationSimulator;