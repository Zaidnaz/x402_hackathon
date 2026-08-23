import React, { useState, useEffect } from 'react';
import { X, Cpu, DollarSign, Save, Loader2 } from 'lucide-react';
import { registerP2PProvider } from '../utils/api';

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
  const [specs, setSpecs] = useState('1x RTX 4080 | 16GB VRAM | Ubuntu 24.04');
  const [pricePerUnit, setPricePerUnit] = useState('0.15');
  const [category, setCategory] = useState<'COMPUTE_GPU' | 'MODEL_API'>('COMPUTE_GPU');
  const [unit, setUnit] = useState<'HOUR' | '1M_TOKENS' | 'MINUTE'>('HOUR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerP2PProvider({
        nodeName: nodeName || undefined,
        category,
        specs,
        pricePerUnit: parseFloat(pricePerUnit),
        unit,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check the API is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-grid-950/80 backdrop-blur-sm animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby="register-gpu-title" className="bg-grid-900 border border-grid-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-grid-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-signal-amber" />
            <h3 id="register-gpu-title" className="text-sm font-bold font-mono text-grid-100 uppercase tracking-wider">
              List Your Idle GPU
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-grid-400 hover:text-grid-200 p-1 rounded-md disabled:opacity-50"
            aria-label="Close registration dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-grid-400 font-sans">
          Monetize your idle hardware. List your GPU on AgentGrid and receive automated ALGO micropayments via x402.
        </p>

        {error && (
          <div role="alert" className="p-3 bg-signal-roseDim border border-signal-rose/30 rounded-lg text-sm text-signal-rose">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label htmlFor="node-name" className="text-grid-400 block mb-1">Node / Rig Name</label>
            <input
              id="node-name"
              type="text"
              placeholder="e.g. My-Desktop-RTX4080"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="category" className="text-grid-400 block mb-1">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'COMPUTE_GPU' | 'MODEL_API')}
                className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
              >
                <option value="COMPUTE_GPU">Compute GPU (Time-based)</option>
                <option value="MODEL_API">Model API (Token-based)</option>
              </select>
            </div>
            <div>
              <label htmlFor="unit" className="text-grid-400 block mb-1">Billing Unit</label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'HOUR' | '1M_TOKENS' | 'MINUTE')}
                className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
              >
                <option value="HOUR">Per Hour</option>
                <option value="1M_TOKENS">Per 1M Tokens</option>
                <option value="MINUTE">Per Minute</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="specs" className="text-grid-400 block mb-1">Hardware Specs</label>
            <input
              id="specs"
              type="text"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
              placeholder="e.g. 1x RTX 4090 | 24GB VRAM | 64GB RAM"
            />
          </div>

          <div>
            <label htmlFor="price" className="text-grid-400 block mb-1 flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Rate (ALGO / {unit})</span>
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
              required
            />
          </div>

          <div className="pt-3 border-t border-grid-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-2 rounded text-grid-400 hover:text-grid-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-brand-emerald text-black font-bold uppercase tracking-wider flex items-center space-x-2 shadow-glow-emerald disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish GPU Node'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterGpuModal;