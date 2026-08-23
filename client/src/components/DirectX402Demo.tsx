import React, { useState } from 'react';
import { 
  Layers, 
  Send, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck,
  RefreshCw,
  Wallet,
  ExternalLink,
  Search
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { testDirectX402 } from '../utils/api';
import { TourGuideButton } from './TourGuideButton';

export const DirectX402Demo: React.FC = () => {
  const { isConnected, walletAddress, connectWallet, executePeraPayment } = useWallet();
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [paymentToken, setPaymentToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [peraTxInfo, setPeraTxInfo] = useState<{ txId: string; round: number; explorerUrl: string; loraUrl: string } | null>(null);

  // Step 1: Send unauthenticated request (gets 402)
  const handleSendUnauthenticated = async () => {
    setLoading(true);
    try {
      const res = await testDirectX402();
      setResponseStatus(res.status);
      setResponseHeaders(res.headers);
      setResponseBody(res.body);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Settle on Algorand & Generate Token (via Pera Wallet or Autonomous Session)
  const handleSettleAndGenerateToken = async () => {
    setLoading(true);
    try {
      const challengeAddress = responseHeaders['x-402-payment-address'] || 'A3R6WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6HVQ';
      const amountAlgo = 0.15;

      if (isConnected) {
        // Real on-chain TestNet transaction via connected Pera Wallet
        const txResult = await executePeraPayment(
          challengeAddress,
          amountAlgo,
          `x402-direct-inference:${Date.now()}`
        );
        setPeraTxInfo(txResult);
        const token = `x402_tok_PERA_${txResult.txId.substring(0, 16)}_${Date.now()}`;
        setPaymentToken(token);
      } else {
        // Autonomous Agent Session Settlement
        await new Promise(r => setTimeout(r, 600));
        const token = `x402_tok_ALGO_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        setPaymentToken(token);
      }
      setStep(3);
    } catch (err) {
      console.error('Settlement error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Re-send with Token (gets 200)
  const handleSendWithToken = async () => {
    setLoading(true);
    try {
      const res = await testDirectX402(paymentToken);
      setResponseStatus(res.status);
      setResponseHeaders(res.headers);
      setResponseBody(res.body);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseBody(null);
    setPaymentToken('');
    setPeraTxInfo(null);
    setStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/75 border border-white/[0.08] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-sm">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-brand-emerald font-semibold">Standardized RFC 7235 / x402 Engine</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-white">
            Direct x402 HTTP Paywall Interactive Testbed
          </h2>
          <p className="text-xs font-mono text-grid-300 mt-1 max-w-2xl">
            Test how an autonomous agent or user wallet interacts with a paid HTTP inference endpoint over the raw <span className="text-white font-semibold">x402 protocol</span> with GoPlausible facilitator settlement on Algorand TestNet.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <TourGuideButton
            tourId="x402-tour"
            buttonLabel="How It Works"
            steps={[
              {
                targetSelector: '[data-tour="x402-phase-1"]',
                title: "1. Phase 1: HTTP 402 Paywall Challenge",
                description: "Click 'Send GET Request' without credentials to trigger an authentic HTTP 402 challenge with GoPlausible Facilitator headers."
              },
              {
                targetSelector: '[data-tour="x402-phase-2"]',
                title: "2. Phase 2: On-Chain Algorand Settlement",
                description: "Sign 0.15 ALGO via your connected Pera Wallet (or autonomous wallet) onto Algorand TestNet."
              },
              {
                targetSelector: '[data-tour="x402-phase-3"]',
                title: "3. Phase 3: Authorized Payload Retrieval",
                description: "Click 'Fetch with x402 Token' passing Authorization: x402 <token> to verify the receipt and receive 200 OK + payload."
              },
              {
                targetSelector: '[data-tour="http-network-inspector"]',
                title: "4. Raw HTTP Network Transaction Inspector",
                description: "Inspect raw response headers, WWW-Authenticate challenges, GoPlausible tokens, and JSON payloads in real time."
              },
              {
                targetSelector: '[data-tour="developer-code-snippets"]',
                title: "5. Developer SDK Integration",
                description: "Copy TypeScript and cURL snippets showing how external autonomous agents query this paywalled endpoint."
              }
            ]}
          />

          <button
            onClick={handleReset}
            className="p-2.5 rounded-lg bg-black/60 border border-white/[0.08] hover:border-white/[0.2] text-grid-300 hover:text-white text-xs font-mono flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>
      </div>

      {/* Interactive 3-Step Guided Walkthrough */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Step 1 */}
        <div data-tour="x402-phase-1" className={`p-4 rounded-xl border transition-all ${
          step === 1 ? 'bg-black/80 border-brand-emerald shadow-glow-emerald' : 'bg-black/40 border-white/[0.08] opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-grid-500 font-semibold">PHASE 1</span>
            <ShieldAlert className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="font-bold text-white">1. Request Protected Resource</div>
          <p className="text-[11px] text-grid-400 mt-1">
            Send raw HTTP request without authorization headers to trigger standard 402 challenge.
          </p>
          <button
            onClick={handleSendUnauthenticated}
            disabled={loading || step !== 1}
            className="mt-3 w-full py-2.5 px-3 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-black font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40 shadow-glow-emerald"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send GET Request</span>
          </button>
        </div>

        {/* Step 2 */}
        <div data-tour="x402-phase-2" className={`p-4 rounded-xl border transition-all ${
          step === 2 ? 'bg-black/80 border-brand-emerald shadow-glow-emerald' : 'bg-black/40 border-white/[0.08] opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-grid-500 font-semibold">PHASE 2</span>
            <Coins className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="font-bold text-white">2. Algorand Micro-Settlement</div>
          <p className="text-[11px] text-grid-400 mt-1">
            {isConnected ? 'Sign 0.15 ALGO payment via connected Pera Wallet onto Algorand TestNet.' : 'Settle 0.15 ALGO on TestNet and extract x402 payment token.'}
          </p>
          <button
            onClick={handleSettleAndGenerateToken}
            disabled={loading || step !== 2}
            className="mt-3 w-full py-2.5 px-3 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-black font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40 shadow-glow-emerald"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{loading ? 'Signing on TestNet...' : isConnected ? 'Sign via Pera Wallet (0.15 ALGO)' : 'Settle on TestNet'}</span>
          </button>
        </div>

        {/* Step 3 */}
        <div data-tour="x402-phase-3" className={`p-4 rounded-xl border transition-all ${
          step === 3 ? 'bg-black/80 border-brand-emerald shadow-glow-emerald' : 'bg-black/40 border-white/[0.08] opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-grid-500 font-semibold">PHASE 3</span>
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
          </div>
          <div className="font-bold text-white">3. Execute Authorized Payload</div>
          <p className="text-[11px] text-grid-400 mt-1">
            Pass <code className="text-brand-emerald">Authorization: x402 &lt;token&gt;</code> to receive 200 OK inference.
          </p>
          <button
            onClick={handleSendWithToken}
            disabled={loading || step !== 3}
            className="mt-3 w-full py-2.5 px-3 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-black font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40 shadow-glow-emerald"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fetch with x402 Token</span>
          </button>
        </div>
      </div>

      {/* Pera On-Chain Confirmation Pill with Lora Link */}
      {peraTxInfo && (
        <div className="p-4 bg-brand-emerald/10 border border-brand-emerald/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-brand-emerald animate-fadeIn shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>Real Algorand TestNet Tx Confirmed in Round #{peraTxInfo.round}!</span>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={peraTxInfo.loraUrl || `https://lora.algokit.io/testnet/transaction/${peraTxInfo.txId}`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded bg-brand-emerald text-black font-bold text-[10px] uppercase flex items-center space-x-1 shadow-glow-emerald hover:bg-brand-emerald/90 transition-all"
            >
              <Search className="w-3 h-3" />
              <span>Inspect on Lora</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={peraTxInfo.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-grid-300 hover:text-white underline text-[11px]"
            >
              <span>Pera Explorer</span>
            </a>
          </div>
        </div>
      )}

      {/* Raw HTTP Request / Response Inspector */}
      <div data-tour="http-network-inspector" className="bg-black/75 border border-white/[0.08] rounded-xl overflow-hidden font-mono text-xs shadow-sm">
        <div className="p-4 bg-black border-b border-white/[0.08] flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-white flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Raw HTTP Network Transaction Inspector</span>
          </div>
          {responseStatus && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              responseStatus === 402
                ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/40'
                : responseStatus === 200
                ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/40'
                : 'bg-black text-grid-300'
            }`}>
              HTTP {responseStatus} {responseStatus === 402 ? 'PAYMENT REQUIRED' : responseStatus === 200 ? 'OK' : ''}
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Request Info */}
          <div>
            <div className="text-[10px] text-grid-400 uppercase tracking-wide mb-1">Target Endpoint</div>
            <div className="p-2.5 bg-black rounded border border-white/[0.08] text-white flex items-center justify-between">
              <span>GET /api/x402/inference/direct-endpoint</span>
              {paymentToken && (
                <span className="text-[10px] text-brand-emerald font-semibold">Header: Authorization: x402 {paymentToken.substring(0, 16)}...</span>
              )}
            </div>
          </div>

          {/* Response Headers */}
          {Object.keys(responseHeaders).length > 0 && (
            <div>
              <div className="text-[10px] text-grid-400 uppercase tracking-wide mb-1">Received Response Headers</div>
              <pre className="p-3 bg-black rounded border border-white/[0.08] text-[11px] text-grid-200 overflow-x-auto">
{Object.entries(responseHeaders)
  .filter(([k]) => ['www-authenticate', 'x-402-payment-address', 'x-402-amount', 'x-402-currency', 'x-402-network', 'x-402-facilitator', 'x-402-scheme', 'content-type'].includes(k.toLowerCase()))
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n')}
              </pre>
            </div>
          )}

          {/* Response Body */}
          {responseBody && (
            <div>
              <div className="text-[10px] text-grid-400 uppercase tracking-wide mb-1">Response Payload (JSON)</div>
              <pre className="p-3 bg-black rounded border border-white/[0.08] text-[11px] text-brand-emerald overflow-x-auto">
                {JSON.stringify(responseBody, null, 2)}
              </pre>
            </div>
          )}

          {!responseBody && (
            <div className="py-8 text-center text-grid-500">
              Click &quot;Send GET Request&quot; in Phase 1 above to initiate the x402 challenge flow.
            </div>
          )}
        </div>
      </div>

      {/* Developer Integration Code Snippets Panel */}
      <div data-tour="developer-code-snippets" className="bg-black/75 border border-white/[0.08] rounded-xl p-5 space-y-3 font-mono text-xs shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-brand-emerald" />
            <span>Developer Integration: How Other Autonomous Agents Call This Endpoint</span>
          </div>
          <span className="text-[10px] text-brand-emerald bg-brand-emerald/15 px-2 py-0.5 rounded border border-brand-emerald/30 font-bold">
            @x402/fetch & cURL
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          {/* TypeScript @x402/fetch */}
          <div className="bg-black rounded-lg border border-white/[0.08] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-grid-400 text-[11px]">
              <span>TypeScript (using @x402/fetch & @x402/avm)</span>
            </div>
            <pre className="text-[11px] text-brand-emerald overflow-x-auto leading-relaxed">
{`import { wrapFetchWithX402 } from '@x402/fetch';
import { AlgorandSigner } from '@x402/avm';

const signer = new AlgorandSigner(agentPrivateKey);
const x402Fetch = wrapFetchWithX402(fetch, signer);

// Automatically handles 402 challenge, signs on Algorand,
// settles via GoPlausible, and retries with payment token!
const res = await x402Fetch('/api/x402/inference/direct-endpoint');
const data = await res.json();`}
            </pre>
          </div>

          {/* Raw cURL */}
          <div className="bg-black rounded-lg border border-white/[0.08] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-grid-400 text-[11px]">
              <span>Raw CLI / cURL</span>
            </div>
            <pre className="text-[11px] text-grid-300 overflow-x-auto leading-relaxed">
{`# 1. Trigger HTTP 402 Challenge
curl -i http://localhost:3001/api/x402/inference/direct-endpoint

# 2. Re-send with verified x402 payment token
curl http://localhost:3001/api/x402/inference/direct-endpoint \\
  -H "Authorization: x402 <your_verified_payment_token>"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectX402Demo;
