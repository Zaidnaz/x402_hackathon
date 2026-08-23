import React, { useState, useEffect } from 'react';
import { Wallet, Loader2, RefreshCw, X, ShieldCheck, Coins, AlertTriangle } from 'lucide-react';
import { useEscrow } from '../context/EscrowContext';
import { useWallet } from '../context/WalletContext';
import { fetchFundingStatus } from '../utils/api';

export const EscrowPanel: React.FC<{ isStreaming: boolean }> = ({ isStreaming }) => {
  const { state, depositEscrow, releaseEscrow, resetEscrow, canExecuteSilently } = useEscrow();
  const { isConnected, walletAddress, liveBalanceAlgo } = useWallet();
  const [depositAmount, setDepositAmount] = useState(2);
  const [taskCount, setTaskCount] = useState(10);
  const [depositing, setDepositing] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [funding, setFunding] = useState<{ isFunded: boolean; balanceAlgo: number; fundUrl: string; agentAddress: string } | null>(null);

  useEffect(() => {
    fetchFundingStatus().then(setFunding).catch(() => setFunding(null));
  }, []);

  const handleDeposit = async () => {
    if (!isConnected) {
      alert('Please connect Pera Wallet first');
      return;
    }
    setDepositing(true);
    try {
      const success = await depositEscrow(depositAmount, taskCount);
      if (success) {
        setDepositAmount(2);
        setTaskCount(10);
      }
    } finally {
      setDepositing(false);
    }
  };

  const handleRelease = async () => {
    setReleasing(true);
    try {
      await releaseEscrow();
    } finally {
      setReleasing(false);
    }
  };

  const handleReset = () => {
    resetEscrow();
  };

  if (!state.isActive) {
    return (
      <div className="card-light p-4 space-y-4 border-amber-200 bg-amber-50/50 animate-slideDown">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-800">Session Lock (Escrow)</span>
        </div>

        <p className="text-sm text-zinc-600 font-sans">
          Pre-authorize a batch of tasks with a single wallet signature. The agent will execute silently
          without prompting for each payment.
        </p>

        {!isConnected && (
          <div className="p-3 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-600">
            <Wallet className="w-4 h-4 inline mr-1 text-zinc-400" />
            Connect Pera Wallet to enable escrow
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-zinc-600 block mb-1 text-xs font-mono">Deposit Amount (ALGO)</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="50"
              value={depositAmount}
              onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-zinc-300 rounded p-2 text-zinc-900 focus:outline-none focus:border-emerald-600 text-sm"
            />
          </div>
          <div>
            <label className="text-zinc-600 block mb-1 text-xs font-mono">Tasks Authorized</label>
            <input
              type="number"
              min="1"
              max="100"
              value={taskCount}
              onChange={(e) => setTaskCount(parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-zinc-300 rounded p-2 text-zinc-900 focus:outline-none focus:border-emerald-600 text-sm"
            />
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 font-sans">
          Estimated: <strong className="text-zinc-800">{depositAmount} ALGO</strong> for <strong className="text-zinc-800">{taskCount}</strong> tasks
          <span className="text-amber-700"> (~{(depositAmount / taskCount).toFixed(4)} ALGO/task)</span>
        </div>

        {funding && !funding.isFunded && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700 font-sans">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
            Agent wallet needs funding! <a href={funding.fundUrl} target="_blank" rel="noreferrer" className="underline font-semibold">Fund agent wallet</a> for autonomous payments.
          </div>
        )}

        <button
          onClick={handleDeposit}
          disabled={depositing || !isConnected || depositAmount <= 0 || taskCount <= 0}
          className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lock Session & Deposit Escrow'}</span>
        </button>
      </div>
    );
  }

  const progress = state.tasksAuthorized > 0 ? (state.tasksUsed / state.tasksAuthorized) * 100 : 0;
  const balanceProgress = state.totalDepositedAlgo > 0 ? (state.remainingBalanceAlgo / state.totalDepositedAlgo) * 100 : 0;

  return (
    <div className="card-light p-4 space-y-4 border-emerald-200 bg-emerald-50/40 animate-slideDown">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-800">Session Lock Active</span>
        </div>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          aria-label="Release and reset escrow"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-white border border-zinc-200 rounded-lg p-3">
          <div className="flex items-center space-x-1.5 text-zinc-500 mb-1">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>Balance</span>
          </div>
          <div className="text-emerald-700 font-bold font-mono">{state.remainingBalanceAlgo.toFixed(4)} / {state.totalDepositedAlgo.toFixed(4)} ALGO</div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${balanceProgress}%` }} />
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg p-3">
          <div className="flex items-center space-x-1.5 text-zinc-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
            <span>Tasks</span>
          </div>
          <div className="text-zinc-800 font-bold font-mono">{state.tasksUsed} / {state.tasksAuthorized}</div>
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-zinc-700 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="text-[11px] text-zinc-600 font-sans flex items-center space-x-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Silent execution enabled — agent pays automatically from escrow</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleRelease}
          disabled={releasing || state.remainingBalanceAlgo <= 0}
          className="flex-1 py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-1.5 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Coins className="w-3.5 h-3.5" />
          <span>{releasing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Release Remaining'}</span>
        </button>
        <button
          onClick={handleReset}
          className="flex-1 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 hover:text-zinc-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {walletAddress && liveBalanceAlgo !== null && liveBalanceAlgo < 1 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-700 font-sans">
          <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
          Your wallet balance is low (<strong>{liveBalanceAlgo.toFixed(2)} ALGO</strong>).
          <a href="https://bank.testnet.algorand.network/" target="_blank" rel="noreferrer" className="underline font-semibold">Get TestNet ALGO</a>
        </div>
      )}
    </div>
  );
};

export default EscrowPanel;