/**
 * 数式セキュリティユーティリティ
 * 教育プラットフォーム用の安全な数式評価機能を提供
 */

import { evaluate, parse } from 'mathjs';

/**
 * 許可される数学関数のホワイトリスト
 * 教育目的に必要な関数のみを許可
 */
const ALLOWED_FUNCTIONS = [
  // 基本演算
  'add', 'subtract', 'multiply', 'divide', 'mod', 'pow',
  // 三角関数
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
  'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
  // 指数・対数
  'exp', 'log', 'log10', 'log2', 'sqrt', 'cbrt',
  // その他の数学関数
  'abs', 'sign', 'ceil', 'floor', 'round',
  'min', 'max', 'factorial',
  // 定数
  'pi', 'e', 'tau', 'phi',
];

/**
 * 禁止されるパターン（セキュリティリスクのある文字列）
 */
const FORBIDDEN_PATTERNS = [
  // JavaScriptキーワード
  /\b(eval|function|Function|constructor|prototype|__proto__|window|document|alert|prompt|confirm)\b/gi,
  // 危険な文字の組み合わせ
  /[`${}]/g,
  // HTMLタグ
  /<[^>]*>/g,
  // スクリプトインジェクション
  /script|javascript:|vbscript:|onload|onerror|onclick/gi,
];

/**
 * 数式の安全性を検証
 * @param expression - 検証する数式
 * @returns 安全性チェックの結果
 */
export function validateMathExpression(expression: string): {
  isValid: boolean;
  error?: string;
  sanitized?: string;
} {
  // 空文字チェック
  if (!expression || expression.trim().length === 0) {
    return { isValid: false, error: '数式を入力してください' };
  }

  // 長さ制限（DoS対策）
  if (expression.length > 200) {
    return { isValid: false, error: '数式が長すぎます（200文字以内）' };
  }

  // 禁止パターンのチェック
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(expression)) {
      return { 
        isValid: false, 
        error: '使用できない文字またはキーワードが含まれています' 
      };
    }
  }

  // 基本的な構文チェック
  try {
    // math.jsでパース（実行はしない）
    const node = parse(expression);
    
    // ASTを走査して許可されない関数をチェック
    const usedFunctions = new Set<string>();
    node.traverse((node) => {
      if (node.type === 'FunctionNode' && node.fn) {
        usedFunctions.add(node.fn.name || node.fn.toString());
      }
    });

    // 使用されている関数が全て許可リストに含まれているか確認
    for (const func of usedFunctions) {
      if (!ALLOWED_FUNCTIONS.includes(func)) {
        return {
          isValid: false,
          error: `関数 '${func}' は使用できません`
        };
      }
    }

    return { 
      isValid: true, 
      sanitized: expression.trim() 
    };
  } catch (error) {
    return {
      isValid: false,
      error: '数式の形式が正しくありません'
    };
  }
}

/**
 * 安全な数式評価関数を作成
 * @param expression - 評価する数式
 * @returns 評価関数
 */
export function createSafeMathFunction(expression: string): {
  evaluate: (x: number) => number;
  isValid: boolean;
  error?: string;
} {
  const validation = validateMathExpression(expression);
  
  if (!validation.isValid) {
    return {
      evaluate: () => 0,
      isValid: false,
      error: validation.error
    };
  }

  const safeExpression = validation.sanitized!;
  
  return {
    evaluate: (x: number): number => {
      try {
        // 数値以外の入力を防ぐ
        if (typeof x !== 'number' || !isFinite(x)) {
          return 0;
        }

        // math.jsで安全に評価
        const result = evaluate(safeExpression, { x });
        
        // 結果の検証
        if (typeof result === 'number' && isFinite(result)) {
          return result;
        }
        
        return 0;
      } catch (error) {
        // 実行時エラーは0を返す
        return 0;
      }
    },
    isValid: true
  };
}

/**
 * 教育的なエラーメッセージを生成
 * @param error - エラー内容
 * @returns ユーザーフレンドリーなメッセージ
 */
export function getEducationalErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    '数式を入力してください': '数式を入力してみましょう。例: x^2, sin(x), 2*x+1',
    '数式が長すぎます': '数式は200文字以内で入力してください',
    '使用できない文字またはキーワードが含まれています': 
      '数学的な式のみ入力できます。プログラムコードは使用できません',
    '数式の形式が正しくありません': 
      '数式の書き方を確認してください。括弧の対応や演算子の位置に注意しましょう',
  };

  // 関数エラーの場合
  if (error.includes('関数') && error.includes('は使用できません')) {
    const funcMatch = error.match(/'([^']+)'/);
    const funcName = funcMatch ? funcMatch[1] : '不明な関数';
    return `関数 '${funcName}' は使用できません。使える関数: sin, cos, exp, log, sqrt など`;
  }

  return errorMessages[error] || error;
}

/**
 * 数式の複雑度を計算（教育的フィードバック用）
 * @param expression - 評価する数式
 * @returns 複雑度レベル
 */
export function calculateComplexity(expression: string): {
  level: 'basic' | 'intermediate' | 'advanced';
  score: number;
  feedback: string;
} {
  try {
    const node = parse(expression);
    let complexity = 0;
    let depth = 0;
    let maxDepth = 0;

    node.traverse((node, path, parent) => {
      // 深さを追跡
      if (parent) depth++;
      maxDepth = Math.max(maxDepth, depth);
      
      // ノードタイプによる複雑度加算
      switch (node.type) {
        case 'FunctionNode':
          complexity += 2;
          break;
        case 'OperatorNode':
          complexity += 1;
          break;
        case 'ParenthesisNode':
          complexity += 0.5;
          break;
      }
      
      if (!parent) depth = 0;
    });

    complexity += maxDepth * 0.5;

    if (complexity <= 3) {
      return {
        level: 'basic',
        score: complexity,
        feedback: '基本的な数式です。よくできました！'
      };
    } else if (complexity <= 7) {
      return {
        level: 'intermediate',
        score: complexity,
        feedback: '中級レベルの数式です。数学的思考が深まっていますね！'
      };
    } else {
      return {
        level: 'advanced',
        score: complexity,
        feedback: '高度な数式です。複雑な関数の組み合わせを理解していますね！'
      };
    }
  } catch {
    return {
      level: 'basic',
      score: 0,
      feedback: '数式を評価できませんでした'
    };
  }
}