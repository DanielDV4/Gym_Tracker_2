import React from 'react';
import { Exercise } from '../types';
import { Play, TrendingUp, ShieldAlert, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';

interface HomeDashboardProps {
  exercises: Exercise[];
  strikeCounts: Record<string, number>;
  currentWeights: Record<string, number>;
  onStartWorkout: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  exercises,
  strikeCounts,
  currentWeights,
  onStartWorkout,
}) => {
  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Quick Start Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C1C1E] via-[#1C1C1E] to-emerald-950/30 border border-[#00E676]/30 p-5 shadow-2xl shadow-[#00E676]/5">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp className="w-32 h-32 text-[#00E676]" />
        </div>

        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
              PURE DART ENGINE
            </span>
            <span className="text-xs text-zinc-400 font-semibold">Progressive Overload</span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug">
            Automatic Weight Progression & 3-Strike Deload Engine
          </h2>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Strict mathematical OCL invariants enforce target safety bounds while automatically incrementing workload on success or applying a 10% deload penalty after 3 failed sessions.
          </p>

          <button
            onClick={onStartWorkout}
            className="w-full py-3.5 px-4 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-black font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#00E676]/25 transition-all transform active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Interactive Workout Logger</span>
          </button>
        </div>
      </div>

      {/* Deload Risk Monitor */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Deload Risk Monitor (3-Strike Rule)</span>
          </h3>
          <span className="text-[11px] text-zinc-400">Anti-Contamination Active</span>
        </div>

        <div className="space-y-2">
          {exercises.map((ex) => {
            const strikes = strikeCounts[ex.id] || 0;
            const weight = currentWeights[ex.id] || 135;

            let badgeBg = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
            let statusLabel = 'Optimal Progression';

            if (strikes === 1) {
              badgeBg = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
              statusLabel = 'Strike 1 / 3';
            } else if (strikes === 2) {
              badgeBg = 'bg-orange-500/15 border-orange-500/30 text-orange-400';
              statusLabel = 'Strike 2 / 3 Warning';
            } else if (strikes >= 3) {
              badgeBg = 'bg-rose-500/15 border-rose-500/30 text-rose-400';
              statusLabel = 'Strike 3: 10% Deload Active';
            }

            return (
              <div
                key={ex.id}
                className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-3 flex items-center justify-between transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white">{ex.name}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Target: {weight} lbs • Step: +{ex.baseIncrement} lbs • Max: {ex.maxWeightCapacity} lbs
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-md border ${badgeBg}`}
                >
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* OCL Invariants Mathematical Guarantee */}
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white">Enforced OCL Invariants</h4>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-[#0D0D0D] p-2.5 rounded-lg border border-[#2C2C2E]">
            <div className="text-zinc-400 font-medium">Exercise Invariants</div>
            <div className="text-zinc-200 font-mono mt-1 text-[10px]">
              sets &gt; 0<br />
              baseIncrement &gt; 0<br />
              baseIncrement &le; maxWeight
            </div>
          </div>

          <div className="bg-[#0D0D0D] p-2.5 rounded-lg border border-[#2C2C2E]">
            <div className="text-zinc-400 font-medium">WorkoutSet Invariants</div>
            <div className="text-zinc-200 font-mono mt-1 text-[10px]">
              setNumber &gt; 0<br />
              targetWeight &gt; 0<br />
              actualWeight &ge; 0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
