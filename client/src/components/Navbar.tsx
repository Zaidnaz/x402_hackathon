import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut, Radio, ArrowUpRight, Menu, X, Settings } from 'lucide-react';
import { PeraTestnetModal } from './PeraTestnetModal';
import { SpendingPolicyModal } from './SpendingPolicyModal';

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
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const primaryLink = { id: 'command', label: 'Tasks' };
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
      <header className="sticky top-0 z-50 w-full border-b border-grid-800 bg-grid-950/90 backdrop-blur-xl transition-all">
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
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-control bg-brand-emerald flex items-center justify-center font-serif font-semibold text-white text-sm group-hover:scale-105 transition-transform">
                AG
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif font-medium tracking-tight text-grid-100 text-base sm:text-lg group-hover:text-brand-emerald transition-colors">
                  AgentGrid
                </span>
                <span className="text-micro text-grid-500 tracking-wide">
                  x402 payments · Algorand
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation - one primary destination, the rest muted/secondary */}
          <nav className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => setActiveTab(primaryLink.id)}
              className={`px-4 py-1.5 rounded-full text-body-sm font-medium transition-all duration-200 ${
                activeTab === primaryLink.id
                  ? 'bg-brand-emerald text-white'
                  : 'bg-grid-850 text-grid-100 hover:bg-grid-800'
              }`}
            >
              {primaryLink.label}
            </button>
            <div className="flex items-center space-x-0.5 pl-2 border-l border-grid-800">
              {secondaryLinks.map((link) => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`px-2.5 py-1 rounded-full text-caption transition-all duration-200 ${
                      isActive
                        ? 'text-brand-emerald font-medium'
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
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-brand-emerald/10 text-brand-emerald text-caption border border-brand-emerald/25">
                <Radio className="w-3 h-3 animate-spin text-brand-emerald" />
                <span className="hidden sm:inline">Streaming</span>
              </div>
            )}

            <button
              onClick={() => setIsPolicyOpen(true)}
              title="Spending governance"
              className="p-1.5 rounded-control text-grid-500 hover:text-grid-100 hover:bg-grid-850 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Pera Wallet is an optional, secondary "pay it yourself" demo path -
                the agent pays autonomously with its own wallet by default, so
                this stays small and out of the way unless already connected. */}
            {isConnected && walletAddress ? (
              <div className="flex items-center space-x-1.5 bg-grid-850 border border-grid-750 rounded-full pl-2.5 sm:pl-3 pr-1.5 py-1 text-caption">
                <span className="w-2 h-2 rounded-full bg-brand-emerald shrink-0" />
                <span className="text-grid-100 font-medium">
                  {liveBalanceAlgo !== null ? `${liveBalanceAlgo.toFixed(1)}A` : 'Connected'}
                </span>
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Pera"
                  className="p-1 rounded-full hover:bg-grid-800 text-grid-400 hover:text-signal-rose transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsGuideOpen(true)}
                disabled={isConnecting}
                title="Optional: pay a task's cost yourself with a personal Pera Wallet instead of the agent's own wallet"
                className="hidden sm:flex items-center space-x-1 text-caption text-grid-500 hover:text-grid-300 transition-all"
              >
                <Wallet className="w-3 h-3 shrink-0" />
                <span>{isConnecting ? 'Connecting...' : 'Pera Wallet'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-control bg-grid-850 border border-grid-750 text-grid-100 hover:bg-grid-800 active:scale-95 transition-all"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Quick-Bar */}
        <div className="lg:hidden flex items-center space-x-1.5 px-3 py-2 border-t border-grid-800 overflow-x-auto no-scrollbar bg-grid-950/60">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 rounded-control text-caption whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 font-medium'
                    : 'text-grid-300 hover:text-grid-100 bg-grid-850 border border-grid-800'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Expanded Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-grid-800 bg-grid-950 px-4 py-4 space-y-3 animate-fadeIn text-body-sm shadow-md">
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
                    className={`p-3 rounded-control text-left transition-all ${
                      isActive
                        ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 font-medium'
                        : 'bg-grid-850 border border-grid-750 text-grid-300 hover:text-grid-100'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-grid-800 flex flex-col gap-2">
              <a
                href="https://bank.testnet.algorand.network/"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-control bg-grid-850 border border-grid-750 text-center text-body-sm text-grid-300 flex items-center justify-center space-x-1.5"
              >
                <span>Open Algorand TestNet Faucet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              {isConnected ? (
                <div className="flex items-center justify-between p-3 rounded-control bg-grid-850 border border-grid-750">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-brand-emerald" />
                    <span className="text-grid-100 font-medium">{liveBalanceAlgo?.toFixed(2)} ALGO</span>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-signal-rose text-body-sm underline"
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
                  className="w-full py-3 rounded-control bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald font-medium flex items-center justify-center space-x-2 active:scale-95"
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

      <SpendingPolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
      />
    </>
  );
};

export default Navbar;

