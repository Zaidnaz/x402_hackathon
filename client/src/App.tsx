import React, { useState, useEffect } from 'react';
import { WalletProvider } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CommandCenter } from './components/CommandCenter';
import { ExecutionPipeline } from './components/ExecutionPipeline';
import { MarketplaceGrid } from './components/MarketplaceGrid';
import { RoutingMatrix } from './components/RoutingMatrix';
import { AlgorandLedger } from './components/AlgorandLedger';
import { AnalyticsHUD } from './components/AnalyticsHUD';
import { DirectX402Demo } from './components/DirectX402Demo';
import { ProviderRegisterModal } from './components/ProviderRegisterModal';
import { SpendingGovernanceWidget } from './components/SpendingGovernanceWidget';
import { DecompositionWidget } from './components/DecompositionWidget';
import {
  TaskRequirement,
  ExecutionEvent,
  CompletedPlan,
  ExecutionStage,
  ModelProvider,
  ComputeProvider,
  AlgorandAccountInfo,
  ApprovalRequiredInfo,
  EventStepContext
} from './types';
import {
  fetchCatalog,
  fetchAccounts,
  subscribeTaskPlanStream,
  subscribeTaskStream,
  FALLBACK_MODELS,
  FALLBACK_COMPUTES
} from './utils/api';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<'landing' | 'command' | 'grid' | 'routing' | 'ledger' | 'analytics' | 'x402-demo'>('command');
  const [models, setModels] = useState<ModelProvider[]>(FALLBACK_MODELS);
  const [computes, setComputes] = useState<ComputeProvider[]>(FALLBACK_COMPUTES);
  const [accounts, setAccounts] = useState<AlgorandAccountInfo[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Execution state
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStage, setCurrentStage] = useState<ExecutionStage>('idle');
  const [pipelineEvents, setPipelineEvents] = useState<ExecutionEvent[]>([]);
  
  // Single-Step vs Decomposition switch
  const [forceSingleStep, setForceSingleStep] = useState(false);

  // Keyed by step index - a plan is always at least one step, even a
  // "single deliverable" prompt, so this uniformly covers both cases.
  const [streamedOutputByStep, setStreamedOutputByStep] = useState<Record<number, string>>({});
  const [completedPlan, setCompletedPlan] = useState<CompletedPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequiredInfo | null>(null);

  const [activeStreamUnsub, setActiveStreamUnsub] = useState<(() => void) | null>(null);
  // Remembered so "Approve & Pay" can re-dispatch the exact same task.
  const [lastDispatch, setLastDispatch] = useState<{ prompt: string; overrides: Partial<TaskRequirement>; simulateFailover: boolean } | null>(null);

  const loadInitialData = async () => {
    try {
      const [cat, accs] = await Promise.all([fetchCatalog(), fetchAccounts()]);
      if (cat?.models?.length) setModels(cat.models);
      if (cat?.computes?.length) setComputes(cat.computes);
      if (accs?.length) setAccounts(accs);
    } catch (err) {
      console.warn('Using local fallback seed data', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleDispatchTask = (
    prompt: string,
    overrides: Partial<TaskRequirement>,
    simulateFailover: boolean,
    humanApproved: boolean = false
  ) => {
    if (activeStreamUnsub) {
      activeStreamUnsub();
    }
    setLastDispatch({ prompt, overrides, simulateFailover });
    setIsStreaming(true);
    setCurrentStage('planning');
    setPipelineEvents([]);
    setStreamedOutputByStep({});
    setCompletedPlan(null);
    setErrorMessage(null);
    setPendingApproval(null);

    const onEvent = (event: ExecutionEvent) => {
      setCurrentStage(event.stage);
      setPipelineEvents(prev => [...prev, event]);
    };

    const onTokenChunk = (chunk: string, step?: EventStepContext) => {
      const idx = step?.index ?? 0;
      setStreamedOutputByStep(prev => ({ ...prev, [idx]: (prev[idx] || '') + chunk }));
    };

    const onError = (error: string) => {
      console.error('Stream error', error);
      setIsStreaming(false);
      setCurrentStage('failed');
      setErrorMessage(error || 'The agent lost connection to the server mid-task.');
    };

    let unsub: () => void;

    if (forceSingleStep) {
      // Execute single task stream, then map/normalize to completedPlan shape
      unsub = subscribeTaskStream(
        prompt,
        overrides,
        simulateFailover,
        onEvent,
        (chunk) => onTokenChunk(chunk),
        (task) => {
          const normalizedPlan: CompletedPlan = {
            id: `plan_${task.id}`,
            prompt: task.prompt,
            plan: { steps: [{ title: 'Direct Execution', prompt: task.prompt }], planned: false, reasoning: 'Direct execution without planning.' },
            steps: [task],
            totalCostAlgo: task.actualCostAlgo,
            totalDurationMs: task.actualDurationMs,
            status: task.status === 'completed' || task.status === 'rerouted' ? 'completed' : 'failed',
            completedAt: task.completedAt
          };
          setCompletedPlan(normalizedPlan);
          setIsStreaming(false);
          setCurrentStage('plan_completed');
          fetchAccounts().then(setAccounts).catch(console.error);
        },
        onError
      );
    } else {
      // Execute multi-step task plan stream
      unsub = subscribeTaskPlanStream(
        prompt,
        overrides,
        simulateFailover,
        humanApproved,
        onEvent,
        onTokenChunk,
        (plan) => {
          setCompletedPlan(plan);
          setIsStreaming(false);
          setCurrentStage('plan_completed');
          fetchAccounts().then(setAccounts).catch(console.error);
        },
        onError,
        (info) => {
          setPendingApproval(info);
          setIsStreaming(false);
          setCurrentStage('awaiting_approval');
        }
      );
    }

    setActiveStreamUnsub(() => unsub);
  };

  const handleApprove = () => {
    if (!lastDispatch) return;
    handleDispatchTask(lastDispatch.prompt, lastDispatch.overrides, lastDispatch.simulateFailover, true);
  };

  const handleResetPipeline = () => {
    if (activeStreamUnsub) activeStreamUnsub();
    setIsStreaming(false);
    setCurrentStage('idle');
    setPipelineEvents([]);
    setStreamedOutputByStep({});
    setCompletedPlan(null);
    setErrorMessage(null);
    setPendingApproval(null);
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-grid-950 text-grid-100 flex flex-col font-sans grid-bg-pattern relative selection:bg-brand-emerald/15 selection:text-brand-emerald">
      {/* Floating Modern Pill Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10 overflow-x-hidden">
        {activeTab === 'landing' && (
          <LandingPage
            onEnterApp={() => setActiveTab('command')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'command' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 animate-fadeIn max-w-6xl mx-auto items-start">
            {/* Left Column: Input and Stream output */}
            <div className="space-y-6">
              <CommandCenter
                onDispatchTask={handleDispatchTask}
                isStreaming={isStreaming}
              />

              {(currentStage !== 'idle' || completedPlan || pendingApproval) && (
                <div className="pt-6 border-t border-grid-800 animate-fadeIn">
                  <ExecutionPipeline
                    events={pipelineEvents}
                    currentStage={currentStage}
                    streamedOutputByStep={streamedOutputByStep}
                    completedPlan={completedPlan}
                    isStreaming={isStreaming}
                    errorMessage={errorMessage}
                    pendingApproval={pendingApproval}
                    onApprove={handleApprove}
                    onReset={handleResetPipeline}
                  />
                </div>
              )}
            </div>

            {/* Right Column: Governance Sidebar widgets */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <SpendingGovernanceWidget onPolicyUpdated={loadInitialData} />
              
              <DecompositionWidget
                forceSingleStep={forceSingleStep}
                setForceSingleStep={setForceSingleStep}
                isStreaming={isStreaming}
                completedPlan={completedPlan}
              />
            </div>
          </div>
        )}

        {activeTab === 'grid' && (
          <div className="animate-fadeIn max-w-6xl mx-auto">
            <MarketplaceGrid
              models={models}
              computes={computes}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onRefreshCatalog={loadInitialData}
            />
          </div>
        )}

        {activeTab === 'routing' && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <RoutingMatrix />
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <AlgorandLedger />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <AnalyticsHUD />
          </div>
        )}

        {activeTab === 'x402-demo' && (
          <div className="animate-fadeIn max-w-4xl mx-auto">
            <DirectX402Demo />
          </div>
        )}
      </main>

      {/* Provider Registration Modal */}
      <ProviderRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={loadInitialData}
      />

      {/* Minimal Clean Footer */}
      <footer className="border-t border-grid-800 bg-grid-950/85 backdrop-blur-md py-6 mt-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-caption text-grid-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-amber" />
            <span className="text-grid-300 font-semibold">AgentGrid</span>
            <span>Compute routing and settlement workspace</span>
          </div>
          <div>
            Settlement: <span className="text-grid-300">Algorand TestNet</span> · Standard: <span className="text-grid-300">RFC 7235 / x402</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <WalletProvider>
      <MainLayout />
    </WalletProvider>
  );
}

export default App;
