import React, { useEffect, useState } from 'react';
import { ShieldCheck, Settings, RefreshCw, AlertTriangle, Coins } from 'lucide-react';
import { SpendingPolicy } from '../types';
import { fetchPolicy } from '../utils/api';
import { SpendingPolicyModal } from './SpendingPolicyModal';

interface SpendingGovernanceWidgetProps {
  onPolicyUpdated?: () => void;
}

export const SpendingGovernanceWidget: React.FC<SpendingGovernanceWidgetProps> = ({ onPolicyUpdated }) => {
  const [policy, setPolicy] = useState<SpendingPolicy | null>(null);
  const [todaySpendAlgo, setTodaySpendAlgo] = useState(0);
  const [remainingTodayAlgo, setRemainingTodayAlgo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPolicy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchPolicy();
      if (res) {
        setPolicy(res.policy);
        setTodaySpendAlgo(res.todaySpendAlgo);
        setRemainingTodayAlgo(res.remainingTodayAlgo);
      }
    } catch (err) {
      setError('Could not fetch limits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    loadPolicy();
    if (onPolicyUpdated) onPolicyUpdated();
  };

  const spentPercent = policy && policy.dailyBudgetAlgo > 0
    ? Math.min(100, (todaySpendAlgo / policy.dailyBudgetAlgo) * 100)
    : 0;

  return (
    <div className="bg-white border border-grid-800 rounded-card p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-grid-850 pb-2.5">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4.5 h-4.5 text-brand-emerald" />
          <h4 className="font-serif font-medium text-grid-100 text-body">
            Spending Governance
          </h4>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={loadPolicy}
            disabled={isLoading}
            className="p-1 rounded hover:bg-grid-850 text-grid-500 hover:text-grid-100 transition-all cursor-pointer"
            title="Refresh limits"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded hover:bg-grid-850 text-grid-500 hover:text-grid-100 transition-all cursor-pointer"
            title="Configure limits"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-caption text-signal-rose bg-signal-roseDim border border-signal-rose/25 rounded p-2.5 flex items-center space-x-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {policy ? (
        <div className="space-y-3.5 text-body-sm">
          {/* Daily Budget Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-caption">
              <span className="text-grid-500 font-medium">Daily Budget spent</span>
              <span className="text-grid-100 font-semibold">{todaySpendAlgo.toFixed(3)} / {policy.dailyBudgetAlgo.toFixed(2)} ALGO</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-grid-850 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  spentPercent > 80 ? 'bg-signal-rose' : spentPercent > 50 ? 'bg-signal-amber' : 'bg-brand-emerald'
                }`}
                style={{ width: `${spentPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-caption text-grid-500 pt-0.5">
              <span>{spentPercent.toFixed(0)}% used</span>
              <span>{remainingTodayAlgo.toFixed(3)} ALGO left</span>
            </div>
          </div>

          {/* Governance Invariants */}
          <div className="border-t border-grid-850 pt-3 space-y-2 text-caption">
            <div className="flex justify-between items-center">
              <span className="text-grid-500">Auto-Approve limit:</span>
              <span className="text-grid-100 font-semibold">&lt; {policy.autoApproveThresholdAlgo} ALGO</span>
            </div>
            <p className="text-grid-500 text-[11px] leading-relaxed pt-1">
              Tasks exceeding <span className="font-semibold text-grid-300">{policy.autoApproveThresholdAlgo} ALGO</span> will pause for manual sign-off before settlement.
            </p>
          </div>
        </div>
      ) : (
        <div className="py-2 text-caption text-grid-500 animate-pulse text-center">
          Loading governance policies...
        </div>
      )}

      {/* Embedded Modal Trigger */}
      <SpendingPolicyModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};
