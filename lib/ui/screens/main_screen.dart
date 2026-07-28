import 'package:flutter/material.dart';
import '../../data/exercise_repository.dart';
import '../../domain/exercise.dart';
import '../theme/app_theme.dart';
import 'home_dashboard.dart';
import 'workout_logger.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  final ExerciseRepository _repository = ExerciseRepository();
  List<Exercise> _exercises = [];

  @override
  void initState() {
    super.initState();
    _loadExercises();
  }

  Future<void> _loadExercises() async {
    final list = await _repository.loadExercises();
    setState(() {
      _exercises = list;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeDashboardScreen(
        exercises: _exercises,
        strikeCounts: const {},
        currentWeights: const {
          'bench_press': 135.0,
          'overhead_press': 95.0,
          'barbell_squat': 225.0,
          'bicep_curl': 35.0,
          'pull_up': 25.0,
          'tricep_pushdown': 50.0,
        },
        onStartWorkout: () {
          setState(() {
            _currentIndex = 1;
          });
        },
      ),
      WorkoutLoggerScreen(repository: _repository),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_rounded),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.fitness_center_rounded),
            label: 'Workout',
          ),
        ],
      ),
    );
  }
}
