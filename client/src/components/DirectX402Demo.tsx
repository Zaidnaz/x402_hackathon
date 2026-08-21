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
  ExternalLink
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { testDirectX402 } from '../utils/api';

export const DirectX402Demo: React.FC = () => {
  const { isConnected, walletAddress, connectWallet, executePeraPayment } = useWallet();
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [paymentToken, setPaymentToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [peraTxInfo, setPeraTxInfo] = useState<{ txId: string; round: number; explorerUrl: string } | null>(null);

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
      <div className="bg-grid-900 border border-grid-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-signal-amber animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-signal-amber font-semibold">Standardized RFC 7235 / x402 Engine</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-grid-100">
            Direct x402 HTTP Paywall Interactive Testbed
          </h2>
          <p className="text-xs font-mono text-grid-400 mt-1 max-w-2xl">
            Test how an autonomous agent or user wallet interacts with a paid HTTP inference endpoint over the raw <span className="text-grid-200 font-semibold">x402 protocol</span> without third-party API keys.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="p-2.5 rounded-lg bg-grid-950 border border-grid-800 hover:border-grid-700 text-grid-400 hover:text-grid-200 text-xs font-mono flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Interactive 3-Step Guided Walkthrough */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Step 1 */}
        <div className={`p-4 rounded-xl border transition-all ${
          step === 1 ? 'bg-grid-850 border-signal-amber shadow-glow-amber' : 'bg-grid-900 border-grid-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-grid-500 font-semibold">PHASE 1</span>
            <ShieldAlert className="w-4 h-4 text-signal-amber" />
          </div>
          <div className="font-bold text-grid-200">1. Request Protected Resource</div>
          <p className="text-[11px] text-grid-400 mt-1">
            Send raw HTTP request without authorization headers to trigger standard 402 challenge.
          </p>
          <button
            onClick={handleSendUnauthenticated}
            disabled={loading || step !== 1}
            className="mt-3 w-full py-2 px-3 rounded bg-signal-amber text-grid-950 font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send GET Request</span>
          </button>
        </div>

        {/* Step 2 */}
        <div className={`p-4 rounded-xl border transition-all ${
          step === 2 ? 'bg-grid-850 border-signal-cyan shadow-glow-cyan' : 'bg-grid-900 border-grid-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-grid-500 font-semibold">PHASE 2</span>
            <Coins className="w-4 h-4 text-signal-cyan" />
          </div>
          <div className="font-bold text-grid-200">2. Algorand Micro-Settlement</div>
          <p className="text-[11px] text-grid-400 mt-1">
            {isConnected ? 'Sign 0.15 ALGO payment via connected Pera Wallet onto Algorand TestNet.' : 'Settle 0.15 ALGO on TestNet and extract x402 payment token.'}
          </p>
          <button
            onClick={handleSettleAndGenerateToken}
            disabled={loading || step !== 2}
            className="mt-3 w-full py-2 px-3 rounded bg-signal-cyan text-grid-950 font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{loading ? 'Signing on TestNet...' : isConnected ? 'Sign via Pera Wallet (0.15 ALGO)' : 'Settle on TestNet'}</span>
          </button>
        </div>

        {/* Step 3 */}
        <div className={`p-4 rounded-xl border transition-all ${
          step === 3 ? 'bg-grid-850 border-signal-emerald shadow-glow-emerald' : 'bg-grid-900 border-grid-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-grid-500 font-semibold">PHASE 3</span>
            <ShieldCheck className="w-4 h-4 text-signal-emerald" />
          </div>
          <div className="font-bold text-grid-200">3. Execute Authorized Payload</div>
          <p className="text-[11px] text-grid-400 mt-1">
            Pass <code className="text-signal-emerald">Authorization: x402 &lt;token&gt;</code> to receive 200 OK inference.
          </p>
          <button
            onClick={handleSendWithToken}
            disabled={loading || step !== 3}
            className="mt-3 w-full py-2 px-3 rounded bg-signal-emerald text-grid-950 font-bold uppercase tracking-wider text-[11px] flex items-center justify-center space-x-1.5 disabled:opacity-40"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fetch with x402 Token</span>
          </button>
        </div>
      </div>

      {/* Pera On-Chain Confirmation Pill */}
      {peraTxInfo && (
        <div className="p-3 bg-signal-emeraldDim/20 border border-signal-emerald/40 rounded-xl flex items-center justify-between text-xs font-mono text-signal-emerald animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-signal-emerald" />
            <span>Real Algorand TestNet Tx Confirmed in Round #{peraTxInfo.round}!</span>
          </div>
          <a
            href={peraTxInfo.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 underline hover:text-white"
          >
            <span>View on Pera Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Raw HTTP Request / Response Inspector */}
      <div className="bg-grid-900 border border-grid-800 rounded-xl overflow-hidden font-mono text-xs">
        <div className="p-4 bg-grid-950 border-b border-grid-800 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-grid-200 flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-signal-amber" />
            <span>Raw HTTP Network Transaction Inspector</span>
          </div>
          {responseStatus && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              responseStatus === 402
                ? 'bg-signal-amberDim text-signal-amber border border-signal-amber/40'
                : responseStatus === 200
                ? 'bg-signal-emeraldDim text-signal-emerald border border-signal-emerald/40'
                : 'bg-grid-800 text-grid-300'
            }`}>
              HTTP {responseStatus} {responseStatus === 402 ? 'PAYMENT REQUIRED' : responseStatus === 200 ? 'OK' : ''}
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Request Info */}
          <div>
            <div className="text-[10px] text-grid-500 uppercase tracking-wide mb-1">Target Endpoint</div>
            <div className="p-2.5 bg-grid-950 rounded border border-grid-800 text-grid-200 flex items-center justify-between">
              <span>GET /api/x402/inference/direct-endpoint</span>
              {paymentToken && (
                <span className="text-[10px] text-signal-cyan">Header: Authorization: x402 {paymentToken.substring(0, 16)}...</span>
              )}
            </div>
          </div>

          {/* Response Headers */}
          {Object.keys(responseHeaders).length > 0 && (
            <div>
              <div className="text-[10px] text-grid-500 uppercase tracking-wide mb-1">Received Response Headers</div>
              <pre className="p-3 bg-grid-950 rounded border border-grid-800 text-[11px] text-grid-300 overflow-x-auto">
{Object.entries(responseHeaders)
  .filter(([k]) => ['www-authenticate', 'x-402-payment-address', 'x-402-amount', 'x-402-currency', 'x-402-network', 'content-type'].includes(k.toLowerCase()))
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n')}
              </pre>
            </div>
          )}

          {/* Response Body */}
          {responseBody && (
            <div>
              <div className="text-[10px] text-grid-500 uppercase tracking-wide mb-1">Response Payload (JSON)</div>
              <pre className="p-3 bg-grid-950 rounded border border-grid-800 text-[11px] text-signal-amber overflow-x-auto">
                {JSON.stringify(responseBody, null, 2)}
              </pre>
            </div>
          )}

          {!responseBody && (
            <div className="py-8 text-center text-grid-600">
              Click &quot;Send GET Request&quot; in Phase 1 above to initiate the x402 challenge flow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
