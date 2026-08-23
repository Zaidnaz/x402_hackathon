import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Coins,
  Terminal,
  Copy,
  Check,
  AlertOctagon,
  Cpu,
  Loader2,
  Search,
  ArrowRightLeft,
  ChevronDown,
  XCircle,
  ListChecks,
  Circle,
  ShieldAlert
} from 'lucide-react';
import {
  ExecutionEvent,
  CompletedPlan,
  CompletedTask,
  ExecutionStage,
  RoutingDecision,
  X402PaymentChallenge,
  TaskPlan,
  ApprovalRequiredInfo
} from '../types';

interface ExecutionPipelineProps {
  events: ExecutionEvent[];
  currentStage: ExecutionStage;
  streamedOutputByStep: Record<number, string>;
  completedPlan: CompletedPlan | null;
  isStreaming: boolean;
  errorMessage: string | null;
  pendingApproval: ApprovalRequiredInfo | null;
  onApprove: () => void;
  onReset: () => void;
}

// Canonical order one step's own feed grows in, top to bottom.
const STAGE_ORDER: ExecutionStage[] = [
  'analyzing_intent',
  'discovering_grid',
  'optimizing_pareto',
  'x402_challenging',
  'settling_algorand',
  'rerouting_failover',
  'executing_workload',
  'verifying_telemetry'
];

const STAGE_LABEL: Record<string, string> = {
  analyzing_intent: 'Understanding the request',
  discovering_grid: 'Scanning the market',
  optimizing_pareto: 'Choosing a route',
  x402_challenging: 'Requesting payment (x402)',
  settling_algorand: 'Paying on Algorand',
  rerouting_failover: 'Rerouting mid-task',
  executing_workload: 'Running the task',
  verifying_telemetry: 'Wrapping up'
};

function groupLatestByStage(events: ExecutionEvent[]): Map<ExecutionStage, ExecutionEvent[]> {
  const map = new Map<ExecutionStage, ExecutionEvent[]>();
  for (const ev of events) {
    const arr = map.get(ev.stage) || [];
    arr.push(ev);
    map.set(ev.stage, arr);
  }
  return map;
}

const RoutingDecisionCard: React.FC<{ routing: RoutingDecision }> = ({ routing }) => {
  const top = routing.paretoFrontier.slice(0, 4);
  return (
    <div className="space-y-3">
      <div className="bg-brand-emerald/10 border border-brand-emerald/30 rounded-xl p-3 space-y-1.5">
        <div className="text-[10px] uppercase tracking-wide text-grid-400">Selected</div>
        <div className="text-sm font-bold text-white">
          {routing.selectedCandidate.modelName} <span className="text-grid-400 font-normal">on</span> {routing.selectedCandidate.computeName}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-grid-300">
          <span>{routing.selectedCandidate.gpuType}</span>
          <span className="text-brand-emerald font-bold font-mono">{routing.selectedCandidate.estimatedCostAlgo} ALGO</span>
          <span>{routing.selectedCandidate.estimatedLatencyMs}ms</span>
          <span className="text-signal-cyan">Quality {routing.selectedCandidate.projectedQualityScore}/100</span>
        </div>
      </div>

      <div className="text-[11px] text-grid-300 space-y-1">
        {routing.decisionReasoning.slice(0, 3).map((r, i) => (
          <div key={i} className="flex items-start space-x-1.5">
            <span className="text-brand-emerald mt-0.5">›</span>
            <span>{r}</span>
          </div>
        ))}
      </div>

      {top.length > 1 && (
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase tracking-wide text-grid-500">
            Evaluated {routing.evaluatedCandidatesCount} combinations — top alternatives:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {top.map((c, idx) => {
              const isSelected = c.modelId === routing.selectedCandidate.modelId && c.computeId === routing.selectedCandidate.computeId;
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-left ${
                    isSelected ? 'bg-brand-emerald/15 border-brand-emerald/50' : 'bg-black/50 border-white/[0.08]'
                  }`}
                >
                  <div className="text-[10px] font-bold text-white truncate">{c.modelName}</div>
                  <div className="text-[9px] text-grid-400 truncate">{c.computeName}</div>
                  <div className="text-[9px] text-grid-400 mt-0.5 font-mono">{c.estimatedCostAlgo} ALGO · {c.estimatedLatencyMs}ms</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentCard: React.FC<{ challenge?: X402PaymentChallenge; settlement?: any; message: string }> = ({ challenge, settlement, message }) => {
  if (!challenge) return <div className="text-[11px] text-grid-400">{message}</div>;
  return (
    <div className="space-y-2">
      <div className="text-[11px] text-grid-300">
        Requesting <span className="text-white font-bold font-mono">{challenge.amountAlgo} ALGO</span> via HTTP 402 (scheme <code className="text-brand-emerald">avm:exact</code>) from{' '}
        <code className="text-grid-400">{challenge.destinationAddress.slice(0, 10)}...</code>
      </div>
      {settlement ? (
        <div className="flex items-center space-x-1.5 text-[11px] text-brand-emerald font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed on-chain in round #{settlement.round}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1.5 text-[11px] text-grid-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Signing and broadcasting to Algorand TestNet...</span>
        </div>
      )}
    </div>
  );
};

/** The full, rich live feed for one step — this is what a single-task prompt renders as. */
const StepStageFeed: React.FC<{
  stepEvents: ExecutionEvent[];
  streamedOutput: string;
  isActive: boolean;
  errorMessage: string | null;
  stepTask?: CompletedTask;
}> = ({ stepEvents, streamedOutput, isActive, errorMessage, stepTask }) => {
  const [copied, setCopied] = useState(false);
  const byStage = useMemo(() => groupLatestByStage(stepEvents), [stepEvents]);
  const activeStages = STAGE_ORDER.filter((s) => byStage.has(s));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2.5">
      {activeStages.map((stage, stageIdx) => {
        const stageEvents = byStage.get(stage)!;
        const latest = stageEvents[stageEvents.length - 1];
        const isLastActiveStage = stageIdx === activeStages.length - 1;
        const stageIsActive = isActive && isLastActiveStage;
        const isDone = !stageIsActive && !(errorMessage && isActive && isLastActiveStage);

        return (
          <div
            key={stage}
            className={`bg-black/70 border rounded-xl p-3.5 animate-fadeIn transition-colors ${
              stageIsActive ? 'border-brand-emerald/50' : 'border-white/[0.08]'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1.5">
              {stageIsActive ? (
                <Loader2 className="w-3.5 h-3.5 text-brand-emerald animate-spin shrink-0" />
              ) : isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-grid-700 shrink-0" />
              )}
              <span className="text-sm font-medium text-white">{STAGE_LABEL[stage] || stage}</span>
            </div>

            <div className="pl-5.5 ml-0.5">
              {stage === 'optimizing_pareto' && latest.data?.routing ? (
                <RoutingDecisionCard routing={latest.data.routing} />
              ) : stage === 'x402_challenging' ? (
                <PaymentCard challenge={latest.data?.challenge} message={latest.message} />
              ) : stage === 'settling_algorand' ? (
                <PaymentCard
                  challenge={(byStage.get('x402_challenging') || []).find((e) => e.data?.challenge)?.data?.challenge}
                  settlement={stageEvents.find((e) => e.data?.settlement)?.data?.settlement}
                  message={latest.message}
                />
              ) : stage === 'rerouting_failover' ? (
                <div className="flex items-start space-x-2 text-[11px] text-signal-rose">
                  <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{latest.message}</span>
                </div>
              ) : (
                <div className="text-[11px] text-grid-400">{latest.message}</div>
              )}
            </div>
          </div>
        );
      })}

      {(streamedOutput || (isActive && byStage.has('executing_workload')) || stepTask) && (
        <div className="bg-black/85 border border-white/[0.1] rounded-2xl overflow-hidden">
          <div className="bg-black px-3.5 py-2.5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-brand-emerald shrink-0" />
              <span className="text-[13px] font-medium text-white">Result</span>
            </div>
            <button
              onClick={() => copyToClipboard(streamedOutput)}
              disabled={!streamedOutput}
              className="flex items-center space-x-1 text-[13px] text-grid-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-4 max-h-[340px] overflow-y-auto text-[14px] text-grid-100 whitespace-pre-wrap leading-relaxed">
            {streamedOutput || <span className="text-grid-500">Streaming will start once payment is confirmed...</span>}
          </div>
        </div>
      )}

      {stepTask && (
        <div className="flex items-center justify-between text-[13px] px-0.5">
          <span className="flex items-center space-x-1.5 text-grid-400">
            <Coins className="w-3.5 h-3.5" />
            <span>Paid <strong className="text-brand-emerald font-mono">{stepTask.actualCostAlgo} ALGO</strong> on Algorand TestNet</span>
          </span>
          <a
            href={stepTask.algorandTx.loraUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-emerald text-black font-medium text-[12px] hover:bg-brand-emerald/90 transition-all"
          >
            <Search className="w-3 h-3" />
            <span>View on-chain receipt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};

/** Collapsed one-line summary for a step that already finished and isn't the active one. */
const StepSummaryRow: React.FC<{ index: number; title: string; task?: CompletedTask }> = ({ index, title, task }) => (
  <div className="flex items-center justify-between bg-black/50 border border-white/[0.07] rounded-xl px-3.5 py-2.5">
    <div className="flex items-center space-x-2 min-w-0">
      <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
      <span className="text-[13px] text-grid-300 shrink-0">Step {index + 1}</span>
      <span className="text-[13px] font-medium text-white truncate">{title}</span>
    </div>
    {task && (
      <div className="flex items-center space-x-3 shrink-0 text-[12px]">
        <span className="text-grid-500 hidden sm:inline truncate max-w-[160px]">{task.routing.selectedCandidate.modelName}</span>
        <span className="text-brand-emerald font-mono font-semibold">{task.actualCostAlgo} ALGO</span>
        <a href={task.algorandTx.loraUrl} target="_blank" rel="noreferrer" className="text-grid-400 hover:text-white">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    )}
  </div>
);

const PlanChecklist: React.FC<{ plan: TaskPlan; doneIndices: Set<number>; activeIndex: number | null }> = ({ plan, doneIndices, activeIndex }) => (
  <div className="bg-black/50 border border-white/[0.08] rounded-xl p-3.5 space-y-2">
    <div className="flex items-center space-x-2 text-[13px] font-medium text-white">
      <ListChecks className="w-4 h-4 text-brand-emerald" />
      <span>The agent split this into {plan.steps.length} independent purchases</span>
    </div>
    <div className="space-y-1.5">
      {plan.steps.map((s, i) => {
        const isDone = doneIndices.has(i);
        const isActive = activeIndex === i;
        return (
          <div key={i} className="flex items-center space-x-2 text-[13px]">
            {isDone ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
            ) : isActive ? (
              <Loader2 className="w-3.5 h-3.5 text-brand-emerald animate-spin shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-grid-600 shrink-0" />
            )}
            <span className={isDone || isActive ? 'text-white' : 'text-grid-500'}>{s.title}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const ApprovalCard: React.FC<{ info: ApprovalRequiredInfo; onApprove: () => void }> = ({ info, onApprove }) => (
  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 space-y-3 animate-fadeIn">
    <div className="flex items-start space-x-2.5">
      <ShieldAlert className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <div className="text-sm font-medium text-white">This task needs your sign-off before it pays</div>
        <div className="text-[13px] text-grid-300">
          <strong className="text-yellow-400 font-mono">{info.estimatedCostAlgo} ALGO</strong> for{' '}
          {info.modelName} on {info.computeName} — at or above the{' '}
          <span className="font-mono">{info.thresholdAlgo} ALGO</span> auto-approve threshold.
        </div>
      </div>
    </div>
    <button
      onClick={onApprove}
      className="w-full py-2 rounded-xl bg-yellow-400 text-black font-medium text-sm hover:bg-yellow-400/90 active:scale-[0.99] transition-all cursor-pointer"
    >
      Approve &amp; pay {info.estimatedCostAlgo} ALGO
    </button>
  </div>
);

export const ExecutionPipeline: React.FC<ExecutionPipelineProps> = ({
  events,
  streamedOutputByStep,
  completedPlan,
  isStreaming,
  errorMessage,
  pendingApproval,
  onApprove,
  onReset
}) => {
  const [showRawEvents, setShowRawEvents] = useState(false);

  const planEvent = useMemo(
    () => [...events].reverse().find((e) => e.stage === 'planning' && e.data?.plan)?.data?.plan as TaskPlan | undefined,
    [events]
  );

  const eventsByStep = useMemo(() => {
    const map = new Map<number, ExecutionEvent[]>();
    for (const ev of events) {
      if (!ev.step) continue;
      const arr = map.get(ev.step.index) || [];
      arr.push(ev);
      map.set(ev.step.index, arr);
    }
    return map;
  }, [events]);

  const stepIndices = useMemo(() => Array.from(eventsByStep.keys()).sort((a, b) => a - b), [eventsByStep]);

  const stepTaskByIndex = useMemo(() => {
    const map = new Map<number, CompletedTask>();
    for (const [idx, evs] of eventsByStep.entries()) {
      const done = evs.find((e) => e.stage === 'completed' && e.data?.task);
      if (done) map.set(idx, done.data.task);
    }
    return map;
  }, [eventsByStep]);

  const totalSteps = planEvent?.steps.length ?? (stepIndices.length || 1);
  const isMultiStep = totalSteps > 1;
  const activeStepIndex = isStreaming
    ? stepIndices.find((i) => !stepTaskByIndex.has(i)) ?? null
    : null;
  const doneIndices = new Set(stepTaskByIndex.keys());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-brand-emerald animate-ping' : errorMessage ? 'bg-signal-rose' : pendingApproval ? 'bg-yellow-400' : 'bg-brand-emerald'}`} />
          <span className="text-sm font-medium text-white">
            {errorMessage
              ? 'Task failed'
              : pendingApproval
              ? 'Waiting for approval'
              : isStreaming
              ? 'Agent is working...'
              : completedPlan
              ? `Done in ${completedPlan.totalDurationMs}ms`
              : ''}
          </span>
        </div>
        <button
          onClick={onReset}
          disabled={isStreaming}
          className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-black/60 text-[13px] text-grid-300 hover:text-white hover:border-white/[0.2] transition-all disabled:opacity-50 cursor-pointer"
        >
          New Task
        </button>
      </div>

      {pendingApproval && <ApprovalCard info={pendingApproval} onApprove={onApprove} />}

      {errorMessage && (
        <div className="bg-signal-roseDim border border-signal-rose/40 rounded-xl p-4 flex items-start space-x-3 text-sm text-signal-rose animate-fadeIn">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">The agent couldn't complete this task</div>
            <div className="text-grid-300 text-[13px]">{errorMessage}</div>
          </div>
        </div>
      )}

      {planEvent && isMultiStep && (
        <PlanChecklist plan={planEvent} doneIndices={doneIndices} activeIndex={activeStepIndex} />
      )}

      <div className="space-y-2.5">
        {stepIndices.map((idx) => {
          const stepEvents = eventsByStep.get(idx)!;
          const title = stepEvents[0]?.step?.title || `Step ${idx + 1}`;
          const task = stepTaskByIndex.get(idx);
          const isActive = activeStepIndex === idx;
          const showCollapsed = isMultiStep && !isActive && task;

          if (showCollapsed) {
            return <StepSummaryRow key={idx} index={idx} title={title} task={task} />;
          }

          return (
            <div key={idx} className="space-y-2">
              {isMultiStep && (
                <div className="text-[11px] uppercase tracking-wide text-grid-500 px-0.5">
                  Step {idx + 1} of {totalSteps} — {title}
                </div>
              )}
              <StepStageFeed
                stepEvents={stepEvents}
                streamedOutput={streamedOutputByStep[idx] || ''}
                isActive={isActive || (!isStreaming && !completedPlan)}
                errorMessage={errorMessage}
                stepTask={task}
              />
            </div>
          );
        })}
      </div>

      {completedPlan && (
        <div className="bg-black/70 border border-white/[0.08] rounded-xl p-3.5 space-y-2.5">
          {completedPlan.steps.some((s) => s.failoverOccurred) && (
            <div className="flex items-start space-x-2 text-[13px] text-signal-rose bg-signal-roseDim border border-signal-rose/30 rounded-lg p-2.5">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>A step rerouted after a simulated provider failure — 0 tokens lost.</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[13px]">
            <span className="text-grid-400">
              {isMultiStep ? `${completedPlan.steps.length} purchases` : 'Total'} spent
            </span>
            <span className="text-brand-emerald font-mono font-semibold text-sm">{completedPlan.totalCostAlgo} ALGO</span>
          </div>

          {isMultiStep && (
            <button
              onClick={() => {
                const receipt = {
                  standard: 'x402-algorand-audit-v1',
                  prompt: completedPlan.prompt,
                  totalCostAlgo: completedPlan.totalCostAlgo,
                  totalDurationMs: completedPlan.totalDurationMs,
                  steps: completedPlan.steps.map((s) => ({
                    title: s.routing.selectedCandidate.modelName,
                    txId: s.algorandTx.txId,
                    loraUrl: s.algorandTx.loraUrl,
                    amountAlgo: s.actualCostAlgo
                  }))
                };
                const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `x402-plan-receipt-${completedPlan.id}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-black hover:bg-white/[0.05] border border-white/[0.1] text-[13px] text-grid-300 hover:text-white flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download combined receipt ({completedPlan.steps.length} transactions, .json)</span>
            </button>
          )}
        </div>
      )}

      {events.length > 0 && (
        <div>
          <button
            onClick={() => setShowRawEvents((v) => !v)}
            className="flex items-center space-x-1 text-[10px] text-grid-500 hover:text-grid-300 transition-colors cursor-pointer"
          >
            <Cpu className="w-3 h-3" />
            <span>Raw event log ({events.length})</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showRawEvents ? 'rotate-180' : ''}`} />
          </button>
          {showRawEvents && (
            <div className="mt-2 space-y-1.5 max-h-[240px] overflow-y-auto">
              {events.map((ev, i) => (
                <div key={i} className="p-2 bg-black rounded border border-white/[0.08] text-[10px] font-mono">
                  <div className="flex items-center justify-between text-grid-500 mb-0.5">
                    <span className="font-bold text-brand-emerald uppercase">{ev.stage}</span>
                    <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-grid-300">{ev.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutionPipeline;
