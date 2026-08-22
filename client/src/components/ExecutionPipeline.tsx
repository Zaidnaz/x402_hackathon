import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  Coins, 
  Terminal, 
  Copy, 
  Check, 
  AlertOctagon, 
  ChevronRight, 
  Code,
  ShieldCheck,
  Zap,
  ArrowRightLeft,
  Search
} from 'lucide-react';
import { ExecutionEvent, CompletedTask, ExecutionStage } from '../types';

interface ExecutionPipelineProps {
  events: ExecutionEvent[];
  currentStage: ExecutionStage;
  streamedOutput: string;
  completedTask: CompletedTask | null;
  isStreaming: boolean;
  onReset: () => void;
}

const STAGES: { id: ExecutionStage; title: string; subtitle: string }[] = [
  { id: 'analyzing_intent', title: '1. Intent & Constraints', subtitle: 'Extract tokens, modality, SLA' },
  { id: 'discovering_grid', title: '2. Market Discovery', subtitle: 'Probe GPU & model endpoints' },
  { id: 'optimizing_pareto', title: '3. Pareto Optimization', subtitle: 'Deterministic score calculation' },
  { id: 'x402_challenging', title: '4. x402 Challenge', subtitle: 'GoPlausible AVM paywall standard' },
  { id: 'settling_algorand', title: '5. Algorand Settlement', subtitle: 'On-chain atomic micro-tx' },
  { id: 'executing_workload', title: '6. Workload Stream', subtitle: 'High-throughput tensor execution' },
];

export const ExecutionPipeline: React.FC<ExecutionPipelineProps> = ({
  events,
  currentStage,
  streamedOutput,
  completedTask,
  isStreaming,
  onReset
}) => {
  const [copied, setCopied] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'output' | 'x402' | 'algorand' | 'events'>('algorand');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCryptographicReceipt = () => {
    if (!completedTask) return;
    const receipt = {
      standard: "x402-algorand-audit-v1",
      timestamp: new Date(completedTask.completedAt).toISOString(),
      project: "AgentGrid",
      team: "Team LENA",
      task: {
        id: completedTask.id,
        prompt: completedTask.prompt,
        modality: completedTask.requirement.modality,
        tokensGenerated: completedTask.tokensGenerated,
        actualDurationMs: completedTask.actualDurationMs
      },
      blockchainSettlement: {
        network: "Algorand TestNet (ChainID: 416002)",
        txId: completedTask.algorandTx.txId,
        blockRound: completedTask.algorandTx.round,
        amountAlgo: completedTask.actualCostAlgo,
        amountMicroAlgo: Math.round(completedTask.actualCostAlgo * 1_000_000),
        usdcAsaEquivalent: `${(completedTask.actualCostAlgo * 0.22).toFixed(4)} USDC (ASA #10458941)`,
        protocolFeeAlgo: completedTask.x402Challenge.agentGridFeeAlgo,
        providerPayoutAlgo: completedTask.x402Challenge.providerPayoutAlgo,
        loraExplorerUrl: completedTask.algorandTx.loraUrl,
        peraExplorerUrl: completedTask.algorandTx.explorerUrl
      },
      x402Facilitator: {
        url: "https://facilitator.goplausible.xyz",
        scheme: "avm:exact",
        paymentToken: completedTask.paymentProof.paymentToken,
        verified: true
      },
      routingDecision: {
        selectedModel: completedTask.routing.selectedCandidate.modelName,
        selectedCompute: completedTask.routing.selectedCandidate.computeName,
        gpuType: completedTask.routing.selectedCandidate.gpuType,
        compositeScore: completedTask.routing.selectedCandidate.compositeScore
      }
    };

    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `x402-receipt-${completedTask.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStageStatus = (stageId: ExecutionStage) => {
    const stageOrder: ExecutionStage[] = [
      'analyzing_intent',
      'discovering_grid',
      'optimizing_pareto',
      'x402_challenging',
      'settling_algorand',
      'executing_workload',
      'verifying_telemetry',
      'completed'
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    const thisIndex = stageOrder.indexOf(stageId);

    if (currentStage === 'completed') return 'completed';
    if (currentStage === 'rerouting_failover' && stageId === 'executing_workload') return 'active';
    if (thisIndex < currentIndex) return 'completed';
    if (thisIndex === currentIndex) return 'active';
    return 'pending';
  };

  const loraUrl = completedTask?.algorandTx.loraUrl || `https://lora.algokit.io/testnet/transaction/${completedTask?.algorandTx.txId}`;

  return (
    <div className="space-y-6">
      {/* Top Header & Summary */}
      <div className="bg-black/75 border border-white/[0.08] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-brand-emerald animate-ping' : 'bg-brand-emerald'}`} />
            <h2 className="text-lg font-bold font-mono text-white">Autonomous Orchestration Pipeline</h2>
            {completedTask?.failoverOccurred && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-signal-roseDim text-signal-rose border border-signal-rose/30 flex items-center space-x-1">
                <ArrowRightLeft className="w-3 h-3" />
                <span>Failover Handled</span>
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-grid-300 mt-1">
            {isStreaming ? 'Real-time multi-agent execution & settlement in progress...' : completedTask ? `Completed in ${completedTask.actualDurationMs}ms with verified x402 settlement.` : 'Ready for workload dispatch.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onReset}
            disabled={isStreaming}
            className="px-3.5 py-1.5 rounded-lg border border-white/[0.08] bg-black/60 text-xs font-mono text-grid-300 hover:text-white hover:border-white/[0.2] transition-all disabled:opacity-50"
          >
            New Task
          </button>
        </div>
      </div>

      {/* Dynamic Failover Alert Banner */}
      {completedTask?.failoverOccurred && completedTask.failoverDetails && (
        <div className="bg-signal-roseDim border border-signal-rose/40 rounded-xl p-4 flex items-start space-x-3 text-xs font-mono text-signal-rose animate-fadeIn">
          <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5 text-signal-rose" />
          <div className="space-y-1">
            <div className="font-bold uppercase tracking-wide">Live Dynamic Failover & Reroute Executed</div>
            <div className="text-grid-300 text-[11px]">
              <strong>Degraded Node:</strong> {completedTask.failoverDetails.originalProvider} — Reason: <span className="text-signal-rose">{completedTask.failoverDetails.reason}</span>
            </div>
            <div className="text-grid-300 text-[11px]">
              <strong>Failover Route:</strong> Automatically switched in-flight execution to <span className="text-brand-emerald font-semibold">{completedTask.failoverDetails.newProvider}</span> with +{completedTask.failoverDetails.rerouteLatencyOverheadMs}ms reroute overhead. 0 lost tokens.
            </div>
          </div>
        </div>
      )}

      {/* 6-Stage Visual Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {STAGES.map((s, idx) => {
          const status = getStageStatus(s.id);
          return (
            <div
              key={s.id}
              className={`p-3 rounded-lg border text-left transition-all ${
                status === 'active'
                  ? 'bg-brand-emerald/10 border-brand-emerald shadow-glow-emerald'
                  : status === 'completed'
                  ? 'bg-black/60 border-brand-emerald/40'
                  : 'bg-black/40 border-white/[0.05] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-grid-400">STAGE {idx + 1}</span>
                {status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
                ) : status === 'active' ? (
                  <Zap className="w-3.5 h-3.5 text-brand-emerald animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-grid-700" />
                )}
              </div>
              <div className="text-xs font-mono font-semibold text-white truncate">{s.title}</div>
              <div className="text-[10px] text-grid-400 truncate mt-0.5">{s.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Dual Panel HUD: Output Terminal + Settlement Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Streaming Terminal (7 cols) */}
        <div className="lg:col-span-7 bg-black/80 border border-white/[0.08] rounded-xl overflow-hidden flex flex-col h-[520px]">
          <div className="bg-black px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-brand-emerald" />
              <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">Live Model Inference Stream</span>
              {isStreaming && (
                <span className="flex items-center space-x-1 text-[10px] font-mono text-brand-emerald animate-pulse">
                  <span>● Streaming</span>
                </span>
              )}
            </div>

            <button
              onClick={() => copyToClipboard(streamedOutput)}
              disabled={!streamedOutput}
              className="flex items-center space-x-1 text-xs font-mono text-grid-400 hover:text-white disabled:opacity-30 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-grid-100 whitespace-pre-wrap leading-relaxed bg-black/40 selection:bg-brand-emerald/20">
            {streamedOutput || (
              <div className="text-grid-500 flex items-center justify-center h-full">
                {isStreaming ? 'Negotiating x402 payment & initializing GPU stream...' : 'Awaiting task execution...'}
              </div>
            )}
          </div>

          {/* Telemetry Footer */}
          {completedTask && (
            <div className="bg-black px-4 py-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-grid-300">
              <div className="flex items-center space-x-4">
                <span>Model: <strong className="text-white">{completedTask.routing.selectedCandidate.modelName}</strong></span>
                <span>•</span>
                <span>Compute: <strong className="text-white">{completedTask.routing.selectedCandidate.computeName}</strong></span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Latency: <strong className="text-white">{completedTask.actualDurationMs}ms</strong></span>
                <span>•</span>
                <span>Cost: <strong className="text-brand-emerald font-semibold">{completedTask.actualCostAlgo} ALGO</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Inspector Tabs (5 cols) */}
        <div className="lg:col-span-5 bg-black/80 border border-white/[0.08] rounded-xl overflow-hidden flex flex-col h-[520px]">
          {/* Tabs */}
          <div className="bg-black px-3 py-2 border-b border-white/[0.08] flex space-x-1">
            {[
              { id: 'algorand', label: 'Algorand Ledger', icon: Coins },
              { id: 'x402', label: 'x402 Facilitator', icon: ShieldCheck },
              { id: 'events', label: 'Event Log', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeInspectorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveInspectorTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 font-semibold'
                      : 'text-grid-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-4 bg-black/30">
            {/* Algorand Tab with Lora Explorer Verification */}
            {activeInspectorTab === 'algorand' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-grid-400 uppercase tracking-wide">On-Chain Settlement Verification</span>
                  <span className="text-[10px] text-brand-emerald font-semibold bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/20">
                    Live on TestNet
                  </span>
                </div>
                
                {completedTask ? (
                  <div className="space-y-3">
                    {/* Official Lora Explorer Verification Box */}
                    <div className="bg-brand-emerald/10 p-3.5 rounded-lg border border-brand-emerald/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold flex items-center space-x-1.5">
                          <Search className="w-3.5 h-3.5 text-brand-emerald" />
                          <span>Inspect on Lora (AlgoKit)</span>
                        </span>
                        <a
                          href={loraUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-brand-emerald text-black font-bold text-[10px] uppercase flex items-center space-x-1 shadow-glow-emerald hover:bg-brand-emerald/90 transition-all"
                        >
                          <span>Open in Lora</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-[10px] text-grid-300 font-sans">
                        Verify this real on-chain transaction on the official AlgoKit Lora TestNet explorer:
                      </div>
                      <div className="text-[10px] text-brand-emerald truncate font-mono bg-black/60 p-1.5 rounded border border-brand-emerald/20">
                        {loraUrl}
                      </div>
                    </div>

                    <div className="bg-black/70 p-3 rounded-lg border border-white/[0.08] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-grid-400">Transaction ID</span>
                        <a
                          href={completedTask.algorandTx.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-emerald hover:underline flex items-center space-x-1 truncate max-w-[180px]"
                        >
                          <span className="truncate">{completedTask.algorandTx.txId}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-grid-400">Block Round</span>
                        <span className="text-white font-semibold">#{completedTask.algorandTx.round}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-grid-400">Total Settlement</span>
                        <div className="text-right">
                          <span className="text-brand-emerald font-semibold">{completedTask.actualCostAlgo} ALGO</span>
                          <span className="text-[10px] text-grid-400 block">≈ {(completedTask.actualCostAlgo * 0.22).toFixed(4)} USDC (ASA #10458941)</span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-grid-400">Protocol Fee (1.5%)</span>
                        <span className="text-grid-200 font-semibold">{completedTask.x402Challenge.agentGridFeeAlgo} ALGO</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-grid-400">Provider Net Payout</span>
                        <span className="text-grid-200 font-semibold">{completedTask.x402Challenge.providerPayoutAlgo} ALGO</span>
                      </div>
                    </div>

                    <div className="bg-black/70 p-3 rounded-lg border border-white/[0.08] space-y-1.5">
                      <div className="text-[10px] text-grid-400 uppercase">Cryptographic Payment Token</div>
                      <div className="text-[11px] text-white break-all bg-black p-2 rounded border border-white/[0.08]">
                        {completedTask.paymentProof.paymentToken}
                      </div>
                    </div>

                    {/* Download Cryptographic Audit Receipt Button */}
                    <button
                      onClick={exportCryptographicReceipt}
                      className="w-full py-2 px-3 rounded-lg bg-black hover:bg-white/[0.05] border border-white/[0.12] hover:border-brand-emerald/40 text-xs font-mono text-white hover:text-brand-emerald flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-emerald" />
                      <span>Download Cryptographic Receipt (.json)</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-grid-500 text-center py-12">
                    Algorand settlement details will render upon execution completion.
                  </div>
                )}
              </div>
            )}

            {/* x402 Facilitator Tab */}
            {activeInspectorTab === 'x402' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-grid-400 uppercase tracking-wide">GoPlausible x402 AVM Facilitator</span>
                  <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/20">
                    avm:exact
                  </span>
                </div>
                
                {completedTask ? (
                  <div className="space-y-2">
                    <div className="text-xs text-grid-300">
                      Standardized <span className="font-semibold text-brand-emerald">RFC 7235 / x402</span> headers verified through GoPlausible Facilitator:
                    </div>

                    <pre className="p-3 bg-black rounded-lg border border-white/[0.08] text-[11px] text-grid-200 overflow-x-auto">
{`HTTP/1.1 402 Payment Required
WWW-Authenticate: ${completedTask.x402Challenge.headers['WWW-Authenticate']}
X-402-Payment-Address: ${completedTask.x402Challenge.headers['X-402-Payment-Address']}
X-402-Amount: ${completedTask.x402Challenge.headers['X-402-Amount']} (µALGO)
X-402-Currency: ALGO-micro
X-402-Network: Algorand-TestNet
X-402-Facilitator: https://facilitator.goplausible.xyz
X-402-Scheme: avm:exact
X-402-Nonce: ${completedTask.x402Challenge.headers['X-402-Nonce']}`}
                    </pre>

                    <div className="p-3 bg-black/60 rounded-lg border border-white/[0.08] text-xs text-grid-300 space-y-1">
                      <div className="text-white font-bold">Facilitator Settlement Status:</div>
                      <div>• Provider Address: <code className="text-brand-emerald text-[11px]">{completedTask.x402Challenge.destinationAddress}</code></div>
                      <div>• Facilitator Endpoint: <code className="text-white text-[11px]">https://facilitator.goplausible.xyz</code></div>
                      <div>• Scheme: <code className="text-brand-emerald text-[11px]">avm:exact</code></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-grid-500 text-center py-12">
                    x402 challenge negotiation records will appear during execution.
                  </div>
                )}
              </div>
            )}

            {/* Events Log Tab */}
            {activeInspectorTab === 'events' && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-grid-400 uppercase tracking-wide">Real-time Pipeline Telemetry Events</div>
                <div className="space-y-2">
                  {events.map((ev, i) => (
                    <div key={i} className="p-2.5 bg-black rounded border border-white/[0.08] text-[11px]">
                      <div className="flex items-center justify-between text-grid-400 mb-1">
                        <span className="font-bold text-brand-emerald uppercase tracking-tight">{ev.stage}</span>
                        <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-white">{ev.message}</div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <div className="text-grid-500 text-center py-12">No telemetry events logged yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionPipeline;
