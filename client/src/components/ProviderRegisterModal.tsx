import React, { useState } from 'react';
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-grid-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-grid-900 border border-grid-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-grid-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-signal-amber" />
            <h3 className="text-sm font-bold font-mono text-grid-100 uppercase tracking-wider">
              Register Provider on AgentGrid
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-grid-400 hover:text-grid-200 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-grid-950 rounded-lg border border-grid-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setProviderType('compute')}
            className={`py-2 px-3 rounded-md flex items-center justify-center space-x-2 transition-all ${
              providerType === 'compute'
                ? 'bg-grid-850 text-signal-amber font-semibold border border-grid-700'
                : 'text-grid-400'
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
                ? 'bg-grid-850 text-signal-cyan font-semibold border border-grid-700'
                : 'text-grid-400'
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
                <label className="text-grid-400 block mb-1">Provider Node Label</label>
                <input
                  type="text"
                  value={computeName}
                  onChange={(e) => setComputeName(e.target.value)}
                  className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-grid-400 block mb-1">GPU Architecture</label>
                  <input
                    type="text"
                    value={gpuType}
                    onChange={(e) => setGpuType(e.target.value)}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
                    required
                  />
                </div>
                <div>
                  <label className="text-grid-400 block mb-1">VRAM (GB)</label>
                  <input
                    type="number"
                    value={vramGb}
                    onChange={(e) => setVramGb(parseInt(e.target.value, 10))}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-grid-400 block mb-1">Spot Rate ($/hr)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPerHourUsd}
                    onChange={(e) => setCostPerHourUsd(parseFloat(e.target.value))}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
                    required
                  />
                </div>
                <div>
                  <label className="text-grid-400 block mb-1">Ping Latency (ms)</label>
                  <input
                    type="number"
                    value={latencyBaseMs}
                    onChange={(e) => setLatencyBaseMs(parseInt(e.target.value, 10))}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-grid-400 block mb-1">Region & Interconnect</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
                  />
                  <input
                    type="text"
                    value={interconnect}
                    onChange={(e) => setInterconnect(e.target.value)}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-grid-400 block mb-1">Model Name</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-cyan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-grid-400 block mb-1">Provider Org</label>
                  <input
                    type="text"
                    value={providerOrg}
                    onChange={(e) => setProviderOrg(e.target.value)}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-cyan"
                    required
                  />
                </div>
                <div>
                  <label className="text-grid-400 block mb-1">Benchmark (0-100)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={qualityBenchmark}
                    onChange={(e) => setQualityBenchmark(parseFloat(e.target.value))}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-cyan"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-grid-400 block mb-1">Input / 1k Tokens ($)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={costPer1kInput}
                    onChange={(e) => setCostPer1kInput(parseFloat(e.target.value))}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-cyan"
                    required
                  />
                </div>
                <div>
                  <label className="text-grid-400 block mb-1">Output / 1k Tokens ($)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={costPer1kOutput}
                    onChange={(e) => setCostPer1kOutput(parseFloat(e.target.value))}
                    className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-cyan"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-grid-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded text-grid-400 hover:text-grid-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-signal-amber text-grid-950 font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-glow-amber disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              <span>Register Node</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
