import React, { useState } from 'react';
import { X, Cpu, Loader2, CheckCircle2 } from 'lucide-react';
import { registerCompute } from '../utils/api';

interface RegisterGpuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterGpuModal: React.FC<RegisterGpuModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [nodeName, setNodeName] = useState('');
  const [gpuType, setGpuType] = useState('NVIDIA RTX 4090 24GB');
  const [vramGb, setVramGb] = useState(24);
  const [region, setRegion] = useState('US-East (Virginia)');
  const [costPerHourUsd, setCostPerHourUsd] = useState(0.45);
  const [latencyBaseMs, setLatencyBaseMs] = useState(45);
  const [interconnect, setInterconnect] = useState('PCIe 4.0 x16');
  const [payoutAddress, setPayoutAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim()) {
      setError('Please provide a node or rig name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerCompute({
        name: nodeName,
        gpuType,
        vramGb: Number(vramGb),
        region,
        costPerHourUsd: Number(costPerHourUsd),
        latencyBaseMs: Number(latencyBaseMs),
        bandwidthGbps: 100,
        interconnect,
        reliabilityUptime: 99.9,
        algorandPayoutAddress: payoutAddress.trim() || 'D8M2WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6DEF',
        x402Supported: true,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check the API is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby="register-gpu-title" className="bg-white border border-zinc-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <h3 id="register-gpu-title" className="text-sm font-bold font-mono text-zinc-950 uppercase tracking-wider">
              List Your Idle GPU
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-zinc-400 hover:text-zinc-900 p-1 rounded-md disabled:opacity-50 cursor-pointer"
            aria-label="Close registration dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-600 font-sans">
          Monetize your idle hardware. List your GPU on AgentGrid and receive automated ALGO micropayments via x402.
        </p>

        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label htmlFor="node-name" className="text-zinc-700 block mb-1">Node / Rig Name</label>
            <input
              id="node-name"
              type="text"
              placeholder="e.g. My-Desktop-RTX4090"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded p-2 text-zinc-950 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="gpu-type" className="text-zinc-700 block mb-1">GPU Hardware</label>
              <input
                id="gpu-type"
                type="text"
                value={gpuType}
                onChange={(e) => setGpuType(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded p-2 text-zinc-950 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label htmlFor="vram" className="text-zinc-700 block mb-1">VRAM (GB)</label>
              <input
                id="vram"
                type="number"
                value={vramGb}
                onChange={(e) => setVramGb(Number(e.target.value))}
                className="w-full bg-white border border-zinc-300 rounded p-2 text-zinc-950 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cost-hr" className="text-zinc-700 block mb-1">Cost / Hour (USD)</label>
              <input
                id="cost-hr"
                type="number"
                step="0.01"
                value={costPerHourUsd}
                onChange={(e) => setCostPerHourUsd(Number(e.target.value))}
                className="w-full bg-white border border-zinc-300 rounded p-2 text-zinc-950 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label htmlFor="region" className="text-zinc-700 block mb-1">Region</label>
              <input
                id="region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded p-2 text-zinc-950 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="payout-addr" className="text-zinc-700 block mb-1">Algorand Payout Address (Optional)</label>
            <input
              id="payout-addr"
              type="text"
              placeholder="Leave empty for auto-generated provider wallet"
              value={payoutAddress}
              onChange={(e) => setPayoutAddress(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded p-2 text-zinc-950 focus:outline-none focus:border-emerald-600 font-mono text-[11px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 px-4 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-white font-bold uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Listed on AgentGrid!</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Register & Connect x402 Endpoint</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default RegisterGpuModal;