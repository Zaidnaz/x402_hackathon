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
    { id: 'landing', label: 'Overview' },
    { id: 'command', label: 'Console' },
    { id: 'grid', label: 'Marketplace' },
    { id: 'routing', label: 'Routing Matrix' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'x402-demo', label: 'x402 Testbed' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-black/80 backdrop-blur-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
          {/* Brand Logo & Tag */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('landing');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-emerald flex items-center justify-center font-mono font-extrabold text-black text-sm shadow-glow-emerald group-hover:scale-105 transition-transform">
                AG
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold tracking-tight text-white text-base group-hover:text-brand-emerald transition-colors">
                    AgentGrid
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30">
                    Team LENA
                  </span>
                </div>
                <span className="text-[10px] font-mono text-grid-400 tracking-wider uppercase -mt-0.5">
                  x402 // Algorand
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Center Navigation with Generous Spacing */}
          <nav className="hidden lg:flex items-center space-x-1.5 bg-grid-950/80 p-1.5 rounded-full border border-white/[0.08]">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 font-semibold shadow-sm'
                      : 'text-grid-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Pera Wallet with Proper Spacing */}
          <div className="hidden sm:flex items-center space-x-3 shrink-0">
            {isStreaming && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-mono border border-brand-emerald/25 animate-pulse">
                <Radio className="w-3.5 h-3.5 animate-spin text-brand-emerald" />
                <span>Streaming</span>
              </div>
            )}

            {isConnected && walletAddress ? (
              <div className="flex items-center space-x-2 bg-black/60 border border-white/[0.10] rounded-full pl-3.5 pr-2 py-1.5 text-xs font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                <span className="text-white font-semibold">
                  {liveBalanceAlgo !== null ? `${liveBalanceAlgo.toFixed(2)} ALGO` : 'Connected'}
                </span>
                <span className="text-grid-500 text-[11px] hidden md:inline">
                  ({walletAddress.substring(0, 4)}...{walletAddress.substring(walletAddress.length - 4)})
                </span>
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Pera"
                  className="p-1 rounded-full hover:bg-white/[0.1] text-grid-400 hover:text-signal-rose transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsGuideOpen(true)}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-emerald/10 hover:bg-brand-emerald/20 border border-brand-emerald/30 text-xs font-mono text-brand-emerald hover:text-white transition-all shadow-sm active:scale-95"
              >
                <Wallet className="w-4 h-4 text-brand-emerald" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Pera (TestNet)'}</span>
              </button>
            )}

            {activeTab === 'landing' ? (
              <button
                onClick={() => setActiveTab('command')}
                className="px-5 py-2 rounded-full bg-brand-emerald hover:bg-brand-emerald/90 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-glow-emerald active:scale-95"
              >
                Launch Console
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('landing')}
                className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-grid-300 hover:text-white text-xs font-mono transition-all"
              >
                Overview
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-grid-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.08] bg-black/95 px-4 py-4 space-y-3 animate-fadeIn font-mono text-xs">
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
                    className={`p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 font-semibold'
                        : 'bg-white/[0.02] border border-white/[0.05] text-grid-300'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
              {isConnected ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                    <span className="text-white">{liveBalanceAlgo?.toFixed(2)} ALGO</span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="text-signal-rose text-[11px] underline"
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
                  className="w-full py-3 rounded-xl bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Pera (TestNet)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTab(activeTab === 'landing' ? 'command' : 'landing');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-brand-emerald text-black font-bold uppercase tracking-wider"
              >
                {activeTab === 'landing' ? 'Launch Console' : 'Overview'}
              </button>
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
