import 'dart:math';
import 'exercise.dart';
import 'workout_session.dart';
import 'workout_set.dart';

class OverloadEngine {
  final Exercise exercise;

  OverloadEngine({required this.exercise});

  /// Computes the next target set based on current and historical workout sessions.
  /// Throws [StateError] if pre-conditions are violated.
  /// Throws [ArgumentError] if OCL invariants are breached.
  WorkoutSet computeNextTarget({
    required WorkoutSession current,
    List<WorkoutSession> historyForExercise = const [],
  }) {
    // 1. Pre-condition checks
    if (current.sets.isEmpty) {
      throw StateError('Pre-condition Failure: Workout session contains no sets.');
    }

    for (final set in current.sets) {
      if (set.actualWeight < 0 || set.actualReps < 0) {
        throw StateError(
          'Pre-condition Failure: Actual weight (${set.actualWeight}) and reps (${set.actualReps}) cannot be negative.',
        );
      }
      if (!set.isCompleted) {
        throw StateError('Pre-condition Failure: Set #${set.setNumber} is incomplete.');
      }
    }

    // Anti-contamination verification: ensure all historical sessions match this exercise
    for (final h in historyForExercise) {
      if (h.exerciseId != exercise.id) {
        throw ArgumentError(
          'State Isolation Violation: Historical session ${h.id} belongs to exercise ${h.exerciseId}, not ${exercise.id}.',
        );
      }
    }

    // Determine if current session passed
    final currentPassed = current.sets.every((s) => s.actualReps >= s.targetReps);

    // Calculate current baseline target weight
    final currentTargetWeight = current.sets.first.targetWeight;
    final currentTargetReps = current.sets.first.targetReps;

    double nextTargetWeight;

    if (currentPassed) {
      // Rule 1: Success -> Increment weight up to max capacity
      nextTargetWeight = min(
        currentTargetWeight + exercise.baseIncrement,
        exercise.maxWeightCapacity,
      );
    } else {
      // Check 3-strike deload penalty rule across 3 consecutive sessions
      // Combine history with current session (sorted chronologically)
      final allSessions = [...historyForExercise, current]..sort((a, b) => a.date.compareTo(b.date));

      // Examine up to the last 3 sessions for this exercise
      final recentSessions = allSessions.length >= 3
          ? allSessions.sublist(allSessions.length - 3)
          : allSessions;

      final isThreeStrikeDeload = recentSessions.length == 3 &&
          recentSessions.every(
            (session) => session.sets.any((s) => s.actualReps < s.targetReps),
          );

      if (isThreeStrikeDeload) {
        // Rule 2: 3-Strike Deload -> Deload by 10%
        nextTargetWeight = currentTargetWeight * 0.9;
        // Round to nearest 0.5 or 2.5 lbs for practical gym use
        nextTargetWeight = (nextTargetWeight * 2).roundToDouble() / 2;
      } else {
        // Maintenance: keep same weight
        nextTargetWeight = currentTargetWeight;
      }
    }

    return WorkoutSet(
      id: 'next_${DateTime.now().millisecondsSinceEpoch}',
      setNumber: 1,
      targetWeight: nextTargetWeight,
      targetReps: currentTargetReps,
      actualWeight: 0.0,
      actualReps: 0,
      isCompleted: false,
    );
  }
}
