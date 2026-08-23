import React from 'react';
import { ListChecks, ToggleLeft, ToggleRight, Info, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { CompletedPlan } from '../types';

interface DecompositionWidgetProps {
  forceSingleStep: boolean;
  setForceSingleStep: (val: boolean) => void;
  isStreaming: boolean;
  completedPlan: CompletedPlan | null;
}

export const DecompositionWidget: React.FC<DecompositionWidgetProps> = ({
  forceSingleStep,
  setForceSingleStep,
  isStreaming,
  completedPlan
}) => {
  const isDecompositionEnabled = !forceSingleStep;

  return (
    <div className="bg-white border border-grid-800 rounded-card p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-grid-850 pb-2.5">
        <div className="flex items-center space-x-2">
          <ListChecks className="w-4.5 h-4.5 text-brand-emerald" />
          <h4 className="font-serif font-medium text-grid-100 text-body">
            Multi-Task Planner
          </h4>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => {
            if (!isStreaming) {
              setForceSingleStep(!forceSingleStep);
            }
          }}
          disabled={isStreaming}
          className={`flex items-center space-x-1.5 focus:outline-none transition-opacity cursor-pointer ${
            isStreaming ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={isDecompositionEnabled ? 'Decomposition Active' : 'Single-step Direct Routing'}
        >
          {isDecompositionEnabled ? (
            <ToggleRight className="w-9 h-6 text-brand-emerald" />
          ) : (
            <ToggleLeft className="w-9 h-6 text-grid-700" />
          )}
        </button>
      </div>

      <div className="space-y-3">
        {/* Status Indicator */}
        <div className="flex items-center justify-between text-caption">
          <span className="text-grid-500">Task planner status:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
              isDecompositionEnabled
                ? 'bg-brand-emeraldDim text-brand-emerald border border-brand-emerald/10'
                : 'bg-grid-850 text-grid-400 border border-grid-800/60'
            }`}
          >
            {isDecompositionEnabled ? 'Auto-Decompose' : 'Single-Route'}
          </span>
        </div>

        {/* Informative text */}
        <p className="text-caption text-grid-500 leading-relaxed">
          {isDecompositionEnabled
            ? 'Intelligent mode. Splits complex objectives into independent tasks, finding the best cost/latency candidate for each step individually with separate micro-payments.'
            : 'Direct route mode. Sends the entire prompt to a single provider cluster in a single payment handshake.'}
        </p>

        {/* If a plan is completed, show a mini dashboard of the planned subtasks */}
        {completedPlan && completedPlan.plan && completedPlan.plan.planned && (
          <div className="border-t border-grid-850 pt-3.5 space-y-2.5">
            <h5 className="text-caption font-semibold text-grid-100 flex items-center space-x-1.5">
              <span>Last Decomposed Plan Checklist</span>
            </h5>
            <div className="space-y-2">
              {completedPlan.steps.map((step, idx) => (
                <div key={idx} className="flex items-start justify-between bg-grid-950 p-2.5 rounded-control border border-grid-800/40 text-caption">
                  <div className="flex items-start space-x-2 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-semibold text-grid-100 truncate">{step.routing.selectedCandidate.modelName}</div>
                      <div className="text-grid-500 text-[11px] truncate">{step.routing.selectedCandidate.computeName}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-brand-emerald">{step.actualCostAlgo.toFixed(3)} A</div>
                    <div className="text-grid-500 text-[10px]">{step.actualDurationMs}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!completedPlan && isDecompositionEnabled && (
          <div className="bg-grid-950 p-3 rounded-control border border-grid-850 text-caption text-grid-500 flex items-start space-x-2">
            <Info className="w-4.5 h-4.5 text-brand-emerald shrink-0 mt-0.5" />
            <span>
              Describe complex requests like <i>"Draft escrow contract and write tests"</i> to trigger automated decomposition.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
