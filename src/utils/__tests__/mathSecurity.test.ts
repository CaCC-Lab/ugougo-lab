/**
 * mathSecurity.ts のテストスイート
 * 数式セキュリティ機能の包括的なテスト
 */

import {
  validateMathExpression,
  createSafeMathFunction,
  getEducationalErrorMessage,
  calculateComplexity,
} from '../mathSecurity';

describe('validateMathExpression - 数式検証', () => {
  describe('正常系', () => {
    test('基本的な数式が有効と判定される', () => {
      const validExpressions = [
        'x',
        'x^2',
        '2*x + 1',
        'sin(x)',
        'cos(x) + sin(x)',
        'exp(x) - log(x)',
        'sqrt(x^2 + 1)',
        'abs(x) * sign(x)',
        'max(x, 0)',
        'pi * x',
      ];

      validExpressions.forEach((expr) => {
        const result = validateMathExpression(expr);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.sanitized).toBe(expr.trim());
      });
    });

    test('複雑な数式も有効と判定される', () => {
      const complexExpressions = [
        'sin(x)^2 + cos(x)^2',
        'exp(-x^2 / 2) / sqrt(2 * pi)',
        'log(abs(x) + 1) * sign(x)',
        'atan2(sin(x), cos(x))',
      ];

      complexExpressions.forEach((expr) => {
        const result = validateMathExpression(expr);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('異常系 - セキュリティ', () => {
    test('JavaScriptキーワードを含む式が拒否される', () => {
      const dangerousExpressions = [
        'eval("alert(1)")',
        'function() { return x }',
        'window.location = "evil.com"',
        'document.cookie',
        'alert("XSS")',
        'constructor.constructor("alert(1)")()',
        '__proto__.polluted = true',
      ];

      dangerousExpressions.forEach((expr) => {
        const result = validateMathExpression(expr);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('使用できない文字またはキーワードが含まれています');
      });
    });

    test('HTMLタグやスクリプトが拒否される', () => {
      const htmlInjections = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        'vbscript:msgbox(1)',
      ];

      htmlInjections.forEach((expr) => {
        const result = validateMathExpression(expr);
        expect(result.isValid).toBe(false);
      });
    });

    test('テンプレートリテラルが拒否される', () => {
      const templateLiterals = [
        '`${x}`',
        '${alert(1)}',
        '`hello ${world}`',
      ];

      templateLiterals.forEach((expr) => {
        const result = validateMathExpression(expr);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('異常系 - 入力検証', () => {
    test('空文字や空白のみの入力が拒否される', () => {
      const emptyInputs = ['', ' ', '   ', '\t', '\n'];

      emptyInputs.forEach((expr) => {
        const result = validateMathExpression(expr);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('数式を入力してください');
      });
    });

    test('長すぎる入力が拒否される', () => {
      const longExpression = 'x'.repeat(201);
      const result = validateMathExpression(longExpression);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('数式が長すぎます（200文字以内）');
    });

    test('許可されていない関数が拒否される', () => {
      const forbiddenFunctions = [
        'import(x)',
        'require(x)',
        'fetch(x)',
        'setTimeout(x)',
        'setInterval(x)',
      ];

      forbiddenFunctions.forEach((expr) => {
        const result = validateMathExpression(expr);
        expect(result.isValid).toBe(false);
        // エラーメッセージは関数名を含むか、一般的なエラー
        expect(result.error).toBeTruthy();
      });
    });

    test('不正な構文が拒否される', () => {
      const invalidSyntax = [
        'x +',
        '++x',
        'sin()',
        '(((',
        ')))',
        'x x',
        '* x',
      ];

      invalidSyntax.forEach((expr) => {
        const result = validateMathExpression(expr);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('数式の形式が正しくありません');
      });
    });
  });
});

describe('createSafeMathFunction - 安全な関数生成', () => {
  test('有効な数式から正しく動作する関数が生成される', () => {
    const testCases = [
      { expr: 'x^2', x: 2, expected: 4 },
      { expr: '2*x + 1', x: 3, expected: 7 },
      { expr: 'sin(0)', x: 0, expected: 0 },
      { expr: 'abs(-5)', x: 0, expected: 5 },
    ];

    testCases.forEach(({ expr, x, expected }) => {
      const result = createSafeMathFunction(expr);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.evaluate(x)).toBeCloseTo(expected, 5);
    });
  });

  test('無効な数式では常に0を返す関数が生成される', () => {
    const invalidExpressions = [
        'eval(x)',
        'alert(1)',
        '',
        'invalid syntax',
    ];

    invalidExpressions.forEach((expr) => {
      const result = createSafeMathFunction(expr);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.evaluate(1)).toBe(0);
      expect(result.evaluate(-1)).toBe(0);
      expect(result.evaluate(0)).toBe(0);
    });
  });

  test('数値以外の入力に対して0を返す', () => {
    const result = createSafeMathFunction('x^2');
    expect(result.isValid).toBe(true);
    
    // @ts-ignore - テストのため意図的に型を無視
    expect(result.evaluate('string')).toBe(0);
    // @ts-ignore
    expect(result.evaluate(null)).toBe(0);
    // @ts-ignore
    expect(result.evaluate(undefined)).toBe(0);
    expect(result.evaluate(NaN)).toBe(0);
    expect(result.evaluate(Infinity)).toBe(0);
    expect(result.evaluate(-Infinity)).toBe(0);
  });

  test('実行時エラーが発生しても0を返す', () => {
    // log(x) は x <= 0 で実行時エラー
    const result = createSafeMathFunction('log(x)');
    expect(result.isValid).toBe(true);
    expect(result.evaluate(-1)).toBe(0); // エラーなので0
    expect(result.evaluate(0)).toBe(0);  // エラーなので0
    expect(result.evaluate(1)).toBe(0);  // log(1) = 0
  });
});

describe('getEducationalErrorMessage - 教育的エラーメッセージ', () => {
  test('一般的なエラーに対して教育的なメッセージを返す', () => {
    const errorMap = [
      {
        error: '数式を入力してください',
        expected: '数式を入力してみましょう。例: x^2, sin(x), 2*x+1',
      },
      {
        error: '数式が長すぎます',
        expected: '数式は200文字以内で入力してください',
      },
      {
        error: '使用できない文字またはキーワードが含まれています',
        expected: '数学的な式のみ入力できます。プログラムコードは使用できません',
      },
      {
        error: '数式の形式が正しくありません',
        expected: '数式の書き方を確認してください。括弧の対応や演算子の位置に注意しましょう',
      },
    ];

    errorMap.forEach(({ error, expected }) => {
      expect(getEducationalErrorMessage(error)).toBe(expected);
    });
  });

  test('関数エラーに対して具体的なメッセージを返す', () => {
    const funcError = "関数 'foo' は使用できません";
    const message = getEducationalErrorMessage(funcError);
    expect(message).toContain("関数 'foo' は使用できません");
    expect(message).toContain('使える関数: sin, cos, exp, log, sqrt など');
  });

  test('未知のエラーはそのまま返す', () => {
    const unknownError = 'Some unknown error';
    expect(getEducationalErrorMessage(unknownError)).toBe(unknownError);
  });
});

describe('calculateComplexity - 数式複雑度計算', () => {
  test('基本的な数式は低い複雑度', () => {
    const basicExpressions = ['x', '2*x', 'x+1', 'x^2'];

    basicExpressions.forEach((expr) => {
      const result = calculateComplexity(expr);
      expect(result.level).toBe('basic');
      expect(result.score).toBeLessThanOrEqual(3);
      expect(result.feedback).toContain('基本的な数式');
    });
  });

  test('中程度の数式は中間の複雑度', () => {
    const intermediateExpressions = [
      'sin(x) + cos(x)',
      'exp(x) * log(x)',
      'sqrt(x^2 + 1)',
    ];

    intermediateExpressions.forEach((expr) => {
      const result = calculateComplexity(expr);
      expect(result.level).toBe('intermediate');
      expect(result.score).toBeGreaterThan(3);
      expect(result.score).toBeLessThanOrEqual(7);
      expect(result.feedback).toContain('中級レベル');
    });
  });

  test('複雑な数式は高い複雑度', () => {
    const advancedExpressions = [
      'sin(cos(tan(x))) + exp(log(sqrt(x)))',
      'atan2(sin(x*pi), cos(x*e)) * exp(-x^2/2)',
    ];

    advancedExpressions.forEach((expr) => {
      const result = calculateComplexity(expr);
      expect(result.level).toBe('advanced');
      expect(result.score).toBeGreaterThan(7);
      expect(result.feedback).toContain('高度な数式');
    });
  });

  test('無効な数式でも基本レベルを返す', () => {
    const result = calculateComplexity('invalid expression');
    expect(result.level).toBe('basic');
    expect(result.score).toBe(0);
    expect(result.feedback).toContain('評価できませんでした');
  });
});

describe('統合テスト - 実際の使用シナリオ', () => {
  test('ユーザーが段階的に複雑な数式を入力するシナリオ', () => {
    const userJourney = [
      { input: 'x', expectedValid: true, expectedComplexity: 'basic' },
      { input: 'x^2', expectedValid: true, expectedComplexity: 'basic' },
      { input: 'sin(x)', expectedValid: true, expectedComplexity: 'basic' },
      { input: 'sin(x) + cos(x)', expectedValid: true, expectedComplexity: 'intermediate' },
      { input: 'alert(1)', expectedValid: false, expectedComplexity: 'basic' },
    ];

    userJourney.forEach(({ input, expectedValid, expectedComplexity }) => {
      const validation = validateMathExpression(input);
      expect(validation.isValid).toBe(expectedValid);

      if (expectedValid) {
        const func = createSafeMathFunction(input);
        expect(func.isValid).toBe(true);
        expect(typeof func.evaluate(1)).toBe('number');

        const complexity = calculateComplexity(input);
        expect(complexity.level).toBe(expectedComplexity);
      } else {
        const errorMessage = getEducationalErrorMessage(validation.error!);
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.length).toBeGreaterThan(0);
      }
    });
  });

  test('境界値での動作確認', () => {
    // 最大長の数式（200文字）
    const maxLengthExpr = 'x+'.repeat(99) + 'x'; // 199文字
    const validResult = validateMathExpression(maxLengthExpr);
    expect(validResult.isValid).toBe(true);

    // 最大長を超える数式（201文字）
    const tooLongExpr = maxLengthExpr + '+x';
    const invalidResult = validateMathExpression(tooLongExpr);
    expect(invalidResult.isValid).toBe(false);
  });
});