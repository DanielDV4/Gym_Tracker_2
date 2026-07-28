enum ExerciseCategory {
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
  final String? mechanic;
  final String? equipment;

  Exercise({
    required this.id,
    required this.name,
    required this.category,
    required this.baseIncrement,
    required this.maxWeightCapacity,
    required this.sets,
    this.targetReps = 8,
    this.mechanic,
    this.equipment,
  }) {
    // -- OCL Invariants Enforcement --
    if (sets <= 0) {
      throw ArgumentError('OCL Invariant Violation: sets must be > 0 (got $sets)');
    }
    if (baseIncrement <= 0) {
      throw ArgumentError('OCL Invariant Violation: baseIncrement must be > 0 (got $baseIncrement)');
    }
    if (maxWeightCapacity <= 0) {
      throw ArgumentError('OCL Invariant Violation: maxWeightCapacity must be > 0 (got $maxWeightCapacity)');
    }
    if (baseIncrement > maxWeightCapacity) {
      throw ArgumentError('OCL Invariant Violation: baseIncrement ($baseIncrement) cannot exceed maxWeightCapacity ($maxWeightCapacity)');
    }
  }

  factory Exercise.fromJson(Map<String, dynamic> json) {
    ExerciseCategory cat;
    final catStr = (json['category'] as String?)?.toUpperCase() ?? 'COMPOUND';
    switch (catStr) {
      case 'ISOLATION':
        cat = ExerciseCategory.ISOLATION;
        break;
      case 'BODYWEIGHT':
        cat = ExerciseCategory.BODYWEIGHT;
        break;
      case 'COMPOUND':
      default:
        cat = ExerciseCategory.COMPOUND;
        break;
    }

    return Exercise(
      id: json['id'] as String,
      name: json['name'] as String,
      category: cat,
      baseIncrement: (json['baseIncrement'] as num).toDouble(),
      maxWeightCapacity: (json['maxWeightCapacity'] as num).toDouble(),
      sets: (json['sets'] as num).toInt(),
      targetReps: (json['targetReps'] as num?)?.toInt() ?? 8,
      mechanic: json['mechanic'] as String?,
      equipment: json['equipment'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category.name,
      'baseIncrement': baseIncrement,
      'maxWeightCapacity': maxWeightCapacity,
      'sets': sets,
      'targetReps': targetReps,
      'mechanic': mechanic,
      'equipment': equipment,
    };
  }
}
