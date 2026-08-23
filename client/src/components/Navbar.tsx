import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut, Radio, ArrowUpRight, Menu, X, ShieldCheck } from 'lucide-react';
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
    { id: 'command', label: 'Tasks', isPrimary: true },
    { id: 'grid', label: 'Marketplace' },
    { id: 'routing', label: 'Routing' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'x402-demo', label: 'x402 Testbed' }
  ];

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Tag */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('landing');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 sm:space-x-3 group focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 rounded-lg"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-950 flex items-center justify-center font-serif font-semibold text-white text-sm group-hover:bg-zinc-900 transition-colors">
                AG
              </div>
              <div className="flex flex-col text-left hidden sm:block">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="font-serif font-medium tracking-tight text-zinc-950 text-base sm:text-lg group-hover:text-emerald-600 transition-colors">
                    AgentGrid
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 tracking-wide font-mono">
                  Team LENA · x402 · Algorand
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-zinc-100 border border-zinc-200 p-1 rounded-full">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? 'bg-zinc-950 text-white font-bold shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
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
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-mono border border-emerald-100 animate-pulse">
                <Radio className="w-3 h-3 animate-spin text-emerald-600" />
                <span className="hidden sm:inline font-medium">Streaming</span>
              </div>
            )}

            {isConnected && walletAddress ? (
              <div className="flex items-center space-x-1.5 bg-zinc-100 border border-zinc-200 rounded-full pl-3 pr-2 py-1 text-xs font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span className="text-zinc-900 font-bold text-[11px] sm:text-xs">
                  {liveBalanceAlgo !== null ? `${liveBalanceAlgo.toFixed(1)}A` : 'Connected'}
                </span>
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Pera"
                  className="p-1 rounded-full hover:bg-zinc-200 text-zinc-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsGuideOpen(true)}
                disabled={isConnecting}
                title="Optional: pay a task's cost yourself with a personal Pera Wallet instead of the agent's own wallet"
                className="hidden sm:flex items-center space-x-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-900 transition-all"
              >
                <Wallet className="w-3 h-3 shrink-0" />
                <span>{isConnecting ? 'Connecting...' : 'Pera Wallet'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 active:scale-95 transition-all"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Expanded Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-3 animate-fadeIn font-mono text-xs shadow-xl" role="dialog" aria-label="Mobile navigation">
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
                    aria-current={isActive ? 'page' : undefined}
                    className={`p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-zinc-200 flex flex-col gap-2">
              <a
                href="https://bank.testnet.algorand.network/"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-center text-xs font-mono text-zinc-700 flex items-center justify-center space-x-1.5 hover:bg-zinc-200"
              >
                <span className="flex items-center gap-1.5">🚰 Open Algorand TestNet Faucet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {isConnected ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-zinc-900 font-bold">{liveBalanceAlgo?.toFixed(2)} ALGO</span>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-red-600 text-xs underline hover:text-red-700"
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
                  className="w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95 hover:bg-emerald-100"
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