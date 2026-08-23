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
  CompletedTask, 
  ExecutionStage, 
  ModelProvider, 
  ComputeProvider, 
  AlgorandAccountInfo 
} from './types';
import { 
  fetchCatalog, 
  fetchAccounts, 
  subscribeTaskStream,
  FALLBACK_MODELS,
  FALLBACK_COMPUTES
} from './utils/api';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<'landing' | 'command' | 'grid' | 'routing' | 'ledger' | 'analytics' | 'x402-demo'>('landing');
  const [models, setModels] = useState<ModelProvider[]>(FALLBACK_MODELS);
  const [computes, setComputes] = useState<ComputeProvider[]>(FALLBACK_COMPUTES);
  const [accounts, setAccounts] = useState<AlgorandAccountInfo[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Execution state
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStage, setCurrentStage] = useState<ExecutionStage>('idle');
  const [pipelineEvents, setPipelineEvents] = useState<ExecutionEvent[]>([]);
  const [streamedOutput, setStreamedOutput] = useState('');
  const [completedTask, setCompletedTask] = useState<CompletedTask | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeStreamUnsub, setActiveStreamUnsub] = useState<(() => void) | null>(null);

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
    customPeraTx?: { txId: string; round: number; explorerUrl: string; loraUrl: string }
  ) => {
    if (activeStreamUnsub) {
      activeStreamUnsub();
    }
    setIsStreaming(true);
    setCurrentStage('analyzing_intent');
    setPipelineEvents([]);
    setStreamedOutput('');
    setCompletedTask(null);
    setErrorMessage(null);

    const unsub = subscribeTaskStream(
      prompt,
      overrides,
      simulateFailover,
      (event) => {
        setCurrentStage(event.stage);
        setPipelineEvents(prev => [...prev, event]);
      },
      (chunk) => {
        setStreamedOutput(prev => prev + chunk);
      },
      (task) => {
        const finalTask = customPeraTx ? {
          ...task,
          algorandTx: {
            ...task.algorandTx,
            txId: customPeraTx.txId,
            round: customPeraTx.round,
            explorerUrl: customPeraTx.explorerUrl,
            loraUrl: customPeraTx.loraUrl
          },
          paymentProof: {
            ...task.paymentProof,
            txId: customPeraTx.txId,
            round: customPeraTx.round
          }
        } : task;

        setCompletedTask(finalTask);
        setIsStreaming(false);
        setCurrentStage('completed');
        fetchAccounts().then(setAccounts).catch(console.error);
      },
      (error) => {
        console.error('Stream error', error);
        setIsStreaming(false);
        setCurrentStage('failed');
        setErrorMessage(error || 'The agent lost connection to the server mid-task.');
      }
    );

    setActiveStreamUnsub(() => unsub);
  };

  const handleResetPipeline = () => {
    if (activeStreamUnsub) activeStreamUnsub();
    setIsStreaming(false);
    setCurrentStage('idle');
    setPipelineEvents([]);
    setStreamedOutput('');
    setCompletedTask(null);
    setErrorMessage(null);
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

            {(currentStage !== 'idle' || completedTask) && (
              <div className="pt-6 border-t border-grid-800 animate-fadeIn">
                <ExecutionPipeline
                  events={pipelineEvents}
                  currentStage={currentStage}
                  streamedOutput={streamedOutput}
                  completedTask={completedTask}
                  isStreaming={isStreaming}
                  errorMessage={errorMessage}
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
              onSelectNode={() => setActiveTab('command')}
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
