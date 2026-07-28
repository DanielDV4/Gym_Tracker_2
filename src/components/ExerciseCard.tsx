import React from 'react';
import { Exercise, WorkoutSet, BannerType } from '../types';
import { Plus, Check, Trash2, Sparkles } from 'lucide-react';
import { StickyBanner } from './StickyBanner';

interface ExerciseCardProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  previousSummary?: string;
  bannerMessage?: string;
  bannerType?: BannerType;
  onSetUpdated: (setIndex: number, weight: number, reps: number, completed: boolean) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onCalculateOverload: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  sets,
  previousSummary,
  bannerMessage,
  bannerType = BannerType.INFO,
  onSetUpdated,
  onAddSet,
  onRemoveSet,
  onCalculateOverload,
}) => {
  return (
    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden mb-4 shadow-lg transition-all">
      {/* Exercise Header */}
      <div className="p-3.5 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            {exercise.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {exercise.category}
            </span>
            <span className="text-xs text-zinc-400">
              +{exercise.baseIncrement} lbs / step • max {exercise.maxWeightCapacity} lbs
            </span>
          </div>
        </div>

        <button
          onClick={onAddSet}
          className="p-1.5 rounded-lg bg-[#2C2C2E] text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
          title="Add Set"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="h-px bg-[#2C2C2E]" />

      {/* Table Header */}
      <div className="px-3.5 py-2 grid grid-cols-12 gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-center items-center">
        <span className="col-span-2 text-left pl-1">SET</span>
        <span className="col-span-3 text-left">PREVIOUS</span>
        <span className="col-span-3">LBS</span>
        <span className="col-span-2">REPS</span>
        <span className="col-span-2 text-right pr-1">DONE</span>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-[#2C2C2E]/60">
        {sets.map((set, index) => {
          const isDone = set.isCompleted;

          return (
            <div
              key={set.id || index}
              className={`px-3.5 py-2 grid grid-cols-12 gap-2 items-center text-xs transition-colors ${
                isDone ? 'bg-emerald-500/5' : ''
              }`}
            >
              {/* SET Circular Badge */}
              <div className="col-span-2 flex items-center space-x-1">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    isDone
                      ? 'bg-emerald-500 text-black'
                      : 'bg-[#2C2C2E] text-zinc-300'
                  }`}
                >
                  {set.setNumber}
                </span>
                {sets.length > 1 && (
                  <button
                    onClick={() => onRemoveSet(index)}
                    className="text-zinc-400 hover:text-rose-400 transition-colors p-0.5"
                    title="Remove set"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* PREVIOUS Baseline */}
              <div className="col-span-3 text-zinc-400 text-[11px] font-medium truncate">
                {previousSummary || `${set.targetWeight} lbs × ${set.targetReps}`}
              </div>

              {/* LBS Editable Field */}
              <div className="col-span-3">
                <input
                  type="number"
                  step="0.5"
                  value={set.actualWeight || set.targetWeight}
                  onChange={(e) =>
                    onSetUpdated(
                      index,
                      parseFloat(e.target.value) || 0,
                      set.actualReps || set.targetReps,
                      set.isCompleted
                    )
                  }
                  className="w-full bg-[#0D0D0D] border border-[#2C2C2E] rounded-md px-1.5 py-1 text-center font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* REPS Editable Field */}
              <div className="col-span-2">
                <input
                  type="number"
                  value={set.actualReps || set.targetReps}
                  onChange={(e) =>
                    onSetUpdated(
                      index,
                      set.actualWeight || set.targetWeight,
                      parseInt(e.target.value, 10) || 0,
                      set.isCompleted
                    )
                  }
                  className="w-full bg-[#0D0D0D] border border-[#2C2C2E] rounded-md px-1.5 py-1 text-center font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Checkmark Completion Button */}
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() =>
                    onSetUpdated(
                      index,
                      set.actualWeight || set.targetWeight,
                      set.actualReps || set.targetReps,
                      !isDone
                    )
                  }
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'bg-[#2C2C2E] text-zinc-400 hover:text-white'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evaluate Overload Action Button */}
      <div className="p-3 pt-2">
        <button
          onClick={onCalculateOverload}
          className="w-full py-2 px-3 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Evaluate Overload Engine</span>
        </button>
      </div>

      {/* Sticky Banner */}
      {bannerMessage && (
        <StickyBanner message={bannerMessage} type={bannerType} />
      )}
    </div>
  );
};
