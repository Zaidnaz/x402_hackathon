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
  Wallet,
  Search
} from 'lucide-react';
import { AlgorandAccountInfo, AlgorandTransactionRecord } from '../types';
import { fetchAccounts, fetchTransactions } from '../utils/api';
import { HowThisWorksButton } from './HowThisWorksButton';

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
      <div className="bg-black/75 border border-white/[0.08] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-brand-emerald font-semibold">Algorand TestNet Settlement Layer</span>
          </div>
          <p className="text-xs font-mono text-grid-300 mt-1 max-w-2xl">
            Autonomous agent wallets pay compute providers on a per-task basis. AgentGrid smart escrow enforces atomic settlements with a <span className="text-white font-semibold">1.5% protocol fee</span> routed to treasury.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <HowThisWorksButton
            guide={{
              pageTitle: "Algorand TestNet Settlement & Audit Hub",
              badge: "Audit Infrastructure",
              tagline: "Immutable On-Chain Verification & Fee Flow",
              overview: "Every AI inference request routed through AgentGrid produces an immutable on-chain transaction receipt on Algorand TestNet, linking the API call, round number, micro-ALGO fee, and GoPlausible facilitator token.",
              steps: [
                {
                  title: "1. Monitor Participant Balances",
                  desc: "Inspect live balances of autonomous Agent Wallets, decentralized GPU Node accounts, and the Protocol Treasury fee receiver.",
                  highlightAction: "Account Cards"
                },
                {
                  title: "2. Inspect Transaction Receipts",
                  desc: "Every completed inference workload records its transaction ID, round height, exact micro-ALGO amount, and confirmed status.",
                  highlightAction: "Transaction Table"
                },
                {
                  title: "3. 1-Click Lora Explorer Proof",
                  desc: "Click 'Lora' on any row to open the transaction directly on the official AlgoKit Lora TestNet explorer.",
                  highlightAction: "Lora Button"
                }
              ],
              whatToLookFor: [
                "1.5% protocol fee automatically deducted and routed to the treasury wallet.",
                "Real block round numbers from Algorand TestNet.",
                "Direct links to official Lora and Pera blockchain explorers."
              ],
              evaluationTip: "Copy any transaction ID from this table and search it on https://lora.algokit.io/testnet to prove zero non-repudiation!"
            }}
          />

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-lg bg-black/60 border border-white/[0.08] hover:border-white/[0.2] text-grid-300 hover:text-white text-xs font-mono flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-emerald' : ''}`} />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-400 flex items-center space-x-2">
          <Wallet className="w-3.5 h-3.5 text-brand-emerald" />
          <span>Network Participant Accounts (Algorand TestNet)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc, idx) => (
            <div
              key={idx}
              className="bg-black/60 border border-white/[0.08] rounded-xl p-4 space-y-3 hover:border-brand-emerald/40 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-tight ${
                  acc.role === 'agent'
                    ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30'
                    : acc.role === 'treasury'
                    ? 'bg-white/[0.1] text-white border border-white/[0.2]'
                    : 'bg-black text-grid-300 border border-white/[0.06]'
                }`}>
                  {acc.role.toUpperCase()}
                </span>
                <span className="text-sm font-bold font-mono text-brand-emerald">
                  {acc.balanceAlgo.toFixed(3)} ALGO
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-white truncate">{acc.label}</div>
                <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-grid-400 bg-black p-2 rounded border border-white/[0.08]">
                  <span className="truncate max-w-[200px]">{acc.address}</span>
                  <button
                    onClick={() => copyAddress(acc.address)}
                    className="text-grid-400 hover:text-white ml-1"
                    title="Copy Address"
                  >
                    {copiedAddress === acc.address ? <Check className="w-3 h-3 text-brand-emerald" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-grid-400">
                <a
                  href={`https://lora.algokit.io/testnet/account/${acc.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-emerald hover:underline flex items-center space-x-1"
                >
                  <Search className="w-3 h-3" />
                  <span>Inspect on Lora</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>

                <a
                  href={acc.testnetExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-grid-400 hover:text-white flex items-center space-x-1"
                >
                  <span>Pera Explorer</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-black/75 border border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-black border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-white flex items-center space-x-2">
            <Coins className="w-3.5 h-3.5 text-brand-emerald" />
            <span>On-Chain Settlement History ({transactions.length} Transactions)</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono">
            <span className="text-brand-emerald font-semibold">Facilitator: GoPlausible</span>
            <span className="text-grid-600">•</span>
            <span className="text-grid-400">Network: TestNet</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black/80 text-grid-400 text-[10px] uppercase border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Round</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Protocol Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Lora Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {transactions.map((tx) => {
                const loraUrl = tx.loraUrl || `https://lora.algokit.io/testnet/transaction/${tx.txId}`;
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-all">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white truncate max-w-[160px] block">
                        {tx.txId}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-grid-400">#{tx.round}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-brand-emerald font-semibold">{tx.amountAlgo.toFixed(6)} ALGO</span>
                      <span className="text-[10px] text-grid-400 block">({Math.round(tx.amountAlgo * 1_000_000)} µALGO)</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-grid-300">{tx.protocolFeeAlgo.toFixed(6)} ALGO</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30">
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
                        href={loraUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-brand-emerald/15 hover:bg-brand-emerald/25 border border-brand-emerald/30 text-brand-emerald text-[11px] inline-flex items-center space-x-1 shadow-sm transition-all"
                      >
                        <Search className="w-3 h-3" />
                        <span>Lora</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-grid-500 font-mono">
                    No transactions settled on Algorand yet. Execute a task in the Console to trigger automatic on-chain settlement!
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

export default AlgorandLedger;
