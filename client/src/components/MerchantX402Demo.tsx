import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Coins, 
  ShieldCheck,
  RefreshCw,
  Wallet,
  ExternalLink,
  Search,
  Zap
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { fetchWithX402, signWithAgentWallet, PaymentTerms, PaymentResponse } from '../utils/x402Client';
import { signX402Payment } from '../utils/peraWallet';
import { TourGuideButton } from './TourGuideButton';

export const MerchantX402Demo: React.FC = () => {
  const { isConnected, walletAddress, connectWallet } = useWallet();
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [terms, setTerms] = useState<PaymentTerms | null>(null);
  const [signature, setSignature] = useState<string>('');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Generate a TypeScript function for Algorand atomic transfer');

  const handleFetchTerms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/merchant/compute/terms');
      const data = await res.json();
      setTerms(data.terms);
      setStep(2);
    } catch (err) {
      setError('Failed to fetch payment terms from merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleSignAndExecute = async () => {
    if (!terms) return;
    setLoading(true);
    setError(null);
    try {
      let sig: string;
      
      if (isConnected && walletAddress) {
        sig = await signX402Payment(walletAddress, terms);
      } else {
        sig = await signWithAgentWallet(terms);
      }
      
      setSignature(sig);

      const res = await fetch('/api/merchant/compute/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PAYMENT-SIGNATURE': sig
        },
        body: JSON.stringify({ prompt, model: 'qwen-2.5-7b', maxTokens: 512 })
      });

      const paymentResponseHeader = res.headers.get('PAYMENT-RESPONSE');
      if (paymentResponseHeader) {
        const parsedResponse = JSON.parse(atob(paymentResponseHeader));
        setPaymentResponse(parsedResponse);
      }

      const body = await res.json();
      setResponseStatus(res.status);
      setResponseBody(body);
      
      const rawHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        rawHeaders[key] = val;
      });
      setResponseHeaders(rawHeaders);
      
      setStep(3);
    } catch (err) {
      setError('Transaction failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRetryWithAgent = async () => {
    if (!terms) return;
    setLoading(true);
    setError(null);
    try {
      const sig = await signWithAgentWallet(terms);
      setSignature(sig);

      const res = await fetch('/api/merchant/compute/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PAYMENT-SIGNATURE': sig
        },
        body: JSON.stringify({ prompt, model: 'qwen-2.5-7b', maxTokens: 512 })
      });

      const paymentResponseHeader = res.headers.get('PAYMENT-RESPONSE');
      if (paymentResponseHeader) {
        setPaymentResponse(JSON.parse(atob(paymentResponseHeader)));
      }

      const body = await res.json();
      setResponseStatus(res.status);
      setResponseBody(body);
      
      const rawHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        rawHeaders[key] = val;
      });
      setResponseHeaders(rawHeaders);
    } catch (err) {
      setError('Agent transaction failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseBody(null);
    setSignature('');
    setTerms(null);
    setPaymentResponse(null);
    setError(null);
    setStep(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/75 border border-white/[0.08] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-emerald" />
            <span className="text-xs font-mono uppercase tracking-widest text-brand-emerald font-semibold">x402 Merchant Protocol Demo</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-white">
            Client ↔ Merchant Payment Flow
          </h2>
          <p className="text-xs font-mono text-grid-300 mt-1 max-w-2xl">
            Experience the raw x402 HTTP 402 flow: Client requests → Merchant returns 402 with terms → Client signs → Merchant verifies on Algorand → Returns result.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <TourGuideButton
            tourId="merchant-x402-tour"
            buttonLabel="How It Works"
            steps={[
              {
                targetSelector: '[data-tour="merchant-phase-1"]',
                title: "1. Request Compute (No Payment)",
                description: "Click 'Request Compute' to hit the merchant endpoint without payment. The merchant responds with HTTP 402 and payment terms."
              },
              {
                targetSelector: '[data-tour="merchant-phase-2"]',
                title: "2. Sign Payment Terms",
                description: "Review the terms (price, payee, network). Sign with your connected Pera Wallet, or use the autonomous Agent wallet."
              },
              {
                targetSelector: '[data-tour="merchant-phase-3"]',
                title: "3. Merchant Verifies & Executes",
                description: "The signed transaction is sent back. Merchant verifies on Algorand TestNet, then executes the compute workload."
              },
              {
                targetSelector: '[data-tour="merchant-inspector"]',
                title: "4. Raw HTTP Inspector",
                description: "Inspect the exact headers exchanged: PAYMENT-REQUIRED, PAYMENT-SIGNATURE, PAYMENT-RESPONSE."
              }
            ]}
          />

          <button
            onClick={handleReset}
            className="p-2.5 rounded-lg bg-black/60 border border-white/[0.08] hover:border-white/[0.2] text-grid-300 hover:text-white text-xs font-mono flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div data-tour="merchant-phase-1" className={`p-4 rounded-xl border transition-all ${
          step === 1 ? 'bg-black/80 border-brand-emerald shadow-glow-emerald' : 'bg-black/40 border-white/[0.08] opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-grid-500 font-semibold">PHASE 1</span>
            <Zap className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="font-bold text-white">1. Client Requests Compute</div>
          <p className="text-[11px] text-grid-400 mt-1">
            Send POST to merchant without payment headers to trigger HTTP 402.
          </p>
          <div className="mt-3 space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full bg-grid-950 border border-grid-800 rounded-lg p-2 text-sm text-grid-100 focus:outline-none focus:border-brand-emerald resize-none font-mono text-xs"
              placeholder="Enter workload prompt..."
            />
            <button
              onClick={handleFetchTerms}
              disabled={loading || step !== 1}
              className="w-full py-2.5 px-3 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-black font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40 shadow-glow-emerald"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Compute (Triggers 402)</span>
            </button>
          </div>
        </div>

        <div data-tour="merchant-phase-2" className={`p-4 rounded-xl border transition-all ${
          step === 2 ? 'bg-black/80 border-brand-emerald shadow-glow-emerald' : 'bg-black/40 border-white/[0.08] opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-grid-500 font-semibold">PHASE 2</span>
            <Coins className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="font-bold text-white">2. Review & Sign Terms</div>
          
          {terms && (
            <div className="mt-3 space-y-2 bg-grid-950 border border-grid-800 rounded-lg p-3 text-[11px] font-mono">
              <div className="flex justify-between"><span className="text-grid-400">Price</span><span className="text-brand-emerald">{terms.price / 1_000_000} ALGO ({terms.price} µALGO)</span></div>
              <div className="flex justify-between"><span className="text-grid-400">Payee</span><span className="text-grid-300 truncate max-w-[150px]">{terms.payee}</span></div>
              <div className="flex justify-between"><span className="text-grid-400">Network</span><span className="text-signal-cyan">{terms.network}</span></div>
              <div className="flex justify-between"><span className="text-grid-400">Scheme</span><span className="text-grid-300">{terms.scheme}</span></div>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {isConnected ? (
              <button
                onClick={handleSignAndExecute}
                disabled={loading || step !== 2}
                className="w-full py-2.5 px-3 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-black font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40 shadow-glow-emerald"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{loading ? 'Signing with Pera...' : 'Sign with Pera Wallet & Execute'}</span>
              </button>
            ) : (
              <button
                onClick={handleSignAndExecute}
                disabled={loading || step !== 2}
                className="w-full py-2.5 px-3 rounded-lg bg-signal-amber/20 hover:bg-signal-amber/30 border border-signal-amber/30 text-signal-amber font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{loading ? 'Signing with Agent...' : 'Sign with Agent Wallet & Execute'}</span>
              </button>
            )}
            
            <button
              onClick={handleRetryWithAgent}
              disabled={loading || step !== 2}
              className="w-full py-2 px-3 rounded-lg bg-black/60 border border-white/[0.08] hover:border-white/[0.2] text-grid-300 hover:text-white text-xs font-mono flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Use Agent Wallet (Autonomous)</span>
            </button>
          </div>
        </div>

        <div data-tour="merchant-phase-3" className={`p-4 rounded-xl border transition-all ${
          step === 3 ? 'bg-black/80 border-brand-emerald shadow-glow-emerald' : 'bg-black/40 border-white/[0.08] opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-grid-500 font-semibold">PHASE 3</span>
            <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="font-bold text-white">3. Execution Result</div>
          
          {paymentResponse && (
            <div className="mt-2 p-3 bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg text-xs font-mono text-brand-emerald">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payment Confirmed on Algorand</span>
              </div>
              <div className="mt-1 text-[10px] text-grid-300">
                TxID: {paymentResponse.txId?.slice(0, 16)}... | Round: #{paymentResponse.round}
              </div>
            </div>
          )}

          {responseStatus && (
            <div className={`mt-3 p-3 rounded-lg ${responseStatus === 200 ? 'bg-brand-emerald/10 border border-brand-emerald/30' : 'bg-signal-rose/10 border border-signal-rose/30'}`}>
              <div className="flex items-center justify-between text-xs font-mono">
                <span>HTTP Status</span>
                <span className={responseStatus === 200 ? 'text-brand-emerald' : 'text-signal-rose'}>
                  {responseStatus} {responseStatus === 200 ? 'OK' : 'Error'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-signal-roseDim border border-signal-rose/30 rounded-xl text-signal-rose text-sm font-sans">
          {error}
        </div>
      )}

      <div data-tour="merchant-inspector" className="bg-black/75 border border-white/[0.08] rounded-xl overflow-hidden font-mono text-xs shadow-sm">
        <div className="p-4 bg-black border-b border-white/[0.08] flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-white flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Raw HTTP Exchange Inspector</span>
          </div>
          {responseStatus && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              responseStatus === 402
                ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/40'
                : responseStatus === 200
                ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/40'
                : 'bg-signal-rose/15 text-signal-rose border border-signal-rose/40'
            }`}>
              HTTP {responseStatus}
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          {Object.keys(responseHeaders).length > 0 && (
            <div>
              <div className="text-[10px] text-grid-400 uppercase tracking-wide mb-1">Response Headers</div>
              <pre className="p-3 bg-black rounded border border-white/[0.08] text-[11px] text-grid-200 overflow-x-auto">
{Object.entries(responseHeaders)
  .filter(([k]) => ['payment-required', 'payment-signature', 'payment-response', 'content-type'].includes(k.toLowerCase()))
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n') || 'No x402 headers in response'}
              </pre>
            </div>
          )}

          {responseBody && (
            <div>
              <div className="text-[10px] text-grid-400 uppercase tracking-wide mb-1">Response Body</div>
              <pre className="p-3 bg-black rounded border border-white/[0.08] text-[11px] text-brand-emerald overflow-x-auto">
                {JSON.stringify(responseBody, null, 2)}
              </pre>
            </div>
          )}

          {!responseBody && step === 1 && (
            <div className="py-8 text-center text-grid-500">
              Click "Request Compute" to start the x402 flow with the merchant.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantX402Demo;