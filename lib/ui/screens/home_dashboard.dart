import 'package:flutter/material.dart';
import '../../domain/exercise.dart';
import '../theme/app_theme.dart';

class HomeDashboardScreen extends StatelessWidget {
  final List<Exercise> exercises;
  final Map<String, int> strikeCounts; // exerciseId -> consecutive failures count
  final Map<String, double> currentWeights; // exerciseId -> current weight
  final VoidCallback onStartWorkout;

  const HomeDashboardScreen({
    super.key,
    required this.exercises,
    required this.strikeCounts,
    required this.currentWeights,
    required this.onStartWorkout,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: const [
            Icon(Icons.bolt_rounded, color: AppTheme.primaryAccent, size: 24),
            SizedBox(width: 8),
            Text('PO Tracker', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 20)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.analytics_outlined, color: AppTheme.textSecondary),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quick Start Hero Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primaryAccent.withValues(alpha: 0.25),
                    AppTheme.cardColor,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primaryAccent.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Progressive Overload Engine',
                    style: TextStyle(
                      color: AppTheme.primaryAccent,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Auto-calculating your next weight targets with OCL mathematical constraints',
                    style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 14),
                  ElevatedButton.icon(
                    onPressed: onStartWorkout,
                    icon: const Icon(Icons.play_arrow_rounded, size: 20),
                    label: const Text('Start Workout Logger', style: TextStyle(fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryAccent,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Deload Strike Monitor
            const Text(
              'Deload Risk Monitor (3-Strike Rule)',
              style: TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: exercises.length,
              itemBuilder: (context, index) {
                final ex = exercises[index];
                final strikes = strikeCounts[ex.id] ?? 0;
                final weight = currentWeights[ex.id] ?? 135.0;

                Color badgeBg;
                Color badgeText;
                String statusLabel;

                if (strikes == 0) {
                  badgeBg = AppTheme.successGreen.withValues(alpha: 0.15);
                  badgeText = AppTheme.successGreen;
                  statusLabel = 'Optimal Progression';
                } else if (strikes == 1) {
                  badgeBg = Colors.orange.withValues(alpha: 0.15);
                  badgeText = Colors.orange;
                  statusLabel = 'Strike 1 / 3';
                } else if (strikes == 2) {
                  badgeBg = Colors.deepOrange.withValues(alpha: 0.15);
                  badgeText = Colors.deepOrange;
                  statusLabel = 'Strike 2 / 3 Warning';
                } else {
                  badgeBg = AppTheme.warningRed.withValues(alpha: 0.15);
                  badgeText = AppTheme.warningRed;
                  statusLabel = 'Strike 3: 10% Deload Triggered';
                }

                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.cardColor,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.cardBorderColor),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ex.name,
                            style: const TextStyle(
                              color: AppTheme.textPrimary,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Target: ${weight.toStringAsFixed(1)} lbs • Step: +${ex.baseIncrement} lbs',
                            style: const TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: badgeBg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          statusLabel,
                          style: TextStyle(
                            color: badgeText,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
