import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut, Radio } from 'lucide-react';

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
  const { isConnected, walletAddress, liveBalanceAlgo, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const navLinks = [
    { id: 'landing', label: 'Overview' },
    { id: 'command', label: 'Console' },
    { id: 'grid', label: 'Marketplace' },
    { id: 'routing', label: 'Matrix' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'x402-demo', label: 'x402 Testbed' },
  ];

  return (
    <header className="sticky top-4 z-50 w-full max-w-4xl mx-auto px-4">
      <div className="bg-black/85 backdrop-blur-2xl border border-white/[0.09] rounded-full px-4 py-2 flex items-center justify-between shadow-2xl shadow-black/80 transition-all">
        {/* Brand */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-2.5 group focus:outline-none pl-1"
        >
          <div className="w-6 h-6 rounded-md bg-brand-emerald flex items-center justify-center font-mono font-bold text-black text-xs shadow-glow-emerald group-hover:scale-105 transition-transform">
            AG
          </div>
          <span className="font-mono font-bold tracking-tight text-white text-sm group-hover:text-brand-emerald transition-colors">
            AgentGrid
          </span>
        </button>

        {/* Center Pill Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 font-semibold shadow-sm'
                    : 'text-grid-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action & Pera Wallet */}
        <div className="flex items-center space-x-2">
          {isStreaming && (
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-mono border border-brand-emerald/25 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
              <span>Running</span>
            </div>
          )}

          {isConnected && walletAddress ? (
            <div className="flex items-center space-x-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
              <span className="text-white font-medium">
                {liveBalanceAlgo !== null ? `${liveBalanceAlgo.toFixed(1)} ALGO` : 'Connected'}
              </span>
              <span className="text-grid-500 text-[10px] hidden sm:inline">
                ({walletAddress.substring(0, 4)}...{walletAddress.substring(walletAddress.length - 4)})
              </span>
              <button
                onClick={disconnectWallet}
                title="Disconnect Pera"
                className="hover:text-signal-rose ml-1 transition-colors"
              >
                <LogOut className="w-3 h-3 text-grid-400 hover:text-signal-rose" />
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] text-xs font-mono text-grid-200 hover:text-white transition-all active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5 text-brand-emerald" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Pera'}</span>
            </button>
          )}

          {activeTab === 'landing' ? (
            <button
              onClick={() => setActiveTab('command')}
              className="px-3.5 py-1 rounded-full bg-brand-emerald hover:bg-brand-emerald/90 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-glow-emerald active:scale-95"
            >
              Launch
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('landing')}
              className="hidden sm:inline-flex px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-grid-300 text-xs font-mono transition-all"
            >
              Overview
            </button>
          )}
        </div>
      </div>

      {/* Mobile Links Bar */}
      <div className="md:hidden flex overflow-x-auto py-2 space-x-1.5 mt-1 px-2 justify-center">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-emerald/20 text-brand-emerald font-medium border border-brand-emerald/30'
                  : 'text-grid-400 hover:text-grid-200'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

export default Navbar;
