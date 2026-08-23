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
import {
  TaskRequirement,
  ExecutionEvent,
  CompletedPlan,
  ExecutionStage,
  ModelProvider,
  ComputeProvider,
  AlgorandAccountInfo,
  ApprovalRequiredInfo
} from './types';
import {
  fetchCatalog,
  fetchAccounts,
  subscribeTaskPlanStream,
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
  // Keyed by step index — a plan is always at least one step, even a
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

    const unsub = subscribeTaskPlanStream(
      prompt,
      overrides,
      simulateFailover,
      humanApproved,
      (event) => {
        setCurrentStage(event.stage);
        setPipelineEvents(prev => [...prev, event]);
      },
      (chunk, step) => {
        const idx = step?.index ?? 0;
        setStreamedOutputByStep(prev => ({ ...prev, [idx]: (prev[idx] || '') + chunk }));
      },
      (plan) => {
        setCompletedPlan(plan);
        setIsStreaming(false);
        setCurrentStage('plan_completed');
        fetchAccounts().then(setAccounts).catch(console.error);
      },
      (error) => {
        console.error('Stream error', error);
        setIsStreaming(false);
        setCurrentStage('failed');
        setErrorMessage(error || 'The agent lost connection to the server mid-task.');
      },
      (info) => {
        setPendingApproval(info);
        setIsStreaming(false);
        setCurrentStage('awaiting_approval');
      }
    );

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
    <div className="min-h-screen max-w-full overflow-x-hidden bg-grid-950 text-grid-100 flex flex-col font-sans grid-bg-pattern relative selection:bg-signal-amber/20 selection:text-signal-amber">
      {/* Floating Modern Pill Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 relative z-10 overflow-x-hidden">
        {activeTab === 'landing' && (
          <LandingPage
            onEnterApp={() => setActiveTab('command')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'command' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
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
        )}

        {activeTab === 'grid' && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
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
      <footer className="border-t border-grid-850 bg-grid-950/80 backdrop-blur-md py-6 mt-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-grid-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-amber" />
            <span className="text-grid-300 font-semibold">AgentGrid</span>
            <span>— Autonomous Infrastructure Layer</span>
          </div>
          <div>
            Settlement: <span className="text-grid-300">Algorand TestNet</span> • Standard: <span className="text-grid-300">RFC 7235 / x402</span>
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
