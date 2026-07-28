import React, { useState } from 'react';
import { Exercise, WorkoutSet, WorkoutSession, BannerType } from '../types';
import { OverloadEngine, ArgumentError, StateError } from '../domain/overloadEngine';
import { ExerciseCard } from './ExerciseCard';
import { Plus, Dumbbell, AlertCircle } from 'lucide-react';

interface WorkoutLoggerProps {
  allExercises: Exercise[];
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ allExercises }) => {
  const [activeExercises, setActiveExercises] = useState<Exercise[]>([
    allExercises[0] || {
      id: 'bench_press',
      name: 'Barbell Bench Press',
      category: 'COMPOUND',
      baseIncrement: 5.0,
      maxWeightCapacity: 500.0,
      sets: 4,
      targetReps: 8,
    },
  ]);

  const [sessionSets, setSessionSets] = useState<Record<string, WorkoutSet[]>>(() => {
    const initialEx = allExercises[0] || {
      id: 'bench_press',
      name: 'Barbell Bench Press',
      category: 'COMPOUND',
      baseIncrement: 5.0,
      maxWeightCapacity: 500.0,
      sets: 4,
      targetReps: 8,
    };

    return {
      [initialEx.id]: Array.from({ length: initialEx.sets }).map((_, i) => ({
        id: `set_${initialEx.id}_${i + 1}`,
        setNumber: i + 1,
        targetWeight: 135.0,
        targetReps: initialEx.targetReps,
        actualWeight: 135.0,
        actualReps: initialEx.targetReps,
        isCompleted: false,
      })),
    };
  });

  const [bannerMessages, setBannerMessages] = useState<Record<string, string>>({
    [allExercises[0]?.id || 'bench_press']:
      'Log completed sets and tap Evaluate Overload Engine to calculate next targets.',
  });

  const [bannerTypes, setBannerTypes] = useState<Record<string, BannerType>>({
    [allExercises[0]?.id || 'bench_press']: BannerType.INFO,
  });

  const [exerciseHistory, setExerciseHistory] = useState<Record<string, WorkoutSession[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddExercise = (exercise: Exercise) => {
    if (activeExercises.some((e) => e.id === exercise.id)) {
      setIsModalOpen(false);
      return;
    }

    const initialWeight = 135.0;
    const newSets: WorkoutSet[] = Array.from({ length: exercise.sets }).map((_, i) => ({
      id: `set_${exercise.id}_${i + 1}`,
      setNumber: i + 1,
      targetWeight: initialWeight,
      targetReps: exercise.targetReps,
      actualWeight: initialWeight,
      actualReps: exercise.targetReps,
      isCompleted: false,
    }));

    setActiveExercises([...activeExercises, exercise]);
    setSessionSets({ ...sessionSets, [exercise.id]: newSets });
    setBannerMessages({
      ...bannerMessages,
      [exercise.id]: 'Ready to log sets. Tap checkmark when done.',
    });
    setBannerTypes({ ...bannerTypes, [exercise.id]: BannerType.INFO });
    setIsModalOpen(false);
  };

  const handleUpdateSet = (
    exerciseId: string,
    setIndex: number,
    weight: number,
    reps: number,
    completed: boolean
  ) => {
    try {
      const currentSets = [...(sessionSets[exerciseId] || [])];
      if (setIndex < 0 || setIndex >= currentSets.length) return;

      currentSets[setIndex] = {
        ...currentSets[setIndex],
        actualWeight: weight,
        actualReps: reps,
        isCompleted: completed,
      };

      setSessionSets({ ...sessionSets, [exerciseId]: currentSets });

      // If all completed, auto evaluate
      if (currentSets.every((s) => s.isCompleted)) {
        evaluateOverload(exerciseId, currentSets);
      }
    } catch (err: any) {
      setBannerMessages({ ...bannerMessages, [exerciseId]: err.message });
      setBannerTypes({ ...bannerTypes, [exerciseId]: BannerType.ERROR });
    }
  };

  const evaluateOverload = (exerciseId: string, setsToEval?: WorkoutSet[]) => {
    const exercise = allExercises.find((e) => e.id === exerciseId) || activeExercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const sets = setsToEval || sessionSets[exerciseId] || [];
    const history = exerciseHistory[exerciseId] || [];

    try {
      const currentSession: WorkoutSession = {
        id: `session_${Date.now()}`,
        exerciseId: exercise.id,
        date: new Date().toISOString(),
        sets,
      };

      const engine = new OverloadEngine(exercise);
      const result = engine.computeNextTarget(currentSession, history);

      setBannerMessages({ ...bannerMessages, [exerciseId]: result.message });
      setBannerTypes({ ...bannerTypes, [exerciseId]: result.bannerType });

      // Save to history on success evaluation
      if (result.bannerType === BannerType.SUCCESS || result.bannerType === BannerType.ERROR || result.bannerType === BannerType.INFO) {
        setExerciseHistory({
          ...exerciseHistory,
          [exerciseId]: [...history, currentSession],
        });
      }
    } catch (err: any) {
      setBannerMessages({ ...bannerMessages, [exerciseId]: err.message });
      setBannerTypes({ ...bannerTypes, [exerciseId]: BannerType.ERROR });
    }
  };

  const handleAddSetRow = (exerciseId: string) => {
    const sets = sessionSets[exerciseId] || [];
    const newSetNumber = sets.length + 1;
    const lastSet = sets[sets.length - 1];

    const newSet: WorkoutSet = {
      id: `set_${exerciseId}_${newSetNumber}`,
      setNumber: newSetNumber,
      targetWeight: lastSet?.targetWeight || 135.0,
      targetReps: lastSet?.targetReps || 8,
      actualWeight: lastSet?.actualWeight || 135.0,
      actualReps: lastSet?.actualReps || 8,
      isCompleted: false,
    };

    setSessionSets({ ...sessionSets, [exerciseId]: [...sets, newSet] });
  };

  const handleRemoveSetRow = (exerciseId: string, setIndex: number) => {
    const sets = sessionSets[exerciseId] || [];
    if (sets.length <= 1) return;
    const updated = sets.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, setNumber: i + 1 }));
    setSessionSets({ ...sessionSets, [exerciseId]: updated });
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
          <Dumbbell className="w-5 h-5 text-[#00E676]" />
          <span>Workout Logger</span>
        </h2>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00C853] text-black font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-[#00E676]/20 transition-all transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* Active Exercises List */}
      {activeExercises.length === 0 ? (
        <div className="text-center py-12 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-6">
          <Dumbbell className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No exercises in active session.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg"
          >
            Select Exercise
          </button>
        </div>
      ) : (
        activeExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            sets={sessionSets[exercise.id] || []}
            bannerMessage={bannerMessages[exercise.id]}
            bannerType={bannerTypes[exercise.id]}
            onSetUpdated={(sIdx, w, r, c) =>
              handleUpdateSet(exercise.id, sIdx, w, r, c)
            }
            onAddSet={() => handleAddSetRow(exercise.id)}
            onRemoveSet={(sIdx) => handleRemoveSetRow(exercise.id, sIdx)}
            onCalculateOverload={() => evaluateOverload(exercise.id)}
          />
        ))
      )}

      {/* Select Exercise Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#2C2C2E] flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Select Exercise</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white font-bold text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-2 overflow-y-auto divide-y divide-[#2C2C2E]/60">
              {allExercises.map((ex) => {
                const isAdded = activeExercises.some((a) => a.id === ex.id);

                return (
                  <button
                    key={ex.id}
                    disabled={isAdded}
                    onClick={() => handleAddExercise(ex)}
                    className={`w-full p-3 text-left flex items-center justify-between transition-colors rounded-lg ${
                      isAdded
                        ? 'opacity-50 cursor-not-allowed bg-zinc-900/40'
                        : 'hover:bg-[#2C2C2E]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{ex.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {ex.category} • +{ex.baseIncrement} lbs / step • max {ex.maxWeightCapacity} lbs
                      </div>
                    </div>
                    {isAdded ? (
                      <span className="text-xs font-bold text-emerald-400">Added</span>
                    ) : (
                      <Plus className="w-4 h-4 text-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
