import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { SpendingPolicy } from '../types';
import { fetchPolicy, updatePolicy } from '../utils/api';

interface SpendingPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpendingPolicyModal: React.FC<SpendingPolicyModalProps> = ({ isOpen, onClose }) => {
  const [policy, setPolicy] = useState<SpendingPolicy | null>(null);
  const [todaySpendAlgo, setTodaySpendAlgo] = useState(0);
  const [draft, setDraft] = useState<{ dailyBudgetAlgo: string; autoApproveThresholdAlgo: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setErrorMessage(null);
    fetchPolicy().then((res) => {
      if (!res) throw new Error('The spending policy could not be loaded.');
      setPolicy(res.policy);
      setTodaySpendAlgo(res.todaySpendAlgo);
      setDraft({
        dailyBudgetAlgo: String(res.policy.dailyBudgetAlgo),
        autoApproveThresholdAlgo: String(res.policy.autoApproveThresholdAlgo)
      });
    }).catch((err) => setErrorMessage(err instanceof Error ? err.message : 'The spending policy could not be loaded.'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!draft) return;
    const dailyBudgetAlgo = parseFloat(draft.dailyBudgetAlgo);
    const autoApproveThresholdAlgo = parseFloat(draft.autoApproveThresholdAlgo);
    if (!(dailyBudgetAlgo > 0) || !(autoApproveThresholdAlgo >= 0) || autoApproveThresholdAlgo > dailyBudgetAlgo) {
      setErrorMessage('Enter a positive daily cap and a threshold between 0 and the daily cap.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setErrorMessage(null);
    try {
      const updated = await updatePolicy({ dailyBudgetAlgo, autoApproveThresholdAlgo });
      if (!updated) throw new Error('The spending policy could not be saved.');
      setPolicy(updated);
      setSaved(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'The spending policy could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const remaining = policy ? Math.max(0, policy.dailyBudgetAlgo - todaySpendAlgo) : 0;
  const usedFraction = policy && policy.dailyBudgetAlgo > 0 ? Math.min(1, todaySpendAlgo / policy.dailyBudgetAlgo) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-grid-950/80 backdrop-blur-sm animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby="spending-policy-title" className="w-full max-w-md bg-grid-900 border border-grid-750 rounded-panel shadow-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-grid-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <h2 id="spending-policy-title" className="text-heading-sm text-grid-100">Spending governance</h2>
          </div>
          <button onClick={onClose} className="text-grid-500 hover:text-grid-100 transition-colors cursor-pointer">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-body-sm text-grid-400">
            Controls how much the agent's wallet can spend without asking. A task above the threshold pauses for
            your sign-off; a task that would exceed the daily cap is rejected outright, sign-off or not.
          </p>

          {loading && <div className="flex items-center gap-2 text-body-sm text-grid-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading policy...</div>}
          {errorMessage && <div role="alert" className="flex items-start gap-2 rounded-control border border-signal-rose/30 bg-signal-roseDim p-3 text-body-sm text-signal-rose"><AlertTriangle className="h-4 w-4 shrink-0" /><span>{errorMessage}</span></div>}

          {policy && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-body-sm">
                <span className="text-grid-400">Spent today</span>
                <span className="text-grid-100 font-mono">{todaySpendAlgo.toFixed(3)} / {policy.dailyBudgetAlgo} ALGO</span>
              </div>
              <div className="h-1.5 rounded-full bg-grid-800 overflow-hidden">
                <div
                  className="h-full bg-brand-emerald transition-all"
                  style={{ width: `${usedFraction * 100}%` }}
                />
              </div>
              <div className="text-caption text-grid-500">{remaining.toFixed(3)} ALGO remaining today</div>
            </div>
          )}

          {draft && (
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-caption text-grid-500">Daily budget cap (ALGO)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.dailyBudgetAlgo}
                  onChange={(e) => setDraft((d) => (d ? { ...d, dailyBudgetAlgo: e.target.value } : d))}
                  className="w-full bg-grid-950 border border-grid-750 rounded-control px-3 py-2 text-body-sm text-grid-100 focus:outline-none focus:border-brand-emerald/40"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-caption text-grid-500">Auto-approve under (ALGO)</span>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={draft.autoApproveThresholdAlgo}
                  onChange={(e) => setDraft((d) => (d ? { ...d, autoApproveThresholdAlgo: e.target.value } : d))}
                  className="w-full bg-grid-950 border border-grid-750 rounded-control px-3 py-2 text-body-sm text-grid-100 focus:outline-none focus:border-brand-emerald/40"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-2 px-5 py-4 border-t border-grid-800">
          {saved && <span className="text-caption text-brand-emerald mr-auto">Saved</span>}
          <button
            onClick={onClose}
            className="text-body-sm px-3.5 py-2 rounded-control text-grid-400 hover:text-grid-100 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-body-sm px-3.5 py-2 rounded-control bg-brand-emerald text-white font-medium hover:bg-brand-emerald/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpendingPolicyModal;

