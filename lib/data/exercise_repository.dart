import 'dart:convert';
import 'package:flutter/services.dart';
import '../domain/exercise.dart';

class ExerciseRepository {
  List<Exercise> _cachedExercises = [];

  Future<List<Exercise>> loadExercises() async {
    if (_cachedExercises.isNotEmpty) return _cachedExercises;

    try {
      final jsonString = await rootBundle.loadString('assets/data/exercises.json');
      final List<dynamic> jsonList = json.decode(jsonString) as List<dynamic>;

      _cachedExercises = jsonList
          .map((item) => Exercise.fromJson(item as Map<String, dynamic>))
          .toList();

      return _cachedExercises;
    } catch (e) {
      // Fallback default exercises if asset bundle is unavailable
      _cachedExercises = [
        Exercise(
          id: 'bench_press',
          name: 'Barbell Bench Press',
          category: ExerciseCategory.COMPOUND,
          baseIncrement: 5.0,
          maxWeightCapacity: 500.0,
          sets: 4,
          targetReps: 8,
          mechanic: 'Compound',
          equipment: 'Barbell',
        ),
        Exercise(
          id: 'overhead_press',
          name: 'Barbell Overhead Press',
          category: ExerciseCategory.COMPOUND,
          baseIncrement: 2.5,
          maxWeightCapacity: 300.0,
          sets: 3,
          targetReps: 8,
          mechanic: 'Compound',
          equipment: 'Barbell',
        ),
        Exercise(
          id: 'bicep_curl',
          name: 'Dumbbell Bicep Curl',
          category: ExerciseCategory.ISOLATION,
          baseIncrement: 2.5,
          maxWeightCapacity: 120.0,
          sets: 3,
          targetReps: 12,
          mechanic: 'Isolation',
          equipment: 'Dumbbell',
        ),
      ];
      return _cachedExercises;
    }
  }

  Exercise? findById(String id) {
    try {
      return _cachedExercises.firstWhere((e) => e.id == id);
    } catch (_) {
      return null;
    }
  }
}
