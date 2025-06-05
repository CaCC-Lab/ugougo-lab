interface Item {
  id: string;
  label: string;
  color: string;
  emoji: string;
}

export const useCombinatorics = () => {
  // 階乗を計算
  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  // 順列の数を計算 P(n, r) = n! / (n-r)!
  const calculatePermutation = (n: number, r: number): number => {
    if (r > n) return 0;
    if (r === 0) return 1;
    
    let result = 1;
    for (let i = 0; i < r; i++) {
      result *= (n - i);
    }
    return result;
  };

  // 組み合わせの数を計算 C(n, r) = n! / (r! * (n-r)!)
  const calculateCombination = (n: number, r: number): number => {
    if (r > n) return 0;
    if (r === 0 || r === n) return 1;
    
    // 計算を効率化するため、r > n/2 の場合は C(n, n-r) を計算
    if (r > n - r) {
      r = n - r;
    }
    
    let result = 1;
    for (let i = 0; i < r; i++) {
      result *= (n - i);
      result /= (i + 1);
    }
    return Math.round(result);
  };

  // すべての順列を生成
  const generatePermutations = (items: Item[], r: number): Item[][] => {
    const result: Item[][] = [];
    
    const permute = (current: Item[], remaining: Item[]) => {
      if (current.length === r) {
        result.push([...current]);
        return;
      }
      
      for (let i = 0; i < remaining.length; i++) {
        const next = [...current, remaining[i]];
        const nextRemaining = remaining.filter((_, index) => index !== i);
        permute(next, nextRemaining);
      }
    };
    
    permute([], items);
    return result;
  };

  // すべての組み合わせを生成
  const generateCombinations = (items: Item[], r: number): Item[][] => {
    const result: Item[][] = [];
    
    const combine = (current: Item[], start: number) => {
      if (current.length === r) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < items.length; i++) {
        const next = [...current, items[i]];
        combine(next, i + 1);
      }
    };
    
    combine([], 0);
    return result;
  };

  return {
    factorial,
    calculatePermutation,
    calculateCombination,
    generatePermutations,
    generateCombinations
  };
};