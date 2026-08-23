import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConnecting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConnecting, onClose]);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby="pera-title" className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl relative font-mono text-xs text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
               <h2 id="pera-title" className="text-sm font-bold text-zinc-950">Connect Pera Wallet (TestNet)</h2>
              <p className="text-[10px] text-zinc-500 font-sans">Mobile QR & Web Connection Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Pera wallet dialog"
            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Step Setup Guide */}
        <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
          <div className="text-[11px] font-bold uppercase text-emerald-600 tracking-wide">
            ⚠️ Important: Switch Pera App to TestNet
          </div>

          <div className="space-y-2.5 text-[11px] font-sans text-zinc-600">
            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-900 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                1
              </span>
              <div>
                Open the <strong className="text-zinc-950">Pera Wallet</strong> app on your mobile device.
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-900 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                2
              </span>
              <div>
                Go to <strong className="text-zinc-950">Settings</strong> (bottom right icon) ➔ <strong className="text-zinc-950">Developer Settings</strong> (or <em>Node Settings</em>) ➔ Select <strong className="text-emerald-600">TestNet</strong>.
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-900 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                3
              </span>
              <div>
                Click the <strong className="text-zinc-950">Connect Pera Wallet</strong> button below and scan the QR code using your Pera mobile camera.
              </div>
            </div>
          </div>
        </div>

        {/* TestNet Faucet Callout */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-zinc-950 flex items-center space-x-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>Need Free TestNet ALGO?</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-sans">
              Request 10 test ALGO from the official Algorand dispenser
            </div>
          </div>
          <a
            href="https://bank.testnet.algorand.network/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-emerald-600 hover:text-emerald-700 text-[11px] flex items-center space-x-1 transition-all"
          >
            <span>Get ALGO</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Error message if any */}
        {connectError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[11px] font-sans flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{connectError}</div>
          </div>
        )}

        {/* Connect Action Button */}
        <button
          onClick={handleConnectNow}
          disabled={isConnecting}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <QrCode className="w-4 h-4" />
          <span>{isConnecting ? 'Opening Pera QR Modal...' : 'Connect With Pera Wallet'}</span>
        </button>
      </div>
    </div>
  );
};

export default PeraTestnetModal;