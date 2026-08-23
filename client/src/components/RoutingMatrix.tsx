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
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { TaskRequirement, RoutingDecision, CandidateEvaluation } from '../types';
import { analyzePrompt, evaluateRoute, generateFallbackRoute } from '../utils/api';
import { TourGuideButton } from './TourGuideButton';

export const RoutingMatrix: React.FC = () => {
  const [prompt, setPrompt] = useState('Optimize parallel matrix multiplication in CUDA C++');
  const [costWeight, setCostWeight] = useState(30);
  const [latWeight, setLatWeight] = useState(30);
  const [qualWeight, setQualWeight] = useState(30);
  const [relWeight, setRelWeight] = useState(10);
  const [routing, setRouting] = useState<RoutingDecision | null>(() => generateFallbackRoute());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recompute = async () => {
    setLoading(true);
    setError(null);
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
      setError('Unable to recompute this route. Showing the last successful result.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recompute();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-light p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-semibold">Mathematical Optimization Engine</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-zinc-950">
            Multi-Objective Pareto Frontier & Matrix
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-1 max-w-2xl">
            AgentGrid evaluates all active combinatorial permutations of <span className="text-zinc-700">Model $\times$ Compute</span> nodes to find non-dominated Pareto-optimal choices.
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

          <div className="bg-zinc-100 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border border-zinc-200 text-[11px] sm:text-xs font-mono text-zinc-500">
            Permutations: <strong className="text-emerald-600 font-semibold">{routing?.evaluatedCandidatesCount || 0}</strong>
          </div>
          <button
            onClick={recompute}
            disabled={loading || !prompt.trim()}
            className="px-3 py-2 rounded-lg bg-zinc-950 text-white text-xs font-mono font-bold flex items-center gap-1.5 disabled:opacity-40 hover:bg-zinc-900"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Computing' : 'Recompute'}
          </button>
        </div>
      </div>

      <div className="card-light p-4 space-y-2">
        <label htmlFor="routing-prompt" className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">Workload to evaluate</label>
        <textarea
          id="routing-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={2}
          className="input-light resize-y"
          placeholder="Describe the workload you want to route"
        />
        {error && <div role="alert" className="text-xs text-red-600">{error}</div>}
      </div>

      {/* Interactive Weight Controllers */}
      <div data-tour="weight-sliders" className="card-light p-4 sm:p-5 space-y-3 sm:space-y-4">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 flex items-center space-x-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
          <span>Interactive Objective Weight Tuners</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono">
          {/* Cost Weight */}
          <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500 flex items-center space-x-1">
                <Coins className="w-3 h-3 text-emerald-600" />
                <span>Cost Weight (w_c)</span>
              </span>
              <span className="text-emerald-600 font-semibold">{costWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={costWeight}
              onChange={(e) => setCostWeight(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Latency Weight */}
          <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Latency Weight (w_l)</span>
              </span>
              <span className="text-amber-600 font-semibold">{latWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={latWeight}
              onChange={(e) => setLatWeight(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Quality Weight */}
          <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>Quality Weight (w_q)</span>
              </span>
              <span className="text-emerald-600 font-semibold">{qualWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={qualWeight}
              onChange={(e) => setQualWeight(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Reliability Weight */}
          <div className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-zinc-400" />
                <span>Reliability Weight (w_r)</span>
              </span>
              <span className="text-zinc-600 font-semibold">{relWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={relWeight}
              onChange={(e) => setRelWeight(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Candidate Ranking & Score Table */}
      <div data-tour="candidate-table" className="card-light overflow-hidden">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600">
            Combinatorial Candidate Matrix (Ranked by Score)
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Formula: <code className="text-emerald-600 font-semibold">Score = w_q·Q - w_c·C - w_l·L + w_r·R - Penalties</code>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-light">
            <thead>
              <tr>
                <th className="py-2.5 px-4 font-medium" style={{ cursor: 'pointer' }}>
                  Rank
                </th>
                <th className="py-2.5 px-4 font-medium" style={{ cursor: 'pointer' }}>
                  Model & Compute Node
                </th>
                <th className="py-2.5 px-4 font-medium" style={{ cursor: 'pointer' }}>
                  Est. Latency
                </th>
                <th className="py-2.5 px-4 font-medium" style={{ cursor: 'pointer' }}>
                  Est. Cost (ALGO)
                </th>
                <th className="py-2.5 px-4 font-medium" style={{ cursor: 'pointer' }}>
                  Quality Score
                </th>
                <th className="py-2.5 px-4 font-medium" style={{ cursor: 'pointer' }}>
                  SLA / Budget
                </th>
                <th className="py-2.5 px-4 font-medium" style={{ cursor: 'pointer' }}>
                  Pareto Front
                </th>
                <th className="py-2.5 px-4 text-right font-medium">
                  Composite Score
                </th>
              </tr>
            </thead>
            <tbody>
              {routing?.paretoFrontier && routing.paretoFrontier.map((c, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    idx === 0 ? 'bg-emerald-50 border-l-2 border-emerald-600' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      idx === 0 ? 'bg-emerald-600 text-white' : idx === 1 ? 'bg-zinc-200 text-zinc-700' : 'text-zinc-500'
                    }`}>
                      #{c.rank}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-950">{c.modelName}</div>
                    <div className="text-[10px] text-zinc-500">{c.computeName} ({c.gpuType})</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-zinc-700 font-medium">{c.estimatedLatencyMs} ms</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-emerald-600 font-semibold">{c.estimatedCostAlgo} ALGO</span>
                    <span className="text-[10px] text-zinc-500 block">(${c.estimatedCostUsd.toFixed(4)})</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-emerald-600 font-semibold">{c.projectedQualityScore}</span>
                    <span className="text-zinc-500 text-[10px]"> / 100</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5">
                      {c.slaAdherent ? (
                        <span className="text-emerald-600 flex items-center space-x-0.5 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SLA OK</span>
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center space-x-0.5 text-[10px]">
                          <XCircle className="w-3 h-3" />
                          <span>SLA Exceeded</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td data-tour={idx === 0 ? "pareto-badge" : undefined} className="py-3 px-4">
                    {c.paretoOptimal ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        NON-DOMINATED
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[10px]">Dominated</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-bold text-emerald-600 mono-tabular">
                      {c.compositeScore}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">pts</span>
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

export default RoutingMatrix;