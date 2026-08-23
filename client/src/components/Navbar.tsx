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

  const primaryLink = { id: 'command', label: 'Agent' };
  // Secondary/developer views — real detail behind the scenes, deliberately
  // not competing for attention with the one thing most people need: the
  // prompt box.
  const secondaryLinks = [
    { id: 'ledger', label: 'Ledger' },
    { id: 'grid', label: 'Marketplace' },
    { id: 'routing', label: 'Routing' },
    { id: 'x402-demo', label: 'x402 Testbed' },
    { id: 'landing', label: 'About' },
  ];
  const navLinks = [primaryLink, ...secondaryLinks];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/85 backdrop-blur-2xl transition-all">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-15 sm:h-18 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo & Tag */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('landing');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 sm:space-x-3 group focus:outline-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-emerald flex items-center justify-center font-serif font-semibold text-black text-sm shadow-glow-emerald group-hover:scale-105 transition-transform">
                AG
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="font-serif font-medium tracking-tight text-white text-base sm:text-lg group-hover:text-brand-emerald transition-colors">
                    AgentGrid
                  </span>
                </div>
                <span className="text-[10px] text-grid-500 tracking-wide">
                  Team LENA · x402 · Algorand
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation — one primary destination, the rest muted/secondary */}
          <nav className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => setActiveTab(primaryLink.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-200 ${
                activeTab === primaryLink.id
                  ? 'bg-brand-emerald text-black shadow-glow-emerald'
                  : 'bg-white/[0.06] text-white hover:bg-white/[0.1]'
              }`}
            >
              {primaryLink.label}
            </button>
            <div className="flex items-center space-x-0.5 pl-2 border-l border-white/[0.08]">
              {secondaryLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all duration-200 ${
                      isActive
                        ? 'text-brand-emerald font-semibold'
                        : 'text-grid-500 hover:text-grid-300'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Action & Pera Wallet */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {isStreaming && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-brand-emerald/10 text-brand-emerald text-[11px] font-mono border border-brand-emerald/25 animate-pulse">
                <Radio className="w-3 h-3 animate-spin text-brand-emerald" />
                <span className="hidden sm:inline">Streaming</span>
              </div>
            )}

            {/* Pera Wallet is an optional, secondary "pay it yourself" demo path —
                the agent pays autonomously with its own wallet by default, so
                this stays small and out of the way unless already connected. */}
            {isConnected && walletAddress ? (
              <div className="flex items-center space-x-1.5 bg-white/[0.04] border border-white/[0.12] rounded-full pl-2.5 sm:pl-3 pr-1.5 py-1 text-xs font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse shrink-0" />
                <span className="text-white font-bold text-[11px] sm:text-xs">
                  {liveBalanceAlgo !== null ? `${liveBalanceAlgo.toFixed(1)}A` : 'Connected'}
                </span>
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Pera"
                  className="p-1 rounded-full hover:bg-white/[0.1] text-grid-400 hover:text-signal-rose transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsGuideOpen(true)}
                disabled={isConnecting}
                title="Optional: pay a task's cost yourself with a personal Pera Wallet instead of the agent's own wallet"
                className="hidden sm:flex items-center space-x-1 text-[11px] font-mono text-grid-500 hover:text-grid-300 transition-all"
              >
                <Wallet className="w-3 h-3 shrink-0" />
                <span>{isConnecting ? 'Connecting...' : 'Pera Wallet'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1] active:scale-95 transition-all"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Quick-Bar */}
        <div className="lg:hidden flex items-center space-x-1.5 px-3 py-2 border-t border-white/[0.06] overflow-x-auto no-scrollbar bg-black/60">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/40 font-bold shadow-sm'
                    : 'text-grid-300 hover:text-white bg-white/[0.02] border border-white/[0.04]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Expanded Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.08] bg-black/98 px-4 py-4 space-y-3 animate-fadeIn font-mono text-xs shadow-2xl">
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
                        ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/40 font-bold'
                        : 'bg-white/[0.03] border border-white/[0.06] text-grid-300 hover:text-white'
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
