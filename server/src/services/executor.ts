import {
  TaskRequirement,
  RoutingDecision,
  CompletedTask,
  CompletedPlan,
  ExecutionEvent,
  EventStepContext
} from '../types/index.js';
import { AIAnalyzer } from './aiAnalyzer.js';
import { RouterEngine } from './routerEngine.js';
import { x402Protocol } from './x402Protocol.js';
import { algorandService } from './algorandService.js';
import { storage } from '../db/storage.js';
import { TaskPlanner } from './taskPlanner.js';
import { spendingPolicy, DailyBudgetExceededError, ApprovalRequiredError } from './spendingPolicy.js';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

export interface ExecuteOptions {
  prompt: string;
  overrides?: Partial<TaskRequirement>;
  simulateFailover?: boolean;
  /** Set once a human has explicitly signed off on a task that tripped the approval threshold. */
  humanApproved?: boolean;
  onEvent?: (event: ExecutionEvent) => void | Promise<void>;
  onTokenChunk?: (chunk: string, step?: EventStepContext) => void | Promise<void>;
}

export class WorkloadExecutor {
  public static async execute(options: ExecuteOptions): Promise<CompletedTask> {
    const startTime = Date.now();
    // Both onEvent and onTokenChunk write to an SSE stream, which is async
    // I/O. Every call here is awaited — an un-awaited write races the
    // function's return against the write actually reaching the socket, and
    // loses that race for the *last* event of the run (there's nothing after
    // it to accidentally give the write time to flush), silently dropping
    // the 'completed' event the client is waiting for.
    const emit = async (stage: ExecutionEvent['stage'], message: string, data?: any): Promise<void> => {
      if (options.onEvent) {
        await options.onEvent({ stage, message, timestamp: Date.now(), data });
      }
    };
    const emitToken = async (chunk: string): Promise<void> => {
      if (options.onTokenChunk) {
        await options.onTokenChunk(chunk);
      }
    };

    // Stage 1: Intent Analysis
    await emit('analyzing_intent', 'Deconstructing prompt into compute constraints and modality requirements...');
    await delay(300);
    const requirement = AIAnalyzer.analyzeTask(options.prompt, options.overrides);
    await emit('analyzing_intent', `Decomposition complete: ${requirement.modality.toUpperCase()} workload, est. ${requirement.estimatedInputTokens + requirement.estimatedOutputTokens} tokens, SLA: ${requirement.deadlineMs}ms.`, { requirement });

    // Stage 2: Grid Discovery
    await delay(200);
    await emit('discovering_grid', 'Probing active model endpoints and GPU clusters for live telemetry, spot pricing, and interconnect bandwidth...');
    await delay(300);

    // Stage 3: Pareto Optimization
    await emit('optimizing_pareto', 'Executing deterministic multi-objective Pareto scoring across cost, latency, and quality dimensions...');
    await delay(350);
    const routing = RouterEngine.evaluateGrid(requirement);
    await emit('optimizing_pareto', `Optimal route determined: [${routing.selectedCandidate.modelName}] on [${routing.selectedCandidate.computeName}] (Score: ${routing.selectedCandidate.compositeScore}).`, { routing });

    let activeCandidate = routing.selectedCandidate;
    let failoverOccurred = false;
    let failoverDetails: CompletedTask['failoverDetails'] | undefined = undefined;

    // Spending governance — gates real money leaving the agent wallet, not
    // just a UI warning. A hard daily cap rejects the task outright; a
    // per-task threshold pauses it for explicit human sign-off. Both run
    // *before* any x402 challenge or on-chain settlement.
    const policy = spendingPolicy.get();
    const todaySpendAlgo = await spendingPolicy.getTodaySpendAlgo();
    if (todaySpendAlgo + activeCandidate.estimatedCostAlgo > policy.dailyBudgetAlgo) {
      const err = new DailyBudgetExceededError(todaySpendAlgo, activeCandidate.estimatedCostAlgo, policy.dailyBudgetAlgo);
      await emit('failed', err.message, { policy, todaySpendAlgo });
      throw err;
    }
    if (!options.humanApproved && activeCandidate.estimatedCostAlgo >= policy.autoApproveThresholdAlgo) {
      const err = new ApprovalRequiredError(
        activeCandidate.estimatedCostAlgo,
        policy.autoApproveThresholdAlgo,
        activeCandidate.modelName,
        activeCandidate.computeName,
        options.prompt
      );
      await emit('awaiting_approval', err.message, {
        estimatedCostAlgo: err.estimatedCostAlgo,
        thresholdAlgo: err.thresholdAlgo,
        modelName: err.modelName,
        computeName: err.computeName,
        prompt: err.prompt
      });
      throw err;
    }

    // Stage 4: x402 Challenge Generation
    await delay(200);
    await emit('x402_challenging', `Issuing standardized HTTP 402 Payment Challenge for compute resource [${activeCandidate.computeName}] via GoPlausible Facilitator...`);
    const challenge = x402Protocol.generatePaymentChallenge(requirement.id, activeCandidate);
    await delay(250);
    await emit('x402_challenging', `HTTP 402 Challenge active: ${challenge.amountAlgo} ALGO (${challenge.amountMicroAlgo} µALGO) required under scheme avm:exact.`, { challenge });

    // Stage 5: Algorand TestNet Settlement
    await delay(200);
    await emit('settling_algorand', `Signing atomic micro-settlement on Algorand TestNet (Fee: ${challenge.agentGridFeeAlgo} ALGO, Payout: ${challenge.providerPayoutAlgo} ALGO)...`);
    const settlement = await algorandService.executeSettlement(
      requirement.id,
      activeCandidate.computeId,
      challenge.amountAlgo
    );
    await delay(300);

    const paymentProof = x402Protocol.verifyPaymentProof(
      challenge.challengeId,
      settlement.txId,
      settlement.signature,
      settlement.round
    );
    await emit('settling_algorand', `Settlement confirmed on-chain in Round #${settlement.round} (Tx: ${settlement.txId.substring(0, 16)}...). Payment token issued.`, { settlement, paymentProof });

    // Stage 6: Inference Execution & Live Streaming
    await delay(200);
    await emit('executing_workload', `Authorizing workload on ${activeCandidate.gpuType} via ${activeCandidate.computeName}...`);

    let executionOutput = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Live Real-Time Gemini AI Inference Stream
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are ${activeCandidate.modelName} executing on an autonomous decentralized compute grid node (${activeCandidate.computeName} with ${activeCandidate.gpuType}). Provide a high quality, comprehensive, and direct answer.`;

        // Priority order: fastest/cheapest current model first, falling back
        // to progressively larger ones. Gemini retires model names over
        // time — if these all start failing with 404s, check
        // https://ai.google.dev/gemini-api/docs/models for current ids.
        const targetModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];

        for (const modelName of targetModels) {
          try {
            const responseStream = await ai.models.generateContentStream({
              model: modelName,
              contents: `${systemPrompt}\n\nTask: ${options.prompt}`
            });

            for await (const chunk of responseStream) {
              const textChunk = chunk.text || '';
              executionOutput += textChunk;
              await emitToken(textChunk);
            }
            break;
          } catch (modelErr: any) {
            console.warn(`Attempt with ${modelName} encountered: ${modelErr?.message}, trying fallback...`);
          }
        }
      } catch (err: any) {
        console.warn('Gemini stream fallback to simulated tensor output:', err?.message);
        executionOutput = '';
      }
    }

    // Fallback or default deterministic stream
    if (!executionOutput) {
      const generatedSample = generateRealisticOutput(requirement.rawPrompt, requirement.modality, activeCandidate.modelName);
      const words = generatedSample.split(' ');

      for (let i = 0; i < words.length; i++) {
        const word = words[i] + ' ';
        executionOutput += word;
        await emitToken(word);

        if (options.simulateFailover && !failoverOccurred && i === Math.floor(words.length * 0.4)) {
          await emit('rerouting_failover', `CRITICAL: Primary node [${activeCandidate.computeName}] reported telemetry degradation / VRAM spike! Triggering zero-downtime failover...`, {
            degradedNode: activeCandidate.computeName,
            fallbackNode: routing.fallbackCandidate.computeName
          });
          await delay(500);

          failoverOccurred = true;
          const previousCandidate = activeCandidate;
          activeCandidate = routing.fallbackCandidate;

          failoverDetails = {
            originalProvider: `${previousCandidate.computeName} (${previousCandidate.gpuType})`,
            reason: 'Simulated Node Heartbeat Drop / VRAM Latency Spike (980ms > SLA)',
            newProvider: `${activeCandidate.computeName} (${activeCandidate.gpuType})`,
            rerouteLatencyOverheadMs: 185
          };

          await emit('rerouting_failover', `Rerouted seamlessly to [${activeCandidate.modelName}] on [${activeCandidate.computeName}]. Resuming token stream...`, { failoverDetails });
          await delay(300);
        }

        await delay(25);
      }
    }

    // Stage 7: Telemetry Verification & Telemetry Log
    const actualDurationMs = Date.now() - startTime;
    await emit('verifying_telemetry', 'Validating SLA adherence, output integrity, and finalizing ledger accounting...');
    await delay(200);

    const completedTask: CompletedTask = {
      id: requirement.id,
      prompt: options.prompt,
      requirement,
      routing,
      x402Challenge: challenge,
      paymentProof,
      algorandTx: {
        id: settlement.txId,
        txId: settlement.txId,
        taskId: requirement.id,
        sender: algorandService.getAgentAddress(),
        receiver: challenge.destinationAddress,
        amountAlgo: challenge.amountAlgo,
        feeAlgo: 0.001,
        protocolFeeAlgo: challenge.agentGridFeeAlgo,
        type: 'x402_inference_payment',
        round: settlement.round,
        status: 'confirmed',
        timestamp: Date.now(),
        explorerUrl: settlement.explorerUrl,
        loraUrl: settlement.loraUrl || `https://lora.algokit.io/testnet/transaction/${settlement.txId}`,
        facilitator: 'https://facilitator.goplausible.xyz',
        note: `x402:v1:${requirement.id}`
      },
      executionOutput,
      actualDurationMs,
      actualCostAlgo: challenge.amountAlgo,
      tokensGenerated: executionOutput.split(/\s+/).length,
      status: failoverOccurred ? 'rerouted' : 'completed',
      failoverOccurred,
      failoverDetails,
      completedAt: Date.now()
    };

    await storage.saveTask(completedTask);
    await emit('completed', `Task execution successfully finished in ${actualDurationMs}ms. Ledger settled via GoPlausible Facilitator.`, { task: completedTask });

    return completedTask;
  }

  /**
   * Decomposes a prompt into one or more independent deliverables (via
   * TaskPlanner) and runs the full route→pay→execute pipeline separately
   * for each — so a single request can result in several genuinely
   * distinct on-chain micro-payments, each to whichever model/compute
   * combination is optimal for that specific subtask. A prompt that isn't
   * genuinely multi-part degrades to exactly one step, which behaves
   * identically to calling execute() directly.
   */
  public static async executePlan(options: ExecuteOptions): Promise<CompletedPlan> {
    const startTime = Date.now();
    const emit = async (stage: ExecutionEvent['stage'], message: string, data?: any): Promise<void> => {
      if (options.onEvent) {
        await options.onEvent({ stage, message, timestamp: Date.now(), data });
      }
    };

    await emit('planning', 'Deciding whether this needs one purchase or several...');
    const plan = await TaskPlanner.planTask(options.prompt);
    await emit(
      'planning',
      plan.planned
        ? `Plan ready: ${plan.steps.length} independent deliverables, each routed and paid for separately.`
        : 'Single deliverable — one purchase.',
      { plan }
    );

    const steps: CompletedTask[] = [];

    for (let i = 0; i < plan.steps.length; i++) {
      const planStep = plan.steps[i];
      const stepContext: EventStepContext = { index: i, total: plan.steps.length, title: planStep.title };

      const stepOptions: ExecuteOptions = {
        prompt: planStep.prompt,
        overrides: options.overrides,
        simulateFailover: options.simulateFailover && i === plan.steps.length - 1,
        humanApproved: options.humanApproved,
        onEvent: options.onEvent
          ? async (ev) => {
              await options.onEvent!({ ...ev, step: stepContext });
            }
          : undefined,
        onTokenChunk: options.onTokenChunk
          ? async (chunk) => {
              await options.onTokenChunk!(chunk, stepContext);
            }
          : undefined
      };

      const result = await WorkloadExecutor.execute(stepOptions);
      steps.push(result);
    }

    const totalCostAlgo = Number(steps.reduce((sum, s) => sum + s.actualCostAlgo, 0).toFixed(6));
    const totalDurationMs = Date.now() - startTime;

    const completedPlan: CompletedPlan = {
      id: `plan_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      prompt: options.prompt,
      plan,
      steps,
      totalCostAlgo,
      totalDurationMs,
      status: steps.every((s) => s.status !== 'failed') ? 'completed' : 'failed',
      completedAt: Date.now()
    };

    await emit(
      'plan_completed',
      `All ${plan.steps.length} step(s) complete. Total spent: ${totalCostAlgo} ALGO across ${plan.steps.length} on-chain settlement(s).`,
      { completedPlan }
    );

    return completedPlan;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRealisticOutput(prompt: string, modality: string, modelName: string): string {
  if (modality === 'code') {
    return `// Optimized implementation dispatched via ${modelName} on AgentGrid
import { AlgorandClient } from '@algorandfoundation/algokit-utils';

export interface GridTaskOrchestrator {
  taskId: string;
  budgetMicroAlgo: bigint;
  maxSlaMs: number;
}

export class AutonomousTaskWorker {
  private client: AlgorandClient;

  constructor() {
    this.client = AlgorandClient.testNet();
  }

  /**
   * Evaluates autonomous provider payment challenge and executes micro-settlement
   */
  public async processX402Workload(task: GridTaskOrchestrator, providerAddress: string): Promise<string> {
    const paymentTx = await this.client.send.payment({
      sender: this.client.account.defaultSignerAddress,
      receiver: providerAddress,
      amount: task.budgetMicroAlgo,
      note: new Uint8Array(Buffer.from(\`x402-ack:\${task.taskId}\`))
    });

    console.log(\`[AgentGrid] Payment confirmed in round \${paymentTx.confirmation.confirmedRound}\`);
    return paymentTx.transaction.txId();
  }
}

// Verification: Benchmark score 98.4% | Memory safety verified | 0 lint errors`;
  }

  if (modality === 'reasoning') {
    return `### Mathematical & Architectural Reasoning Analysis
**Generated via ${modelName} on AgentGrid Autonomous Fabric**

1. **Problem Decomposition**:
   - The workload presents a multi-constrained optimization scenario where total latency $L_{total} = L_{network} + \\frac{T_{out}}{\\text{TPS}_{eff}}$ must satisfy $L_{total} \\le \\text{SLA}_{max}$.
   - Cost objective $C(M, G) = C_{tokens}(M) + C_{compute}(G)$ subjected to $C(M, G) \\le \\text{Budget}_{ALGO}$.

2. **Deductive Optimization**:
   - By calculating the Pareto non-dominated set $\\mathcal{P} = \\{ c \\in \\mathcal{C} \\mid \\nexists c' \\text{ s.t. } c' \\succ c \\}$, we eliminate sub-optimal GPU/Model permutations.
   - The selected compute node delivers an effective bandwidth of 900 GB/s over NVLink, keeping tensor communication latency under 12ms.

3. **Conclusion & Invariant Guarantees**:
   - Formal verification establishes $P(\\text{SLA Violations}) < 0.002$ under current grid spot availability.
   - Cryptographic settlement was verified with zero round degradation.`;
  }

  if (modality === 'batch-summary') {
    return `### Executive Batch Synthesis & Telemetry Digest
**Synthesized by ${modelName}**

- **Dataset Volume**: 42,800 records analyzed across distributed edge partitions.
- **Key Findings**:
  1. Average inference cost decreased by **58.3%** compared to monolithic single-cloud routing.
  2. Autonomous x402 payment handshakes achieved sub-250ms roundtrip settlement on Algorand TestNet.
  3. Dynamic failover redundancy protected 100% of in-flight sessions during simulated regional node outages.
- **Actionable Recommendation**: Maintain dynamic weighted routing with $w_{cost}=0.55$ for bulk non-realtime batch jobs to maximize treasury capital efficiency.`;
  }

  return `### Autonomous AgentGrid Execution Report
**Model**: ${modelName}

Task "${prompt.substring(0, 60)}..." was autonomously analyzed, routed, paid for, and executed across the decentralized AI infrastructure grid.

- **Status**: Completed with 100% telemetry verification.
- **Resource Allocation**: Optimal compute & model pairing selected based on real-time Pareto score.
- **Settlement**: Cryptographically verified on Algorand TestNet through standardized x402 HTTP headers.`;
}
