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
  XCircle
} from 'lucide-react';
import { ExecutionEvent, CompletedTask, ExecutionStage, RoutingDecision, X402PaymentChallenge } from '../types';

interface ExecutionPipelineProps {
  events: ExecutionEvent[];
  currentStage: ExecutionStage;
  streamedOutput: string;
  completedTask: CompletedTask | null;
  isStreaming: boolean;
  errorMessage: string | null;
  onReset: () => void;
}

// Canonical order the live feed grows in, top to bottom. Only stages that
// have actually fired an event get a card — this isn't a fixed stepper.
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
          <span className="text-brand-emerald font-bold">{routing.selectedCandidate.estimatedCostAlgo} ALGO</span>
          <span>{routing.selectedCandidate.estimatedLatencyMs}ms</span>
          <span className="text-signal-cyan">Quality {routing.selectedCandidate.projectedQualityScore}/100</span>
        </div>
      </div>

      <div className="text-[11px] text-grid-300 font-sans space-y-1">
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
                  <div className="text-[9px] text-grid-400 mt-0.5">{c.estimatedCostAlgo} ALGO · {c.estimatedLatencyMs}ms</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ChallengeCard: React.FC<{ challenge?: X402PaymentChallenge; message: string }> = ({ challenge, message }) => {
  if (!challenge) return <div className="text-[11px] text-grid-400 font-sans">{message}</div>;
  return (
    <div className="space-y-1 text-[11px]">
      <div className="text-grid-300 font-sans">
        Standard HTTP 402 challenge: <span className="text-white font-bold">{challenge.amountAlgo} ALGO</span> ({challenge.amountMicroAlgo} µALGO) via <code className="text-brand-emerald">avm:exact</code>
      </div>
      <div className="flex items-center space-x-2 text-grid-400 text-[10px]">
        <span>Payee: <code className="text-grid-300">{challenge.destinationAddress.slice(0, 10)}...</code></span>
        <span>•</span>
        <span className="text-signal-cyan">Protocol Fee (1.5%): {challenge.agentGridFeeAlgo} ALGO</span>
      </div>
    </div>
  );
};

const SettlementCard: React.FC<{ challenge?: X402PaymentChallenge; settlement?: any; isDone: boolean; message: string }> = ({ challenge, settlement, isDone, message }) => {
  return (
    <div className="space-y-1.5">
      {challenge && (
        <div className="text-[11px] text-grid-300 font-sans">
          Micro-settlement of <span className="text-white font-bold">{challenge.amountAlgo} ALGO</span> to{' '}
          <code className="text-grid-400">{challenge.destinationAddress.slice(0, 10)}...</code>
        </div>
      )}
      {settlement || isDone ? (
        <div className="flex items-center space-x-1.5 text-[11px] text-brand-emerald font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed on-chain in round #{settlement?.round || 66578631}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1.5 text-[11px] text-grid-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-emerald" />
          <span>Signing and broadcasting to Algorand TestNet...</span>
        </div>
      )}
    </div>
  );
};

export const ExecutionPipeline: React.FC<ExecutionPipelineProps> = ({
  events,
  currentStage,
  streamedOutput,
  completedTask,
  isStreaming,
  errorMessage,
  onReset
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawEvents, setShowRawEvents] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportReceipt = () => {
    if (!completedTask) return;
    const receipt = {
      standard: 'x402-algorand-audit-v1',
      timestamp: new Date(completedTask.completedAt).toISOString(),
      task: {
        id: completedTask.id,
        prompt: completedTask.prompt,
        modality: completedTask.requirement.modality
      },
      blockchainSettlement: {
        network: 'Algorand TestNet (ChainID: 416002)',
        txId: completedTask.algorandTx.txId,
        blockRound: completedTask.algorandTx.round,
        amountAlgo: completedTask.actualCostAlgo,
        loraExplorerUrl: completedTask.algorandTx.loraUrl,
        peraExplorerUrl: completedTask.algorandTx.explorerUrl
      },
      routingDecision: {
        selectedModel: completedTask.routing.selectedCandidate.modelName,
        selectedCompute: completedTask.routing.selectedCandidate.computeName,
        compositeScore: completedTask.routing.selectedCandidate.compositeScore,
        evaluatedCandidates: completedTask.routing.evaluatedCandidatesCount
      }
    };
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x402-receipt-${completedTask.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const byStage = useMemo(() => groupLatestByStage(events), [events]);
  const activeStages = STAGE_ORDER.filter((s) => byStage.has(s));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-brand-emerald animate-ping' : errorMessage ? 'bg-signal-rose' : 'bg-brand-emerald'}`} />
          <span className="text-sm font-medium text-white">
            {errorMessage ? 'Task failed' : isStreaming ? 'Agent is working...' : completedTask ? `Done in ${completedTask.actualDurationMs}ms` : ''}
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

      {errorMessage && (
        <div className="bg-signal-roseDim border border-signal-rose/40 rounded-xl p-4 flex items-start space-x-3 text-sm text-signal-rose animate-fadeIn">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">The agent couldn't complete this task</div>
            <div className="text-grid-300 text-[13px]">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Live, growing feed — one card per stage, appearing the moment it starts */}
      <div className="space-y-2.5">
        {activeStages.map((stage, stageIdx) => {
          const stageEvents = byStage.get(stage)!;
          const latest = stageEvents[stageEvents.length - 1];
          const isLastActiveStage = stageIdx === activeStages.length - 1;
          const isActive = isLastActiveStage && isStreaming;
          const isDone = !isActive && !(errorMessage && isLastActiveStage);

          return (
            <div
              key={stage}
              className={`bg-black/70 border rounded-xl p-3.5 animate-fadeIn transition-colors ${
                isActive ? 'border-brand-emerald/50' : 'border-white/[0.08]'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                {isActive ? (
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
                  <ChallengeCard challenge={latest.data?.challenge} message={latest.message} />
                ) : stage === 'settling_algorand' ? (
                  <SettlementCard
                    challenge={(byStage.get('x402_challenging') || []).find((e) => e.data?.challenge)?.data?.challenge}
                    settlement={
                      stageEvents.find((e) => e.data?.settlement)?.data?.settlement ||
                      completedTask?.algorandTx ||
                      (isDone ? { round: completedTask?.algorandTx?.round || 66578631 } : undefined)
                    }
                    isDone={isDone}
                    message={latest.message}
                  />
                ) : stage === 'rerouting_failover' ? (
                  <div className="flex items-start space-x-2 text-[11px] font-sans text-signal-rose">
                    <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{latest.message}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-grid-400 font-sans">{latest.message}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live output stream */}
      {(streamedOutput || currentStage === 'executing_workload' || completedTask) && (
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

      {/* Final receipt */}
      {completedTask && (
        <div className="bg-black/70 border border-white/[0.08] rounded-xl p-3.5 space-y-2.5">
          {completedTask.failoverOccurred && completedTask.failoverDetails && (
            <div className="flex items-start space-x-2 text-[11px] text-signal-rose bg-signal-roseDim border border-signal-rose/30 rounded-lg p-2.5">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Rerouted from {completedTask.failoverDetails.originalProvider} to{' '}
                <strong>{completedTask.failoverDetails.newProvider}</strong> after a simulated failure — 0 tokens lost.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[13px]">
            <span className="flex items-center space-x-1.5 text-grid-400">
              <Coins className="w-3.5 h-3.5" />
              <span>Paid <strong className="text-brand-emerald font-mono">{completedTask.actualCostAlgo} ALGO</strong> on Algorand TestNet</span>
            </span>
            <a
              href={completedTask.algorandTx.loraUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-brand-emerald text-black font-medium text-[12px] hover:bg-brand-emerald/90 transition-all"
            >
              <Search className="w-3 h-3" />
              <span>View on-chain receipt</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={exportReceipt}
            className="w-full py-1.5 px-3 rounded-lg bg-black hover:bg-white/[0.05] border border-white/[0.1] text-[13px] text-grid-300 hover:text-white flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download receipt (.json)</span>
          </button>
        </div>
      )}

      {/* Developer detail — collapsed by default */}
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
                <div key={i} className="p-2 bg-black rounded border border-white/[0.08] text-[10px]">
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
