import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { TaskPlan } from '../types/index.js';

const MAX_STEPS = 4;

const planSchema = z.object({
  reasoning: z.string().max(400),
  steps: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        prompt: z.string().min(3).max(1000)
      })
    )
    .min(1)
    .max(MAX_STEPS)
});

function singleStepPlan(prompt: string, reasoning: string): TaskPlan {
  return {
    steps: [{ title: 'Complete the task', prompt }],
    reasoning,
    planned: false
  };
}

export class TaskPlanner {
  /**
   * Decides whether a prompt is one deliverable or several genuinely
   * distinct ones the agent should shop and pay for independently (e.g.
   * "write the copy, generate the hero image, and draft the code" is three
   * purchases; "explain X" is one). Falls back to a single step whenever
   * Gemini is unavailable or the response can't be trusted — the rest of
   * the pipeline behaves identically to the non-planned path either way.
   */
  public static async planTask(rawPrompt: string): Promise<TaskPlan> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return singleStepPlan(rawPrompt, 'Gemini unavailable — treating as a single task.');
    }

    const instruction = `You are a task-planning module for an autonomous AI agent that pays for compute per subtask.
Decide whether the following request is ONE deliverable, or genuinely SEVERAL distinct deliverables that would each warrant their own model call and their own payment (e.g. "write copy, generate an image, and write the code" = 3; "summarize this document" = 1; "explain X" = 1).
Be conservative — only split when the request truly asks for multiple different kinds of output. Most requests are 1 step. Never produce more than ${MAX_STEPS} steps.

Respond with ONLY minified JSON, no markdown fences, no commentary, matching exactly:
{"reasoning":"<one short sentence>","steps":[{"title":"<short label, 3-6 words>","prompt":"<the specific sub-request for this step, self-contained>"}]}

Request: ${rawPrompt}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: instruction
      });

      const raw = (res.text || '').trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      const parsed = planSchema.safeParse(JSON.parse(raw));

      if (!parsed.success) {
        console.warn('[TaskPlanner] Plan response failed validation, falling back to single step:', parsed.error.issues[0]?.message);
        return singleStepPlan(rawPrompt, 'Could not validate a multi-step plan — treating as a single task.');
      }

      return { ...parsed.data, planned: parsed.data.steps.length > 1 };
    } catch (err: any) {
      console.warn('[TaskPlanner] Planning call failed, falling back to single step:', err?.message);
      return singleStepPlan(rawPrompt, 'Planning call failed — treating as a single task.');
    }
  }
}
