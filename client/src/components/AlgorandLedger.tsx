import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  Server, 
  Copy, 
  Check, 
  ArrowUpRight, 
  RefreshCw,
  Wallet
} from 'lucide-react';
import { AlgorandAccountInfo, AlgorandTransactionRecord } from '../types';
import { fetchAccounts, fetchTransactions } from '../utils/api';

export const AlgorandLedger: React.FC = () => {
  const [accounts, setAccounts] = useState<AlgorandAccountInfo[]>([]);
  const [transactions, setTransactions] = useState<AlgorandTransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, txs] = await Promise.all([fetchAccounts(), fetchTransactions()]);
      setAccounts(accs);
      setTransactions(txs);
    } catch (err) {
      console.error('Failed to load ledger', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-grid-900 border border-grid-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-signal-emerald font-semibold">Algorand Settlement Layer</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-grid-100">
            x402 Micropayments & On-Chain Settlement Hub
          </h2>
          <p className="text-xs font-mono text-grid-400 mt-1 max-w-2xl">
            Autonomous agent wallets pay compute providers on a per-task basis. AgentGrid smart escrow enforces atomic settlements with a <span className="text-grid-200 font-semibold">1.5% protocol fee</span> routed to treasury.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 rounded-lg bg-grid-950 border border-grid-800 hover:border-grid-700 text-grid-400 hover:text-grid-200 text-xs font-mono flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Ledger</span>
        </button>
      </div>

      {/* Account Balances Grid */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-400 flex items-center space-x-2">
          <Wallet className="w-3.5 h-3.5 text-signal-amber" />
          <span>Network Participant Accounts (Algorand TestNet)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc, idx) => (
            <div
              key={idx}
              className="bg-grid-900 border border-grid-800 rounded-xl p-4 space-y-3 hover:border-grid-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-tight ${
                  acc.role === 'agent'
                    ? 'bg-signal-amberDim text-signal-amber border border-signal-amber/30'
                    : acc.role === 'treasury'
                    ? 'bg-signal-cyanDim text-signal-cyan border border-signal-cyan/30'
                    : 'bg-grid-800 text-grid-300'
                }`}>
                  {acc.role.toUpperCase()}
                </span>
                <span className="text-sm font-bold font-mono text-signal-emerald">
                  {acc.balanceAlgo.toFixed(3)} ALGO
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-grid-200 truncate">{acc.label}</div>
                <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-grid-500 bg-grid-950 p-2 rounded border border-grid-850">
                  <span className="truncate max-w-[200px]">{acc.address}</span>
                  <button
                    onClick={() => copyAddress(acc.address)}
                    className="text-grid-400 hover:text-grid-200 ml-1"
                    title="Copy Address"
                  >
                    {copiedAddress === acc.address ? <Check className="w-3 h-3 text-signal-emerald" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-grid-500">
                <a
                  href={acc.testnetExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-signal-amber hover:underline flex items-center space-x-1"
                >
                  <span>View on Pera / AlgoScan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-grid-900 border border-grid-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-grid-950 border-b border-grid-800 flex items-center justify-between">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-200 flex items-center space-x-2">
            <Coins className="w-3.5 h-3.5 text-signal-emerald" />
            <span>On-Chain Settlement History ({transactions.length} Transactions)</span>
          </div>
          <div className="text-[11px] font-mono text-grid-500">
            Algorand Genesis: <code className="text-grid-300 font-semibold">testnet-v1.0</code>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-grid-950/60 text-grid-400 text-[10px] uppercase border-b border-grid-800">
              <tr>
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Round</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Protocol Fee (1.5%)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grid-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-grid-850/50 transition-all">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-grid-200 truncate max-w-[160px] block">
                      {tx.txId}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-grid-400">#{tx.round}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-signal-emerald font-semibold">{tx.amountAlgo.toFixed(6)} ALGO</span>
                    <span className="text-[10px] text-grid-500 block">({Math.round(tx.amountAlgo * 1_000_000)} µALGO)</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-grid-300">{tx.protocolFeeAlgo.toFixed(6)} ALGO</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-signal-emeraldDim text-signal-emerald border border-signal-emerald/30">
                      CONFIRMED
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-grid-400 text-[11px]">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <a
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-signal-amber hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-grid-500 font-mono">
                    No transactions settled on Algorand yet. Execute a task to trigger automatic on-chain settlement!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
