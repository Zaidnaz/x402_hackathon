import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Loader2, 
  Globe, 
  Key,
  RefreshCw 
} from 'lucide-react';
import { 
  registerOnGoPlausibleBazaar, 
  generateAgentGridBazaarPayload,
  BazaarRegistrationRequest,
  BazaarRegistrationResponse 
} from '../utils/bazaar';

interface BazaarRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPayload?: Partial<BazaarRegistrationRequest>;
}

export const BazaarRegistrationModal: React.FC<BazaarRegistrationModalProps> = ({
  isOpen,
  onClose,
  defaultPayload,
}) => {
  const [formData, setFormData] = useState<BazaarRegistrationRequest>({
    name: defaultPayload?.name || 'AgentGrid Compute Endpoint',
    description: defaultPayload?.description || 'AgentGrid x402-enabled compute endpoint. Autonomous agent pays per task via Algorand TestNet.',
    endpointUrl: defaultPayload?.endpointUrl || 'https://your-domain.com/api/merchant/compute/run',
    paymentAddress: defaultPayload?.paymentAddress || '',
    price: defaultPayload?.price || 500000,
    category: defaultPayload?.category || 'ai-compute',
    tags: defaultPayload?.tags || ['agentgrid', 'x402', 'algorand', 'compute'],
    network: defaultPayload?.network || 'algorand-testnet',
    scheme: 'exact',
  });
  
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BazaarRegistrationResponse | null>(null);
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
    setResult(null);
    
    try {
      const response = await registerOnGoPlausibleBazaar(formData, apiKey || undefined);
      setResult(response);
      if (!response.success) {
        setError(response.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    const payload = generateAgentGridBazaarPayload(
      'Community GPU Node',
      formData.endpointUrl || 'https://your-domain.com/api/merchant/compute/run',
      formData.paymentAddress || 'MERCHANT_ALGO_ADDRESS',
      formData.price
    );
    setFormData(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-grid-950/80 backdrop-blur-sm animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby="bazaar-title" className="bg-grid-900 border border-grid-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-grid-800 pb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-brand-emerald" />
            <h3 id="bazaar-title" className="text-sm font-bold font-mono text-grid-100 uppercase tracking-wider">
              Register on GoPlausible Bazaar
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-grid-400 hover:text-grid-200 p-1 rounded-md disabled:opacity-50"
            aria-label="Close bazaar registration"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-grid-400 font-sans">
          Publish your x402 endpoint to the GoPlausible Bazaar for discovery by autonomous agents worldwide.
        </p>

        {error && (
          <div role="alert" className="p-3 bg-signal-roseDim border border-signal-rose/30 rounded-lg text-sm text-signal-rose flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result?.success && (
          <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg text-sm text-brand-emerald flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div className="space-y-1">
              <div className="font-semibold">Successfully registered on Bazaar!</div>
              <div className="text-[11px] text-grid-300">
                Endpoint ID: <code className="font-mono">{result.endpointId}</code>
              </div>
              {result.bazaarUrl && (
                <a 
                  href={result.bazaarUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[11px] underline hover:text-white"
                >
                  View on GoPlausible Bazaar →
                </a>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label htmlFor="bazaar-name" className="text-grid-400 block mb-1">Endpoint Name</label>
            <input
              id="bazaar-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
              required
            />
          </div>

          <div>
            <label htmlFor="bazaar-url" className="text-grid-400 block mb-1">Endpoint URL</label>
            <input
              id="bazaar-url"
              type="url"
              value={formData.endpointUrl}
              onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
              className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
              placeholder="https://your-domain.com/api/merchant/compute/run"
              required
            />
          </div>

          <div>
            <label htmlFor="bazaar-payment" className="text-grid-400 block mb-1">Merchant Algorand Address</label>
            <input
              id="bazaar-payment"
              type="text"
              value={formData.paymentAddress}
              onChange={(e) => setFormData({ ...formData, paymentAddress: e.target.value })}
              className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
              placeholder="58-character Algorand address"
              maxLength={58}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bazaar-price" className="text-grid-400 block mb-1">Price (µALGO)</label>
              <input
                id="bazaar-price"
                type="number"
                min="1000"
                max="10000000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
                required
              />
            </div>
            <div>
              <label htmlFor="bazaar-category" className="text-grid-400 block mb-1">Category</label>
              <select
                id="bazaar-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
              >
                <option value="ai-compute">AI Compute</option>
                <option value="ai-model">AI Model</option>
                <option value="storage">Storage</option>
                <option value="bandwidth">Bandwidth</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="bazaar-tags" className="text-grid-400 block mb-1">Tags (comma-separated)</label>
            <input
              id="bazaar-tags"
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
            />
          </div>

          <div className="border-t border-grid-800 pt-4">
            <label htmlFor="bazaar-api-key" className="text-grid-400 block mb-1 flex items-center space-x-1">
              <Key className="w-3.5 h-3.5" />
              <span>GoPlausible API Key (Optional)</span>
            </label>
            <input
              id="bazaar-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-grid-950 border border-grid-750 rounded p-2 text-grid-100 focus:outline-none focus:border-signal-amber"
              placeholder="Bearer token for authenticated registration"
            />
            <p className="text-[10px] text-grid-500 mt-1">Get your API key from <a href="https://facilitator.goplausible.xyz" target="_blank" rel="noreferrer" className="underline">facilitator.goplausible.xyz</a></p>
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
              type="button"
              onClick={handleAutoFill}
              disabled={loading}
              className="px-4 py-2 rounded bg-signal-amber/20 hover:bg-signal-amber/30 border border-signal-amber/30 text-signal-amber font-bold uppercase tracking-wider flex items-center space-x-2 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>Auto-Fill from AgentGrid</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded bg-brand-emerald text-black font-bold uppercase tracking-wider flex items-center space-x-2 shadow-glow-emerald disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register on Bazaar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BazaarRegistrationModal;