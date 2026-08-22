import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Clock, 
  Info, 
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { TaskRequirement, RoutingDecision, CandidateEvaluation } from '../types';
import { analyzePrompt, evaluateRoute } from '../utils/api';
import { TourGuideButton } from './TourGuideButton';

export const RoutingMatrix: React.FC = () => {
  const [prompt, setPrompt] = useState('Optimize parallel matrix multiplication in CUDA C++');
  const [costWeight, setCostWeight] = useState(30);
  const [latWeight, setLatWeight] = useState(30);
  const [qualWeight, setQualWeight] = useState(30);
  const [relWeight, setRelWeight] = useState(10);
  const [routing, setRouting] = useState<RoutingDecision | null>(null);
  const [loading, setLoading] = useState(false);

  const recompute = async () => {
    setLoading(true);
    try {
      const totalWeight = costWeight + latWeight + qualWeight + relWeight || 100;
      const req: TaskRequirement = await analyzePrompt(prompt, {
        customWeights: {
          cost: costWeight / totalWeight,
          latency: latWeight / totalWeight,
          quality: qualWeight / totalWeight,
          reliability: relWeight / totalWeight
        }
      });
      const res = await evaluateRoute(req);
      setRouting(res);
    } catch (err) {
      console.error('Recompute error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recompute();
  }, [costWeight, latWeight, qualWeight, relWeight]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-grid-900 border border-grid-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-signal-cyan animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-signal-cyan font-semibold">Mathematical Optimization Engine</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-grid-100">
            Multi-Objective Pareto Frontier & Matrix
          </h2>
          <p className="text-xs font-mono text-grid-400 mt-1 max-w-2xl">
            AgentGrid evaluates all active combinatorial permutations of <span className="text-grid-200">Model $\times$ Compute</span> nodes to find non-dominated Pareto-optimal choices.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TourGuideButton
            tourId="routing-tour"
            buttonLabel="How It Works"
            steps={[
              {
                targetSelector: '[data-tour="weight-sliders"]',
                title: "1. Objective Weight Tuners",
                description: "Drag the sliders for Cost, Latency, Quality, and Reliability to simulate different autonomous agent optimization preferences."
              },
              {
                targetSelector: '[data-tour="candidate-table"]',
                title: "2. Combinatorial Candidate Ranking",
                description: "Every Model + GPU cluster combination is scored in real-time. Rank #1 highlights the non-dominated Pareto optimum."
              },
              {
                targetSelector: '[data-tour="pareto-badge"]',
                title: "3. Non-Dominated Pareto Status",
                description: "Identifies mathematical Pareto efficiency where no other node delivers lower latency at a cheaper micro-ALGO price."
              }
            ]}
          />

          <div className="bg-grid-950 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border border-grid-800 text-[11px] sm:text-xs font-mono text-grid-300">
            Permutations: <strong className="text-signal-amber font-semibold">{routing?.evaluatedCandidatesCount || 0}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Weight Controllers */}
      <div data-tour="weight-sliders" className="bg-grid-900 border border-grid-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-300 flex items-center space-x-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-signal-amber" />
          <span>Interactive Objective Weight Tuners</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono">
          {/* Cost Weight */}
          <div className="bg-grid-950 p-3.5 rounded-lg border border-grid-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-grid-400 flex items-center space-x-1">
                <Coins className="w-3 h-3 text-signal-emerald" />
                <span>Cost Weight (w_c)</span>
              </span>
              <span className="text-signal-emerald font-semibold">{costWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={costWeight}
              onChange={(e) => setCostWeight(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-grid-800 rounded-lg appearance-none cursor-pointer accent-signal-emerald"
            />
          </div>

          {/* Latency Weight */}
          <div className="bg-grid-950 p-3.5 rounded-lg border border-grid-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-grid-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-signal-amber" />
                <span>Latency Weight (w_l)</span>
              </span>
              <span className="text-signal-amber font-semibold">{latWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={latWeight}
              onChange={(e) => setLatWeight(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-grid-800 rounded-lg appearance-none cursor-pointer accent-signal-amber"
            />
          </div>

          {/* Quality Weight */}
          <div className="bg-grid-950 p-3.5 rounded-lg border border-grid-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-grid-400 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-signal-cyan" />
                <span>Quality Weight (w_q)</span>
              </span>
              <span className="text-signal-cyan font-semibold">{qualWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={qualWeight}
              onChange={(e) => setQualWeight(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-grid-800 rounded-lg appearance-none cursor-pointer accent-signal-cyan"
            />
          </div>

          {/* Reliability Weight */}
          <div className="bg-grid-950 p-3.5 rounded-lg border border-grid-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-grid-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-grid-300" />
                <span>Reliability Weight (w_r)</span>
              </span>
              <span className="text-grid-200 font-semibold">{relWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={relWeight}
              onChange={(e) => setRelWeight(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-grid-800 rounded-lg appearance-none cursor-pointer accent-grid-400"
            />
          </div>
        </div>
      </div>

      {/* Candidate Ranking & Score Table */}
      <div data-tour="candidate-table" className="bg-grid-900 border border-grid-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-grid-950 border-b border-grid-800 flex items-center justify-between">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-200">
            Combinatorial Candidate Matrix (Ranked by Score)
          </div>
          <div className="text-[11px] font-mono text-grid-400">
            Formula: <code className="text-signal-amber font-semibold">Score = w_q·Q - w_c·C - w_l·L + w_r·R - Penalties</code>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-grid-950/60 text-grid-400 text-[10px] uppercase border-b border-grid-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Model & Compute Node</th>
                <th className="py-3 px-4">Est. Latency</th>
                <th className="py-3 px-4">Est. Cost (ALGO)</th>
                <th className="py-3 px-4">Quality Score</th>
                <th className="py-3 px-4">SLA / Budget</th>
                <th className="py-3 px-4">Pareto Front</th>
                <th className="py-3 px-4 text-right">Composite Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grid-800/60">
              {routing?.paretoFrontier && routing.paretoFrontier.map((c, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-grid-850/50 transition-all ${
                    idx === 0 ? 'bg-signal-amberDim/10 border-l-2 border-signal-amber' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      idx === 0 ? 'bg-signal-amber text-grid-950' : idx === 1 ? 'bg-grid-750 text-grid-200' : 'text-grid-500'
                    }`}>
                      #{c.rank}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-grid-100">{c.modelName}</div>
                    <div className="text-[10px] text-grid-400">{c.computeName} ({c.gpuType})</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-grid-200 font-medium">{c.estimatedLatencyMs} ms</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-signal-emerald font-semibold">{c.estimatedCostAlgo} ALGO</span>
                    <span className="text-[10px] text-grid-500 block">(${c.estimatedCostUsd.toFixed(4)})</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-signal-cyan font-semibold">{c.projectedQualityScore}</span>
                    <span className="text-grid-500 text-[10px]"> / 100</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5">
                      {c.slaAdherent ? (
                        <span className="text-signal-emerald flex items-center space-x-0.5 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SLA OK</span>
                        </span>
                      ) : (
                        <span className="text-signal-rose flex items-center space-x-0.5 text-[10px]">
                          <XCircle className="w-3 h-3" />
                          <span>SLA Exceeded</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td data-tour={idx === 0 ? "pareto-badge" : undefined} className="py-3 px-4">
                    {c.paretoOptimal ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-signal-cyanDim text-signal-cyan border border-signal-cyan/30">
                        NON-DOMINATED
                      </span>
                    ) : (
                      <span className="text-grid-600 text-[10px]">Dominated</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-bold text-signal-amber mono-tabular">
                      {c.compositeScore}
                    </span>
                    <span className="text-[10px] text-grid-500 block">pts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
