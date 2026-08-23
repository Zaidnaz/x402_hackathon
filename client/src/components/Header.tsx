import React from 'react';
import { useWallet } from '../context/WalletContext';
import { AlgorandAccountInfo } from '../types';
import { Wallet, LogOut, ExternalLink, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accounts: AlgorandAccountInfo[];
  isStreaming: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  accounts,
  isStreaming
}) => {
  const { isConnected, walletAddress, liveBalanceAlgo, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const agentAcc = accounts.find(a => a.role === 'agent');

  const navItems = [
    { id: 'landing', label: 'Overview' },
    { id: 'command', label: 'Console' },
    { id: 'grid', label: 'Marketplace' },
    { id: 'routing', label: 'Matrix' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'x402-demo', label: 'x402 Testbed' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-grid-800 bg-grid-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
        >
          <div className="w-6 h-6 rounded-md bg-signal-amber flex items-center justify-center font-mono font-bold text-grid-950 text-xs shadow-sm">
            AG
          </div>
          <span className="font-mono font-semibold tracking-tight text-grid-100 text-sm group-hover:text-signal-amber transition-colors">
            AgentGrid
          </span>
        </button>

        {/* Minimal Center Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-grid-100 font-medium shadow-sm'
                    : 'text-grid-400 hover:text-grid-200 hover:bg-grid-850'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status & Pera Wallet Connection */}
        <div className="flex items-center space-x-2.5">
          {isStreaming && (
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-signal-amber/10 text-signal-amber text-xs font-mono border border-signal-amber/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-amber" />
              <span>Running</span>
            </div>
          )}

          {/* Pera Wallet Connect Button / Connected Badge */}
          {isConnected && walletAddress ? (
            <div className="flex items-center space-x-1.5 bg-grid-850 border border-grid-800 rounded-full p-1 pl-3 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald animate-pulse" />
                <span className="text-grid-200 font-semibold">
                  {liveBalanceAlgo !== null ? `${liveBalanceAlgo.toFixed(2)} ALGO` : 'Pera Connected'}
                </span>
                <span className="text-grid-500 text-[10px] hidden md:inline">
                  ({walletAddress.substring(0, 4)}...{walletAddress.substring(walletAddress.length - 4)})
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                title="Disconnect Pera Wallet"
                className="p-1 rounded-full hover:bg-white/[0.08] text-grid-400 hover:text-signal-rose transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-signal-amber/10 hover:bg-signal-amber/20 text-signal-amber border border-signal-amber/30 text-xs font-mono transition-all active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Pera'}</span>
            </button>
          )}

          {activeTab === 'landing' && (
            <button
              onClick={() => setActiveTab('command')}
              className="hidden sm:inline-flex px-3 py-1 rounded-full bg-signal-amber hover:bg-signal-amber/90 text-grid-950 text-xs font-mono font-semibold transition-all active:scale-95 shadow-sm"
            >
              Launch
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

