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
import { fetchAccounts, fetchTransactions, FALLBACK_ACCOUNTS, FALLBACK_TRANSACTIONS } from '../utils/api';
import { TourGuideButton } from './TourGuideButton';

export const AlgorandLedger: React.FC = () => {
  const [accounts, setAccounts] = useState<AlgorandAccountInfo[]>(FALLBACK_ACCOUNTS);
  const [transactions, setTransactions] = useState<AlgorandTransactionRecord[]>(FALLBACK_TRANSACTIONS);
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
      <div className="card-light p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-semibold">Algorand TestNet Settlement Layer</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-zinc-950">
            Real-Time Settlement Ledger
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-1 max-w-2xl">
            Autonomous agent wallets pay compute providers on a per-task basis. AgentGrid smart escrow enforces atomic settlements with a <span className="text-zinc-900 font-semibold">1.5% protocol fee</span> routed to treasury.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <TourGuideButton
            tourId="ledger-tour"
            buttonLabel="How It Works"
            steps={[
              {
                targetSelector: '[data-tour="participant-wallets"]',
                title: "1. Network Participant Accounts",
                description: "Live balances of Agent Wallets, independent GPU Node accounts, and the 1.5% Protocol Treasury receiver."
              },
              {
                targetSelector: '[data-tour="settlement-history-table"]',
                title: "2. Settlement History & Block Proof",
                description: "Every AI inference execution records an immutable receipt with confirmed round height, micro-ALGO fee, and timestamp."
              },
              {
                targetSelector: '[data-tour="lora-link-btn"]',
                title: "3. 1-Click Lora Explorer Verification",
                description: "Click 'Lora' to view the transaction directly on the official AlgoKit Lora TestNet explorer."
              }
            ]}
          />

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 hover:text-zinc-950 text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div data-tour="participant-wallets" className="space-y-3">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600 flex items-center space-x-2">
          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Network Participant Accounts (Algorand TestNet)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc, idx) => (
            <div
              key={idx}
              className="card-light p-4 space-y-3 hover:border-zinc-300 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-tight ${
                  acc.role === 'agent'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : acc.role === 'treasury'
                    ? 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                    : 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                }`}>
                  {acc.role.toUpperCase()}
                </span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  {acc.balanceAlgo.toFixed(3)} ALGO
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-900 truncate">{acc.label}</div>
                <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-200">
                  <span className="truncate max-w-[200px]">{acc.address}</span>
                  <button
                    onClick={() => copyAddress(acc.address)}
                    className="text-zinc-400 hover:text-zinc-700 ml-1 cursor-pointer"
                    title="Copy Address"
                  >
                    {copiedAddress === acc.address ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <a
                  href={`https://lora.algokit.io/testnet/account/${acc.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline flex items-center space-x-1 font-semibold"
                >
                  <Search className="w-3 h-3" />
                  <span>Inspect on Lora</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>

                <a
                  href={acc.testnetExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 hover:text-zinc-800 flex items-center space-x-1"
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
      <div data-tour="settlement-history-table" className="card-light overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900 flex items-center space-x-2">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>On-Chain Settlement History ({transactions.length} Transactions)</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono">
            <span className="text-emerald-700 font-semibold">Facilitator: GoPlausible</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-500">Network: TestNet</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-light">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Round</th>
                <th>Amount</th>
                <th>Protocol Fee</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th data-tour="lora-link-btn" className="text-right">Lora Explorer</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => {
                const loraUrl = tx.loraUrl || `https://lora.algokit.io/testnet/transaction/${tx.txId}`;
                return (
                  <tr key={tx.id}>
                    <td>
                      <span className="font-semibold text-zinc-900 truncate max-w-[160px] block">
                        {tx.txId}
                      </span>
                    </td>

                    <td>
                      <span className="text-zinc-500">#{tx.round}</span>
                    </td>

                    <td>
                      <span className="text-emerald-700 font-semibold">{tx.amountAlgo.toFixed(6)} ALGO</span>
                      <span className="text-[10px] text-zinc-400 block">({Math.round(tx.amountAlgo * 1_000_000)} µALGO)</span>
                    </td>

                    <td>
                      <span className="text-zinc-600">{tx.protocolFeeAlgo.toFixed(6)} ALGO</span>
                    </td>

                    <td>
                      <span className="badge-green">
                        CONFIRMED
                      </span>
                    </td>

                    <td>
                      <span className="text-zinc-500 text-[11px]">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </td>

                    <td className="text-right">
                      <div data-tour={idx === 0 ? "lora-link-btn" : undefined} className="inline-block">
                        <a
                          href={loraUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] inline-flex items-center space-x-1 font-semibold transition-colors"
                        >
                          <Search className="w-3 h-3" />
                          <span>Lora</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
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
