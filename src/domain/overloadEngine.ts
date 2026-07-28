import { Exercise, WorkoutSession, WorkoutSet, EngineResult, BannerType } from '../types';

export class ArgumentError extends Error {
  constructor(message: string) {
    super(`ArgumentError (OCL Invariant Violation): ${message}`);
    this.name = 'ArgumentError';
  }
}

export class StateError extends Error {
  constructor(message: string) {
    super(`StateError (Pre-condition Failure): ${message}`);
    this.name = 'StateError';
  }
}

export function validateExerciseOCL(exercise: Exercise): void {
  if (exercise.sets <= 0) {
    throw new ArgumentError(`sets must be > 0 (got ${exercise.sets})`);
  }
  if (exercise.baseIncrement <= 0) {
    throw new ArgumentError(`baseIncrement must be > 0 (got ${exercise.baseIncrement})`);
  }
  if (exercise.maxWeightCapacity <= 0) {
    throw new ArgumentError(`maxWeightCapacity must be > 0 (got ${exercise.maxWeightCapacity})`);
  }
  if (exercise.baseIncrement > exercise.maxWeightCapacity) {
    throw new ArgumentError(
      `baseIncrement (${exercise.baseIncrement}) cannot exceed maxWeightCapacity (${exercise.maxWeightCapacity})`
    );
  }
}

export function validateWorkoutSetOCL(set: WorkoutSet): void {
  if (set.setNumber <= 0) {
    throw new ArgumentError(`setNumber must be > 0 (got ${set.setNumber})`);
  }
  if (set.targetWeight <= 0) {
    throw new ArgumentError(`targetWeight must be > 0 (got ${set.targetWeight})`);
  }
  if (set.targetReps <= 0) {
    throw new ArgumentError(`targetReps must be > 0 (got ${set.targetReps})`);
  }
  if (set.actualWeight < 0) {
    throw new ArgumentError(`actualWeight must be >= 0 (got ${set.actualWeight})`);
  }
  if (set.actualReps < 0) {
    throw new ArgumentError(`actualReps must be >= 0 (got ${set.actualReps})`);
  }
}

export class OverloadEngine {
  constructor(private exercise: Exercise) {
    validateExerciseOCL(exercise);
  }

  public computeNextTarget(
    current: WorkoutSession,
    historyForExercise: WorkoutSession[] = []
  ): EngineResult {
    // 1. Validate Pre-conditions
    if (!current.sets || current.sets.length === 0) {
      throw new StateError('Workout session contains no sets.');
    }

    for (const set of current.sets) {
      validateWorkoutSetOCL(set);
      if (!set.isCompleted) {
        throw new StateError(`Set #${set.setNumber} is incomplete. Check off all sets before evaluating.`);
      }
    }

    // 2. Anti-contamination rule: verify historical sessions match exercise ID
    for (const h of historyForExercise) {
      if (h.exerciseId !== this.exercise.id) {
        throw new ArgumentError(
          `Historical session ${h.id} belongs to exercise ${h.exerciseId}, not ${this.exercise.id}`
        );
      }
    }

    // Determine current target weight & reps
    const currentTargetWeight = current.sets[0].actualWeight > 0 ? current.sets[0].actualWeight : current.sets[0].targetWeight;
    const currentTargetReps = current.sets[0].targetReps;

    // Check if current session passed target reps across ALL sets
    const currentPassed = current.sets.every((s) => s.actualReps >= s.targetReps);

    if (currentPassed) {
      const nextTargetWeight = Math.min(
        currentTargetWeight + this.exercise.baseIncrement,
        this.exercise.maxWeightCapacity
      );

      const isCapReached = nextTargetWeight === this.exercise.maxWeightCapacity && currentTargetWeight < this.exercise.maxWeightCapacity;

      return {
        nextTargetWeight,
        nextTargetReps: currentTargetReps,
        isProgression: true,
        isDeload: false,
        message: isCapReached
          ? `Max Capacity Reached! Target set to ${nextTargetWeight} lbs (capped at max ${this.exercise.maxWeightCapacity} lbs).`
          : `Progressive Overload Achieved! Next Target: ${nextTargetWeight} lbs × ${currentTargetReps} reps (+${this.exercise.baseIncrement} lbs).`,
        bannerType: BannerType.SUCCESS,
      };
    }

    // Check 3-Strike Deload Penalty across 3 consecutive sessions
    const allSessions = [...historyForExercise, current].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const recentSessions = allSessions.length >= 3 ? allSessions.slice(-3) : allSessions;

    const isThreeStrikeDeload =
      recentSessions.length === 3 &&
      recentSessions.every((session) =>
        session.sets.some((s) => s.actualReps < s.targetReps)
      );

    if (isThreeStrikeDeload) {
      let rawDeload = currentTargetWeight * 0.9;
      // Round to nearest 0.5 lbs for practical gym weight plates
      const nextTargetWeight = Math.round(rawDeload * 2) / 2;

      return {
        nextTargetWeight,
        nextTargetReps: currentTargetReps,
        isProgression: false,
        isDeload: true,
        message: `3-Strike Deload Penalty Triggered! Target reduced by 10% to ${nextTargetWeight} lbs. Focus on form and recovery.`,
        bannerType: BannerType.ERROR,
      };
    }

    const failedCount = recentSessions.filter((s) =>
      s.sets.some((set) => set.actualReps < set.targetReps)
    ).length;

    return {
      nextTargetWeight: currentTargetWeight,
      nextTargetReps: currentTargetReps,
      isProgression: false,
      isDeload: false,
      message: `Target Maintained at ${currentTargetWeight} lbs. (Strike ${failedCount}/3 before automatic deload penalty).`,
      bannerType: BannerType.INFO,
    };
  }
}
