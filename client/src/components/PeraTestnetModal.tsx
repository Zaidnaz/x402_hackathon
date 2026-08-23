import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Settings, 
  QrCode, 
  ExternalLink, 
  Coins, 
  CheckCircle2, 
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface PeraTestnetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PeraTestnetModal: React.FC<PeraTestnetModalProps> = ({
  isOpen,
  onClose
}) => {
  const { connectWallet, isConnected, walletAddress, liveBalanceAlgo, isConnecting } = useWallet();
  const [connectError, setConnectError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectNow = async () => {
    setConnectError(null);
    try {
      const addr = await connectWallet();
      if (addr) {
        onClose();
      }
    } catch (err: any) {
      if (err.message !== 'Pera connection modal closed') {
        setConnectError(err.message || 'Failed to connect. Please ensure your Pera App is switched to TestNet.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-grid-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-grid-950 border border-grid-750 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative font-mono text-xs text-grid-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-grid-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-grid-100">Connect Pera Wallet (TestNet)</h2>
              <p className="text-[10px] text-grid-400 font-sans">Mobile QR & Web Connection Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-grid-850 text-grid-400 hover:text-grid-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Step Setup Guide */}
        <div className="space-y-3 bg-grid-900/60 p-4 rounded-xl border border-grid-800">
          <div className="text-[11px] font-bold uppercase text-brand-emerald tracking-wide">
            âš ï¸ Important: Switch Pera App to TestNet
          </div>

          <div className="space-y-2.5 text-[11px] font-sans text-grid-300">
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-grid-850 text-grid-100 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                1
              </span>
              <div>
                Open the <strong className="text-grid-100">Pera Wallet</strong> app on your mobile device.
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-grid-850 text-grid-100 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                2
              </span>
              <div>
                Go to <strong className="text-grid-100">Settings</strong> (bottom right icon) -&gt; <strong className="text-grid-100">Developer Settings</strong> (or <em>Node Settings</em>) -&gt; Select <strong className="text-brand-emerald">TestNet</strong>.
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-grid-850 text-grid-100 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                3
              </span>
              <div>
                Click the <strong className="text-grid-100">Connect Pera Wallet</strong> button below and scan the QR code using your Pera mobile camera.
              </div>
            </div>
          </div>
        </div>

        {/* TestNet Faucet Callout */}
        <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/20 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-grid-100 flex items-center space-x-1.5">
              <Coins className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Need Free TestNet ALGO?</span>
            </div>
            <div className="text-[10px] text-grid-400 font-sans">
              Request 10 test ALGO from the official Algorand dispenser
            </div>
          </div>
          <a
            href="https://bank.testnet.algorand.network/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-grid-900/60 hover:bg-grid-900 border border-brand-emerald/30 text-brand-emerald hover:text-grid-100 text-[11px] flex items-center space-x-1 transition-all"
          >
            <span>Get ALGO</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Error message if any */}
        {connectError && (
          <div className="p-3 bg-signal-roseDim border border-signal-rose/30 rounded-xl text-signal-rose text-[11px] font-sans flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{connectError}</div>
          </div>
        )}

        {/* Connect Action Button */}
        <button
          onClick={handleConnectNow}
          disabled={isConnecting}
          className="w-full py-3.5 px-4 rounded-xl bg-brand-emerald hover:bg-brand-mint text-white font-semibold flex items-center justify-center space-x-2 shadow-glow-emerald transition-all active:scale-95 disabled:opacity-50"
        >
          <QrCode className="w-4 h-4 text-white" />
          <span>{isConnecting ? 'Opening Pera QR Modal...' : 'Connect With Pera Wallet'}</span>
        </button>
      </div>
    </div>
  );
};

export default PeraTestnetModal;

