import 'package:flutter/material.dart';
import '../../data/exercise_repository.dart';
import '../../domain/exercise.dart';
import '../../domain/overload_engine.dart';
import '../../domain/workout_session.dart';
import '../../domain/workout_set.dart';
import '../theme/app_theme.dart';
import '../widgets/exercise_card.dart';
import '../widgets/sticky_banner.dart';

class WorkoutLoggerScreen extends StatefulWidget {
  final ExerciseRepository repository;

  const WorkoutLoggerScreen({super.key, required this.repository});

  @override
  State<WorkoutLoggerScreen> createState() => _WorkoutLoggerScreenState();
}

class _WorkoutLoggerScreenState extends State<WorkoutLoggerScreen> {
  List<Exercise> _allExercises = [];
  bool _isLoading = true;

  // Active exercises in current workout session
  List<Exercise> _activeExercises = [];
  Map<String, List<WorkoutSet>> _sessionSets = {}; // exerciseId -> sets
  Map<String, String> _bannerMessages = {}; // exerciseId -> message
  Map<String, BannerType> _bannerTypes = {}; // exerciseId -> bannerType
  Map<String, List<WorkoutSession>> _exerciseHistory = {}; // exerciseId -> past sessions

  @override
  void initState() {
    super.initState();
    _initData();
  }

  Future<void> _initData() async {
    final list = await widget.repository.loadExercises();
    setState(() {
      _allExercises = list;
      _isLoading = false;

      // Add default exercise (Bench Press) on launch
      if (list.isNotEmpty) {
        _addExerciseToSession(list.first);
      }
    });
  }

  void _addExerciseToSession(Exercise exercise) {
    if (_activeExercises.any((e) => e.id == exercise.id)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${exercise.name} is already in current session.')),
      );
      return;
    }

    // Default 135.0 lbs target or custom baseline
    final initialTargetWeight = 135.0;
    final defaultSets = List.generate(
      exercise.sets,
      (index) => WorkoutSet(
        id: 'set_${exercise.id}_${index + 1}',
        setNumber: index + 1,
        targetWeight: initialTargetWeight,
        targetReps: exercise.targetReps,
        actualWeight: initialTargetWeight,
        actualReps: exercise.targetReps,
        isCompleted: false,
      ),
    );

    setState(() {
      _activeExercises.add(exercise);
      _sessionSets[exercise.id] = defaultSets;
      _bannerMessages[exercise.id] = 'Ready to log sets. Tap checkmark when done.';
      _bannerTypes[exercise.id] = BannerType.info;
    });
  }

  void _updateSet(String exerciseId, int setIndex, double weight, int reps, bool completed) {
    try {
      final currentSets = _sessionSets[exerciseId] ?? [];
      if (setIndex < 0 || setIndex >= currentSets.length) return;

      // Ensure OCL invariants during creation
      final updatedSet = currentSets[setIndex].copyWith(
        actualWeight: weight,
        actualReps: reps,
        isCompleted: completed,
      );

      setState(() {
        currentSets[setIndex] = updatedSet;
        _sessionSets[exerciseId] = currentSets;
      });

      // Auto-evaluate when all sets are completed
      if (currentSets.every((s) => s.isCompleted)) {
        _evaluateOverload(exerciseId);
      }
    } catch (e) {
      setState(() {
        _bannerMessages[exerciseId] = 'OCL Error: ${e.toString()}';
        _bannerTypes[exerciseId] = BannerType.error;
      });
    }
  }

  void _evaluateOverload(String exerciseId) {
    final exercise = _allExercises.firstWhere((e) => e.id == exerciseId);
    final sets = _sessionSets[exerciseId] ?? [];
    final history = _exerciseHistory[exerciseId] ?? [];

    try {
      final session = WorkoutSession(
        id: 'session_${DateTime.now().millisecondsSinceEpoch}',
        exerciseId: exerciseId,
        date: DateTime.now(),
        sets: sets,
      );

      final engine = OverloadEngine(exercise: exercise);
      final nextTarget = engine.computeNextTarget(
        current: session,
        historyForExercise: history,
      );

      final isProgression = nextTarget.targetWeight > sets.first.targetWeight;
      final isDeload = nextTarget.targetWeight < sets.first.targetWeight;

      setState(() {
        if (isProgression) {
          _bannerMessages[exerciseId] =
              'Overload Achieved! Next Target: ${nextTarget.targetWeight} lbs × ${nextTarget.targetReps} reps (+${exercise.baseIncrement} lbs)';
          _bannerTypes[exerciseId] = BannerType.success;
        } else if (isDeload) {
          _bannerMessages[exerciseId] =
              '3-Strike Deload Penalty Applied! Next Target: ${nextTarget.targetWeight} lbs (10% deload)';
          _bannerTypes[exerciseId] = BannerType.error;
        } else {
          _bannerMessages[exerciseId] =
              'Target Maintained: ${nextTarget.targetWeight} lbs × ${nextTarget.targetReps} reps. Complete target reps across all sets to increment.';
          _bannerTypes[exerciseId] = BannerType.info;
        }
      });
    } on StateError catch (e) {
      setState(() {
        _bannerMessages[exerciseId] = e.message;
        _bannerTypes[exerciseId] = BannerType.error;
      });
    } on ArgumentError catch (e) {
      setState(() {
        _bannerMessages[exerciseId] = e.message;
        _bannerTypes[exerciseId] = BannerType.error;
      });
    } catch (e) {
      setState(() {
        _bannerMessages[exerciseId] = 'Engine Error: $e';
        _bannerTypes[exerciseId] = BannerType.error;
      });
    }
  }

  void _showAddExerciseDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select Exercise to Add',
                style: TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  itemCount: _allExercises.length,
                  itemBuilder: (context, index) {
                    final ex = _allExercises[index];
                    final isAdded = _activeExercises.any((a) => a.id == ex.id);

                    return ListTile(
                      title: Text(ex.name, style: const TextStyle(color: AppTheme.textPrimary)),
                      subtitle: Text(
                        '${ex.category.name} • +${ex.baseIncrement} lbs',
                        style: const TextStyle(color: AppTheme.textSecondary),
                      ),
                      trailing: isAdded
                          ? const Icon(Icons.check, color: AppTheme.successGreen)
                          : const Icon(Icons.add, color: AppTheme.primaryAccent),
                      onTap: () {
                        Navigator.pop(context);
                        if (!isAdded) {
                          _addExerciseToSession(ex);
                        }
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppTheme.primaryAccent)),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Workout Logger'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: AppTheme.primaryAccent),
            onPressed: _showAddExerciseDialog,
            tooltip: 'Add Exercise',
          ),
        ],
      ),
      body: _activeExercises.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.fitness_center_rounded, size: 48, color: AppTheme.textMuted),
                  const SizedBox(height: 12),
                  const Text('No exercises added to current session.', style: TextStyle(color: AppTheme.textSecondary)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _showAddExerciseDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Select Exercise'),
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryAccent),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _activeExercises.length,
              itemBuilder: (context, index) {
                final ex = _activeExercises[index];
                final sets = _sessionSets[ex.id] ?? [];

                return ExerciseCard(
                  exercise: ex,
                  sets: sets,
                  bannerMessage: _bannerMessages[ex.id],
                  bannerType: _bannerTypes[ex.id] ?? BannerType.info,
                  onSetUpdated: (sIdx, w, r, done) => _updateSet(ex.id, sIdx, w, r, done),
                  onAddSet: () {
                    final newSetNumber = sets.length + 1;
                    final lastSet = sets.isNotEmpty ? sets.last : null;
                    final newSet = WorkoutSet(
                      id: 'set_${ex.id}_$newSetNumber',
                      setNumber: newSetNumber,
                      targetWeight: lastSet?.targetWeight ?? 135.0,
                      targetReps: ex.targetReps,
                      actualWeight: lastSet?.actualWeight ?? 135.0,
                      actualReps: ex.targetReps,
                      isCompleted: false,
                    );
                    setState(() {
                      _sessionSets[ex.id] = [...sets, newSet];
                    });
                  },
                  onRemoveSet: (sIdx) {
                    if (sets.length <= 1) return;
                    setState(() {
                      final updated = [...sets]..removeAt(sIdx);
                      _sessionSets[ex.id] = updated;
                    });
                  },
                  onCalculateOverload: () => _evaluateOverload(ex.id),
                );
              },
            ),
    );
  }
}
