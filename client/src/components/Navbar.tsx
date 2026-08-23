import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut, Radio, ArrowUpRight, Menu, X } from 'lucide-react';
import { PeraTestnetModal } from './PeraTestnetModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isStreaming: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isStreaming
}) => {
  const { isConnected, walletAddress, liveBalanceAlgo, isConnecting, disconnectWallet } = useWallet();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'About' },
    { id: 'command', label: 'Agent' },
    { id: 'grid', label: 'Marketplace' },
    { id: 'routing', label: 'Routing' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'x402-demo', label: 'x402 Testbed' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 transition-all">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Tag */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('landing');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 sm:space-x-3 group focus:outline-none"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-white text-xs">
                AG
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="font-mono font-semibold tracking-tight text-white text-sm sm:text-base">
                    AgentGrid
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 tracking-wide">
                  Team LENA · x402 · Algorand
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Pera Wallet */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {isStreaming && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 text-[11px] font-mono border border-zinc-700">
                <Radio className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Streaming</span>
              </div>
            )}

            {isConnected && walletAddress ? (
              <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 rounded-lg pl-2.5 sm:pl-3 pr-1.5 py-1 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-white font-medium text-[11px] sm:text-xs">
                  {liveBalanceAlgo !== null ? `${liveBalanceAlgo.toFixed(1)}A` : 'Connected'}
                </span>
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Pera"
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsGuideOpen(true)}
                disabled={isConnecting}
                title="Optional: pay a task's cost yourself with a personal Pera Wallet instead of the agent's own wallet"
                className="hidden sm:flex items-center space-x-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
              >
                <Wallet className="w-3 h-3 shrink-0" />
                <span>{isConnecting ? 'Connecting...' : 'Pera Wallet'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-all"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Quick-Bar */}
        <div className="lg:hidden flex items-center space-x-1.5 px-3 py-2 border-t border-zinc-800 overflow-x-auto no-scrollbar bg-zinc-950">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Expanded Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3 font-mono text-xs shadow-xl">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
              <a
                href="https://bank.testnet.algorand.network/"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center text-xs font-mono text-grid-300 flex items-center justify-center space-x-1.5"
              >
                <span>🚰 Open Algorand TestNet Faucet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {isConnected ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                    <span className="text-white font-bold">{liveBalanceAlgo?.toFixed(2)} ALGO</span>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-signal-rose text-xs underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsGuideOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald font-bold uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Pera (TestNet)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Pera TestNet Connection Modal */}
      <PeraTestnetModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};

export default Navbar;
