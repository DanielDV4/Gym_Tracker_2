import React, { useState } from 'react';
import { FileCode2, Copy, Check, ChevronRight } from 'lucide-react';

const DART_FILES: Record<string, { path: string; code: string; language: string }> = {
  'overload_engine.dart': {
    path: 'lib/domain/overload_engine.dart',
    language: 'dart',
    code: `import 'dart:math';
import 'exercise.dart';
import 'workout_session.dart';
import 'workout_set.dart';

class OverloadEngine {
  final Exercise exercise;

  OverloadEngine({required this.exercise});

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
          'Pre-condition Failure: Actual weight and reps cannot be negative.',
        );
      }
      if (!set.isCompleted) {
        throw StateError('Pre-condition Failure: Set #\${set.setNumber} is incomplete.');
      }
    }

    // Anti-contamination verification
    for (final h in historyForExercise) {
      if (h.exerciseId != exercise.id) {
        throw ArgumentError(
          'State Isolation Violation: Historical session \${h.id} belongs to exercise \${h.exerciseId}, not \${exercise.id}.',
        );
      }
    }

    final currentPassed = current.sets.every((s) => s.actualReps >= s.targetReps);
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
      // Rule 2: Check 3-strike deload penalty rule
      final allSessions = [...historyForExercise, current]..sort((a, b) => a.date.compareTo(b.date));
      final recentSessions = allSessions.length >= 3
          ? allSessions.sublist(allSessions.length - 3)
          : allSessions;

      final isThreeStrikeDeload = recentSessions.length == 3 &&
          recentSessions.every(
            (session) => session.sets.any((s) => s.actualReps < s.targetReps),
          );

      if (isThreeStrikeDeload) {
        nextTargetWeight = currentTargetWeight * 0.9;
        nextTargetWeight = (nextTargetWeight * 2).roundToDouble() / 2;
      } else {
        nextTargetWeight = currentTargetWeight;
      }
    }

    return WorkoutSet(
      id: 'next_\${DateTime.now().millisecondsSinceEpoch}',
      setNumber: 1,
      targetWeight: nextTargetWeight,
      targetReps: currentTargetReps,
      actualWeight: 0.0,
      actualReps: 0,
      isCompleted: false,
    );
  }
}`,
  },
  'exercise.dart': {
    path: 'lib/domain/exercise.dart',
    language: 'dart',
    code: `enum ExerciseCategory {
  COMPOUND,
  ISOLATION,
  BODYWEIGHT,
}

class Exercise {
  final String id;
  final String name;
  final ExerciseCategory category;
  final double baseIncrement;
  final double maxWeightCapacity;
  final int sets;
  final int targetReps;

  Exercise({
    required this.id,
    required this.name,
    required this.category,
    required this.baseIncrement,
    required this.maxWeightCapacity,
    required this.sets,
    this.targetReps = 8,
  }) {
    // -- OCL Invariants Enforcement --
    if (sets <= 0) {
      throw ArgumentError('OCL Invariant Violation: sets must be > 0 (got \$sets)');
    }
    if (baseIncrement <= 0) {
      throw ArgumentError('OCL Invariant Violation: baseIncrement must be > 0 (got \$baseIncrement)');
    }
    if (maxWeightCapacity <= 0) {
      throw ArgumentError('OCL Invariant Violation: maxWeightCapacity must be > 0 (got \$maxWeightCapacity)');
    }
    if (baseIncrement > maxWeightCapacity) {
      throw ArgumentError('OCL Invariant Violation: baseIncrement cannot exceed maxWeightCapacity');
    }
  }
}`,
  },
  'workout_set.dart': {
    path: 'lib/domain/workout_set.dart',
    language: 'dart',
    code: `class WorkoutSet {
  final String id;
  final int setNumber;
  final double targetWeight;
  final int targetReps;
  final double actualWeight;
  final int actualReps;
  final bool isCompleted;

  WorkoutSet({
    required this.id,
    required this.setNumber,
    required this.targetWeight,
    required this.targetReps,
    required this.actualWeight,
    required this.actualReps,
    this.isCompleted = false,
  }) {
    // -- OCL Invariants Enforcement --
    if (setNumber <= 0) {
      throw ArgumentError('OCL Invariant Violation: setNumber must be > 0');
    }
    if (targetWeight <= 0) {
      throw ArgumentError('OCL Invariant Violation: targetWeight must be > 0');
    }
    if (targetReps <= 0) {
      throw ArgumentError('OCL Invariant Violation: targetReps must be > 0');
    }
    if (actualWeight < 0) {
      throw ArgumentError('OCL Invariant Violation: actualWeight must be >= 0');
    }
    if (actualReps < 0) {
      throw ArgumentError('OCL Invariant Violation: actualReps must be >= 0');
    }
  }
}`,
  },
  'exercise_card.dart': {
    path: 'lib/ui/widgets/exercise_card.dart',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import '../../domain/exercise.dart';
import '../../domain/workout_set.dart';
import '../theme/app_theme.dart';
import 'sticky_banner.dart';

class ExerciseCard extends StatelessWidget {
  final Exercise exercise;
  final List<WorkoutSet> sets;
  final String? bannerMessage;
  final BannerType bannerType;
  final Function(int setIndex, double weight, int reps, bool completed) onSetUpdated;

  const ExerciseCard({
    super.key,
    required this.exercise,
    required this.sets,
    this.bannerMessage,
    this.bannerType = BannerType.info,
    required this.onSetUpdated,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.cardBorderColor),
      ),
      child: Column(
        children: [
          // Header & Table Rows...
          if (bannerMessage != null)
            StickyBanner(message: bannerMessage!, type: bannerType),
        ],
      ),
    );
  }
}`,
  },
  'pubspec.yaml': {
    path: 'pubspec.yaml',
    language: 'yaml',
    code: `name: po_tracker
description: "Cross-platform Progressive Overload mobile fitness tracking application."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: ^3.5.0
  flutter: ">=3.27.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8

flutter:
  uses-material-design: true
  assets:
    - assets/data/exercises.json`,
  },
};

export const DartCodeInspector: React.FC = () => {
  const [selectedFileKey, setSelectedFileKey] = useState<string>('overload_engine.dart');
  const [copied, setCopied] = useState(false);

  const selectedFile = DART_FILES[selectedFileKey];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-blue-400" />
          <span>Flutter & Dart Code Inspector</span>
        </h2>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg bg-[#2C2C2E] hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy File'}</span>
        </button>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
        {Object.keys(DART_FILES).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedFileKey(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium shrink-0 transition-all ${
              selectedFileKey === key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#1C1C1E] text-zinc-400 hover:text-white border border-[#2C2C2E]'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Code Viewer Box */}
      <div className="bg-[#0D0D0D] border border-[#2C2C2E] rounded-xl overflow-hidden">
        <div className="bg-[#1C1C1E] px-4 py-2 border-b border-[#2C2C2E] flex items-center justify-between text-xs text-zinc-400 font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-semibold text-zinc-300">{selectedFile.path}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-blue-400">{selectedFile.language}</span>
        </div>

        <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-200 leading-relaxed selection:bg-blue-600/40">
          <code>{selectedFile.code}</code>
        </pre>
      </div>
    </div>
  );
};
