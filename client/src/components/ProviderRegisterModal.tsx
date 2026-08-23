import React, { useEffect, useState } from 'react';
import { X, Server, Cpu, Plus, Check } from 'lucide-react';
import { registerModel, registerCompute } from '../utils/api';

interface ProviderRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProviderRegisterModal: React.FC<ProviderRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [providerType, setProviderType] = useState<'compute' | 'model'>('compute');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute Form State
  const [computeName, setComputeName] = useState('Nebula Cluster (B200 NVL)');
  const [gpuType, setGpuType] = useState('NVIDIA B200 192GB Blackwell');
  const [vramGb, setVramGb] = useState(192);
  const [region, setRegion] = useState('US-West (Oregon)');
  const [costPerHourUsd, setCostPerHourUsd] = useState(4.85);
  const [latencyBaseMs, setLatencyBaseMs] = useState(25);
  const [interconnect, setInterconnect] = useState('NVLink 1.8 TB/s');

  // Model Form State
  const [modelName, setModelName] = useState('DeepSeek R1 (Reasoning 671B)');
  const [providerOrg, setProviderOrg] = useState('DeepSeek AI / Community');
  const [qualityBenchmark, setQualityBenchmark] = useState(96.2);
  const [costPer1kInput, setCostPer1kInput] = useState(0.00055);
  const [costPer1kOutput, setCostPer1kOutput] = useState(0.00219);
  const [typicalTps, setTypicalTps] = useState(85);

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
      if (providerType === 'compute') {
        const id = `custom_compute_${Date.now()}`;
        await registerCompute({
          id,
          name: computeName,
          gpuType,
          vramGb: Number(vramGb),
          region,
          costPerHourUsd: Number(costPerHourUsd),
          latencyBaseMs: Number(latencyBaseMs),
          interconnect,
          x402Supported: true,
          status: 'active'
        });
      } else {
        const id = `custom_model_${Date.now()}`;
        await registerModel({
          id,
          name: modelName,
          providerOrg,
          qualityBenchmark: Number(qualityBenchmark),
          costPer1kInputTokensUsd: Number(costPer1kInput),
          costPer1kOutputTokensUsd: Number(costPer1kOutput),
          typicalTps: Number(typicalTps),
          supportedModalities: ['code', 'reasoning', 'general'],
          status: 'online'
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Registration failed', err);
      setError('Registration failed. Check the values and confirm the API is available.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby="provider-register-title" className="bg-white border border-zinc-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-xl relative">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
             <h3 id="provider-register-title" className="text-sm font-bold font-mono text-zinc-950 uppercase tracking-wider">
              Register Provider on AgentGrid
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close provider registration dialog"
            className="text-zinc-400 hover:text-zinc-900 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-lg border border-zinc-200 text-xs font-mono">
          <button
            type="button"
            onClick={() => setProviderType('compute')}
            className={`py-2 px-3 rounded-md flex items-center justify-center space-x-2 transition-all ${
              providerType === 'compute'
                ? 'bg-white text-amber-600 font-semibold border border-zinc-200 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>GPU Compute Node</span>
          </button>

          <button
            type="button"
            onClick={() => setProviderType('model')}
            className={`py-2 px-3 rounded-md flex items-center justify-center space-x-2 transition-all ${
              providerType === 'model'
                ? 'bg-white text-emerald-600 font-semibold border border-zinc-200 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Model Endpoint</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {providerType === 'compute' ? (
            <>
              <div>
                <label htmlFor="compute-name" className="text-zinc-500 block mb-1">Provider Node Label</label>
                <input
                  id="compute-name" type="text"
                  value={computeName}
                  onChange={(e) => setComputeName(e.target.value)}
                  className="input-light"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="gpu-type" className="text-zinc-500 block mb-1">GPU Architecture</label>
                  <input
                      id="gpu-type" type="text"
                    value={gpuType}
                    onChange={(e) => setGpuType(e.target.value)}
                    className="input-light"
                    required
                  />
                </div>
                <div>
                    <label htmlFor="vram-gb" className="text-zinc-500 block mb-1">VRAM (GB)</label>
                  <input
                      id="vram-gb" type="number" min="1"
                    value={vramGb}
                    onChange={(e) => setVramGb(parseInt(e.target.value, 10))}
                    className="input-light"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="compute-rate" className="text-zinc-500 block mb-1">Spot Rate ($/hr)</label>
                  <input
                    id="compute-rate" type="number" min="0" step="0.01"
                    value={costPerHourUsd}
                    onChange={(e) => setCostPerHourUsd(parseFloat(e.target.value))}
                    className="input-light"
                    required
                  />
                </div>
                <div>
                    <label htmlFor="compute-latency" className="text-zinc-500 block mb-1">Ping Latency (ms)</label>
                  <input
                    id="compute-latency" type="number" min="0"
                    value={latencyBaseMs}
                    onChange={(e) => setLatencyBaseMs(parseInt(e.target.value, 10))}
                    className="input-light"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-500 block mb-1">Region & Interconnect</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="input-light"
                    placeholder="e.g. US-West (Oregon)"
                  />
                  <input
                    type="text"
                    value={interconnect}
                    onChange={(e) => setInterconnect(e.target.value)}
                    className="input-light"
                    placeholder="e.g. NVLink 1.8 TB/s"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="model-name" className="text-zinc-500 block mb-1">Model Name</label>
                <input
                  id="model-name"
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="input-light"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="provider-org" className="text-zinc-500 block mb-1">Provider Org</label>
                  <input
                    id="provider-org"
                    type="text"
                    value={providerOrg}
                    onChange={(e) => setProviderOrg(e.target.value)}
                    className="input-light"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="quality-benchmark" className="text-zinc-500 block mb-1">Benchmark (0-100)</label>
                  <input
                    id="quality-benchmark"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={qualityBenchmark}
                    onChange={(e) => setQualityBenchmark(parseFloat(e.target.value))}
                    className="input-light"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cost-input" className="text-zinc-500 block mb-1">Input / 1k Tokens ($)</label>
                  <input
                    id="cost-input"
                    type="number"
                    step="0.00001"
                    min="0"
                    value={costPer1kInput}
                    onChange={(e) => setCostPer1kInput(parseFloat(e.target.value))}
                    className="input-light"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cost-output" className="text-zinc-500 block mb-1">Output / 1k Tokens ($)</label>
                  <input
                    id="cost-output"
                    type="number"
                    step="0.00001"
                    min="0"
                    value={costPer1kOutput}
                    onChange={(e) => setCostPer1kOutput(parseFloat(e.target.value))}
                    className="input-light"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="typical-tps" className="text-zinc-500 block mb-1">Typical TPS</label>
                  <input
                    id="typical-tps"
                    type="number"
                    min="1"
                    value={typicalTps}
                    onChange={(e) => setTypicalTps(parseInt(e.target.value, 10))}
                    className="input-light"
                    required
                  />
                </div>
              </div>
            </>
          )}

            {error && <div role="alert" className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
            <div className="pt-3 border-t border-zinc-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Register Node'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderRegisterModal;