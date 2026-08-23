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
  Zap,
  Globe
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { fetchWithX402, signWithAgentWallet, PaymentTerms, PaymentResponse } from '../utils/x402Client';
import { signX402Payment } from '../utils/peraWallet';
import { TourGuideButton } from './TourGuideButton';
import { BazaarRegistrationModal } from './BazaarRegistrationModal';

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
  const [showBazaarModal, setShowBazaarModal] = useState(false);

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
      <div className="card-light p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-semibold">x402 Merchant Protocol Demo</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-zinc-950">
            Client ↔ Merchant Payment Flow
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-1 max-w-2xl">
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
            className="p-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 text-xs font-mono flex items-center space-x-1.5 transition-colors border border-zinc-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
          <button
            onClick={() => setShowBazaarModal(true)}
            className="px-3 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-200 text-amber-700 text-xs font-mono flex items-center space-x-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Register on Bazaar</span>
          </button>
        </div>
      </div>

      <BazaarRegistrationModal
        isOpen={showBazaarModal}
        onClose={() => setShowBazaarModal(false)}
        defaultPayload={{
          endpointUrl: 'https://your-domain.com/api/merchant/compute/run',
          paymentAddress: 'MERCHANT_ALGO_ADDRESS_HERE',
          price: 500000,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Step 1 */}
        <div data-tour="merchant-phase-1" className={`p-4 rounded-xl border transition-all ${
          step === 1 ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-zinc-50 border-zinc-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-500 font-semibold">PHASE 1</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-bold text-zinc-950">1. Client Requests Compute</div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Send POST to merchant without payment headers to trigger HTTP 402.
          </p>
          <div className="mt-3 space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-sm text-zinc-950 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none font-mono text-xs"
              placeholder="Enter workload prompt..."
            />
            <button
              onClick={handleFetchTerms}
              disabled={loading || step !== 1}
              className="w-full py-2.5 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-white font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Compute (Triggers 402)</span>
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div data-tour="merchant-phase-2" className={`p-4 rounded-xl border transition-all ${
          step === 2 ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-zinc-50 border-zinc-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-500 font-semibold">PHASE 2</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-bold text-zinc-950">2. Review & Sign Terms</div>
          
          {terms && (
            <div className="mt-3 space-y-2 bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-[11px] font-mono">
              <div className="flex justify-between"><span className="text-zinc-500">Price</span><span className="text-emerald-600">{terms.price / 1_000_000} ALGO ({terms.price} µALGO)</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Payee</span><span className="text-zinc-700 truncate max-w-[150px]">{terms.payee}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Network</span><span className="text-emerald-600">{terms.network}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Scheme</span><span className="text-zinc-700">{terms.scheme}</span></div>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {isConnected ? (
              <button
                onClick={handleSignAndExecute}
                disabled={loading || step !== 2}
                className="w-full py-2.5 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-white font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{loading ? 'Signing with Pera...' : 'Sign with Pera Wallet & Execute'}</span>
              </button>
            ) : (
              <button
                onClick={handleSignAndExecute}
                disabled={loading || step !== 2}
                className="w-full py-2.5 px-3 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-200 text-amber-700 font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{loading ? 'Signing with Agent...' : 'Sign with Agent Wallet & Execute'}</span>
              </button>
            )}
            
            <button
              onClick={handleRetryWithAgent}
              disabled={loading || step !== 2}
              className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 hover:text-zinc-900 text-xs font-mono flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Use Agent Wallet (Autonomous)</span>
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div data-tour="merchant-phase-3" className={`p-4 rounded-xl border transition-all ${
          step === 3 ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-zinc-50 border-zinc-200 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-500 font-semibold">PHASE 3</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-bold text-zinc-950">3. Execution Result</div>
          
          {paymentResponse && (
            <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-mono text-emerald-700">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payment Confirmed on Algorand</span>
              </div>
              <div className="mt-1 text-[10px] text-zinc-500">
                TxID: {paymentResponse.txId?.slice(0, 16)}... | Round: #{paymentResponse.round}
              </div>
            </div>
          )}

          {responseStatus && (
            <div className={`mt-2 p-3 rounded-lg ${responseStatus === 200 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-between text-xs font-mono">
                <span>HTTP Status</span>
                <span className={responseStatus === 200 ? 'text-emerald-600' : 'text-red-600'}>
                  {responseStatus} {responseStatus === 200 ? 'OK' : 'Error'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-sans">
          {error}
        </div>
      )}

      <div data-tour="merchant-inspector" className="card-light overflow-hidden font-mono text-xs shadow-sm">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-700 flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            <span>Raw HTTP Exchange Inspector</span>
          </div>
          {responseStatus && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              responseStatus === 402
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : responseStatus === 200
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              HTTP {responseStatus}
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          {Object.keys(responseHeaders).length > 0 && (
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Response Headers</div>
              <pre className="p-3 bg-zinc-50 rounded border border-zinc-200 text-[11px] text-zinc-700 overflow-x-auto">
{Object.entries(responseHeaders)
  .filter(([k]) => ['payment-required', 'payment-signature', 'payment-response', 'content-type'].includes(k.toLowerCase()))
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n') || 'No x402 headers in response'}
              </pre>
            </div>
          )}

          {responseBody && (
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Response Body</div>
              <pre className="p-3 bg-zinc-50 rounded border border-zinc-200 text-[11px] text-emerald-600 overflow-x-auto">
                {JSON.stringify(responseBody, null, 2)}
              </pre>
            </div>
          )}

          {!responseBody && step === 1 && (
            <div className="py-8 text-center text-zinc-500">
              Click "Request Compute" to start the x402 flow with the merchant.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantX402Demo;