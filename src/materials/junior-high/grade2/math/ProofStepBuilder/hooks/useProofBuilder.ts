// 証明ビルダーのロジックを管理するカスタムフック
import { useState, useCallback } from 'react';
import type { ProofStep, ProofProblem, ProofState, ValidationResult } from '../types';
import { proofProblems } from '../data/proofProblems';
import { theorems } from '../data/theorems';

export const useProofBuilder = () => {
  const [state, setState] = useState<ProofState>({
    problem: null,
    steps: [],
    availableTheorems: theorems,
    isComplete: false,
    feedback: '',
    showHint: false,
    currentHintIndex: 0
  });

  // 問題を選択
  const selectProblem = useCallback((problemId: string) => {
    const problem = proofProblems.find(p => p.id === problemId);
    if (problem) {
      setState({
        problem,
        steps: [],
        availableTheorems: theorems,
        isComplete: false,
        feedback: '',
        showHint: false,
        currentHintIndex: 0
      });
    }
  }, []);

  // ステップを追加
  const addStep = useCallback((content: string, reason?: string, reasonType?: ProofStep['reasonType']) => {
    setState(prev => {
      const newStep: ProofStep = {
        id: `step-${Date.now()}`,
        content,
        reason,
        reasonType,
        order: prev.steps.length
      };
      return {
        ...prev,
        steps: [...prev.steps, newStep],
        feedback: ''
      };
    });
  }, []);

  // ステップを削除
  const removeStep = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId).map((step, index) => ({
        ...step,
        order: index
      })),
      feedback: ''
    }));
  }, []);

  // ステップを更新
  const updateStep = useCallback((stepId: string, updates: Partial<ProofStep>) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ),
      feedback: ''
    }));
  }, []);

  // ステップの順序を変更（ドラッグ&ドロップ用）
  const reorderSteps = useCallback((sourceIndex: number, destinationIndex: number) => {
    setState(prev => {
      const newSteps = [...prev.steps];
      const [removed] = newSteps.splice(sourceIndex, 1);
      newSteps.splice(destinationIndex, 0, removed);
      
      return {
        ...prev,
        steps: newSteps.map((step, index) => ({ ...step, order: index })),
        feedback: ''
      };
    });
  }, []);

  // 証明を検証
  const validateProof = useCallback((): ValidationResult => {
    const { problem, steps } = state;
    
    if (!problem) {
      return {
        isValid: false,
        errors: ['問題が選択されていません'],
        suggestions: [],
        score: 0
      };
    }

    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // ステップ数のチェック
    if (steps.length === 0) {
      errors.push('証明のステップが入力されていません');
      return { isValid: false, errors, suggestions, score };
    }

    // 各ステップの検証
    steps.forEach((step, index) => {
      if (!step.content.trim()) {
        errors.push(`ステップ${index + 1}の内容が空です`);
      }
      if (!step.reason && index > 0) {
        suggestions.push(`ステップ${index + 1}に理由を追加すると、より完全な証明になります`);
      }
    });

    // 仮定の確認
    const hasGivenSteps = problem.given.some(given => 
      steps.some(step => step.content.includes(given) || step.reason === '仮定')
    );
    if (!hasGivenSteps) {
      errors.push('仮定（与えられた条件）が証明に含まれていません');
    } else {
      score += 20;
    }

    // 結論の確認
    const hasConclusion = steps.some(step => 
      step.content.includes(problem.toProve) || 
      step.content.includes('したがって') ||
      step.content.includes('よって')
    );
    if (!hasConclusion) {
      errors.push('結論が明確に示されていません');
    } else {
      score += 20;
    }

    // 論理的な流れの確認
    const hasLogicalFlow = steps.every((step, index) => {
      if (index === 0) return true;
      return step.reason || step.reasonType;
    });
    if (hasLogicalFlow) {
      score += 30;
    } else {
      suggestions.push('各ステップに理由を付けると、論理的な流れがより明確になります');
    }

    // 正しい定理の使用
    const usedTheorems = steps.filter(step => step.reasonType === 'theorem').length;
    if (usedTheorems > 0) {
      score += 30;
    }

    const isValid = errors.length === 0 && score >= 70;

    setState(prev => ({
      ...prev,
      isComplete: isValid,
      feedback: isValid 
        ? '素晴らしい！正しく証明できました！' 
        : errors.length > 0 
          ? `エラー: ${errors[0]}` 
          : `改善点: ${suggestions[0]}`
    }));

    return { isValid, errors, suggestions, score };
  }, [state]);

  // ヒントを表示
  const showNextHint = useCallback(() => {
    const { problem, currentHintIndex } = state;
    if (!problem) return;

    const nextIndex = Math.min(currentHintIndex + 1, problem.hints.length - 1);
    setState(prev => ({
      ...prev,
      showHint: true,
      currentHintIndex: nextIndex
    }));
  }, [state]);

  // リセット
  const reset = useCallback(() => {
    setState(prev => ({
      problem: prev.problem,
      steps: [],
      availableTheorems: theorems,
      isComplete: false,
      feedback: '',
      showHint: false,
      currentHintIndex: 0
    }));
  }, []);

  return {
    state,
    selectProblem,
    addStep,
    removeStep,
    updateStep,
    reorderSteps,
    validateProof,
    showNextHint,
    reset
  };
};