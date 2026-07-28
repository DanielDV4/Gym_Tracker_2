class WorkoutSet {
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
      throw ArgumentError('OCL Invariant Violation: setNumber must be > 0 (got $setNumber)');
    }
    if (targetWeight <= 0) {
      throw ArgumentError('OCL Invariant Violation: targetWeight must be > 0 (got $targetWeight)');
    }
    if (targetReps <= 0) {
      throw ArgumentError('OCL Invariant Violation: targetReps must be > 0 (got $targetReps)');
    }
    if (actualWeight < 0) {
      throw ArgumentError('OCL Invariant Violation: actualWeight must be >= 0 (got $actualWeight)');
    }
    if (actualReps < 0) {
      throw ArgumentError('OCL Invariant Violation: actualReps must be >= 0 (got $actualReps)');
    }
  }

  WorkoutSet copyWith({
    String? id,
    int? setNumber,
    double? targetWeight,
    int? targetReps,
    double? actualWeight,
    int? actualReps,
    bool? isCompleted,
  }) {
    return WorkoutSet(
      id: id ?? this.id,
      setNumber: setNumber ?? this.setNumber,
      targetWeight: targetWeight ?? this.targetWeight,
      targetReps: targetReps ?? this.targetReps,
      actualWeight: actualWeight ?? this.actualWeight,
      actualReps: actualReps ?? this.actualReps,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'setNumber': setNumber,
      'targetWeight': targetWeight,
      'targetReps': targetReps,
      'actualWeight': actualWeight,
      'actualReps': actualReps,
      'isCompleted': isCompleted,
    };
  }

  factory WorkoutSet.fromJson(Map<String, dynamic> json) {
    return WorkoutSet(
      id: json['id'] as String,
      setNumber: (json['setNumber'] as num).toInt(),
      targetWeight: (json['targetWeight'] as num).toDouble(),
      targetReps: (json['targetReps'] as num).toInt(),
      actualWeight: (json['actualWeight'] as num).toDouble(),
      actualReps: (json['actualReps'] as num).toInt(),
      isCompleted: json['isCompleted'] as bool? ?? false,
    );
  }
}
