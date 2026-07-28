import 'workout_set.dart';

class WorkoutSession {
  final String id;
  final String exerciseId;
  final DateTime date;
  final List<WorkoutSet> sets;
  final WorkoutSession? previousSession;

  WorkoutSession({
    required this.id,
    required this.exerciseId,
    required this.date,
    required this.sets,
    this.previousSession,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'exerciseId': exerciseId,
      'date': date.toIso8601String(),
      'sets': sets.map((s) => s.toJson()).toList(),
    };
  }

  factory WorkoutSession.fromJson(
    Map<String, dynamic> json, {
    WorkoutSession? previousSession,
  }) {
    final setsList = (json['sets'] as List)
        .map((s) => WorkoutSet.fromJson(s as Map<String, dynamic>))
        .toList();

    return WorkoutSession(
      id: json['id'] as String,
      exerciseId: json['exerciseId'] as String,
      date: DateTime.parse(json['date'] as String),
      sets: setsList,
      previousSession: previousSession,
    );
  }
}
