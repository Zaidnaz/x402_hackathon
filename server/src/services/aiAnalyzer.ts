import crypto from 'crypto';
import { TaskRequirement, TaskModality } from '../types/index.js';

export const ALGO_USD_RATE = 0.22; // 1 ALGO = $0.22 USD

export class AIAnalyzer {
  public static analyzeTask(
    rawPrompt: string,
    overrides?: Partial<TaskRequirement>
  ): TaskRequirement {
    const text = rawPrompt.toLowerCase();
    
    // Detect Modality
    let modality: TaskModality = 'general';
    if (text.includes('code') || text.includes('refactor') || text.includes('function') || text.includes('typescript') || text.includes('sql') || text.includes('bug') || text.includes('api')) {
      modality = 'code';
    } else if (text.includes('prove') || text.includes('math') || text.includes('logic') || text.includes('audit') || text.includes('deduce') || text.includes('step by step') || text.includes('theorem')) {
      modality = 'reasoning';
    } else if (text.includes('summarize') || text.includes('dataset') || text.includes('batch') || text.includes('extract all') || text.includes('scrape') || text.includes('corpus')) {
      modality = 'batch-summary';
    } else if (text.includes('quick') || text.includes('realtime') || text.includes('ping') || text.includes('chat') || text.includes('hello') || text.includes('instant')) {
      modality = 'fast-chat';
    } else if (text.includes('image') || text.includes('diagram') || text.includes('chart') || text.includes('visual')) {
      modality = 'vision';
    }

    // Token estimation heuristics
    const wordCount = rawPrompt.trim().split(/\s+/).length;
    const baseInputTokens = Math.max(120, Math.round(wordCount * 1.35));
    
    let estimatedOutputTokens = 600;
    if (modality === 'code') estimatedOutputTokens = 1200;
    if (modality === 'reasoning') estimatedOutputTokens = 2000;
    if (modality === 'batch-summary') estimatedOutputTokens = 1800;
    if (modality === 'fast-chat') estimatedOutputTokens = 350;

    // SLA & Budget bounds
    let deadlineMs = 4000;
    let minQualityScore = 80;
    let maxBudgetAlgo = 0.5; // ~ $0.11
    let priority: TaskRequirement['priority'] = 'balanced';

    if (modality === 'fast-chat') {
      deadlineMs = 1200;
      minQualityScore = 75;
      priority = 'speed';
      maxBudgetAlgo = 0.25;
    } else if (modality === 'reasoning') {
      deadlineMs = 8000;
      minQualityScore = 92;
      priority = 'quality';
      maxBudgetAlgo = 1.20;
    } else if (modality === 'code') {
      deadlineMs = 3500;
      minQualityScore = 88;
      priority = 'quality';
      maxBudgetAlgo = 0.80;
    } else if (modality === 'batch-summary') {
      deadlineMs = 12000;
      minQualityScore = 82;
      priority = 'cost';
      maxBudgetAlgo = 0.35;
    }

    const requirement: TaskRequirement = {
      id: `task_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      rawPrompt,
      modality: overrides?.modality || modality,
      estimatedInputTokens: overrides?.estimatedInputTokens || baseInputTokens,
      estimatedOutputTokens: overrides?.estimatedOutputTokens || estimatedOutputTokens,
      maxBudgetAlgo: overrides?.maxBudgetAlgo || maxBudgetAlgo,
      maxBudgetUsd: (overrides?.maxBudgetAlgo || maxBudgetAlgo) * ALGO_USD_RATE,
      deadlineMs: overrides?.deadlineMs || deadlineMs,
      minQualityScore: overrides?.minQualityScore || minQualityScore,
      priority: overrides?.priority || priority,
      customWeights: overrides?.customWeights
    };

    return requirement;
  }
}
