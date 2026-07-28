import 'package:flutter/material.dart';
import '../../domain/exercise.dart';
import '../../domain/workout_set.dart';
import '../theme/app_theme.dart';
import 'sticky_banner.dart';

class ExerciseCard extends StatelessWidget {
  final Exercise exercise;
  final List<WorkoutSet> sets;
  final String? previousSummary;
  final String? bannerMessage;
  final BannerType bannerType;
  final Function(int setIndex, double weight, int reps, bool completed) onSetUpdated;
  final VoidCallback onAddSet;
  final Function(int setIndex) onRemoveSet;
  final VoidCallback onCalculateOverload;

  const ExerciseCard({
    super.key,
    required this.exercise,
    required this.sets,
    this.previousSummary,
    this.bannerMessage,
    this.bannerType = BannerType.info,
    required this.onSetUpdated,
    required this.onAddSet,
    required this.onRemoveSet,
    required this.onCalculateOverload,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.cardBorderColor, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Exercise Header
          Padding(
            padding: const EdgeInsets.all(14.0),
            child: Row(
              mainAxisAlignment: MainAlignment.between,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        exercise.name,
                        style: const TextStyle(
                          color: AppTheme.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryAccent.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              exercise.category.name,
                              style: const TextStyle(
                                color: AppTheme.primaryAccent,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '+${exercise.baseIncrement} lbs / step • max ${exercise.maxWeightCapacity} lbs',
                            style: const TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add, color: AppTheme.primaryAccent, size: 20),
                  onPressed: onAddSet,
                  tooltip: 'Add Set',
                ),
              ],
            ),
          ),

          const Divider(color: AppTheme.cardBorderColor, height: 1),

          // Table Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: Row(
              children: const [
                SizedBox(width: 32, child: Text('SET', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold))),
                Expanded(flex: 3, child: Text('PREVIOUS', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold))),
                Expanded(flex: 3, child: Text('LBS', textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold))),
                Expanded(flex: 3, child: Text('REPS', textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold))),
                SizedBox(width: 44, child: Text('DONE', textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold))),
              ],
            ),
          ),

          // Table Rows
          ...List.generate(sets.length, (index) {
            final setItem = sets[index];
            return _WorkoutSetRow(
              setIndex: index,
              setItem: setItem,
              previousSummary: previousSummary ?? '${setItem.targetWeight.toStringAsFixed(1)} lbs × ${setItem.targetReps}',
              onChanged: (w, r, done) => onSetUpdated(index, w, r, done),
              onDelete: () => onRemoveSet(index),
            );
          }),

          const SizedBox(height: 10),

          // Action Button: Evaluate Progressive Overload
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 4.0),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onCalculateOverload,
                icon: const Icon(Icons.auto_awesome, size: 16),
                label: const Text('Evaluate Overload Engine'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryAccent.withValues(alpha: 0.2),
                  foregroundColor: AppTheme.primaryAccent,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: AppTheme.primaryAccent.withValues(alpha: 0.4)),
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 8),

          // Sticky Banner Feedback at bottom of card
          if (bannerMessage != null && bannerMessage!.isNotEmpty)
            StickyBanner(
              message: bannerMessage!,
              type: bannerType,
            ),
        ],
      ),
    );
  }
}

class _WorkoutSetRow extends StatefulWidget {
  final int setIndex;
  final WorkoutSet setItem;
  final String previousSummary;
  final Function(double weight, int reps, bool done) onChanged;
  final VoidCallback onDelete;

  const _WorkoutSetRow({
    required this.setIndex,
    required this.setItem,
    required this.previousSummary,
    required this.onChanged,
    required this.onDelete,
  });

  @override
  State<_WorkoutSetRow> createState() => _WorkoutSetRowState();
}

class _WorkoutSetRowState extends State<_WorkoutSetRow> {
  late TextEditingController _weightController;
  late TextEditingController _repsController;

  @override
  void initState() {
    super.initState();
    _weightController = TextEditingController(
      text: widget.setItem.actualWeight > 0
          ? widget.setItem.actualWeight.toStringAsFixed(1)
          : widget.setItem.targetWeight.toStringAsFixed(1),
    );
    _repsController = TextEditingController(
      text: widget.setItem.actualReps > 0
          ? widget.setItem.actualReps.toString()
          : widget.setItem.targetReps.toString(),
    );
  }

  @override
  void didUpdateWidget(covariant _WorkoutSetRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.setItem.actualWeight != widget.setItem.actualWeight ||
        oldWidget.setItem.targetWeight != widget.setItem.targetWeight) {
      _weightController.text = widget.setItem.actualWeight > 0
          ? widget.setItem.actualWeight.toStringAsFixed(1)
          : widget.setItem.targetWeight.toStringAsFixed(1);
    }
    if (oldWidget.setItem.actualReps != widget.setItem.actualReps ||
        oldWidget.setItem.targetReps != widget.setItem.targetReps) {
      _repsController.text = widget.setItem.actualReps > 0
          ? widget.setItem.actualReps.toString()
          : widget.setItem.targetReps.toString();
    }
  }

  void _notifyChange(bool isDone) {
    final weight = double.tryParse(_weightController.text) ?? widget.setItem.targetWeight;
    final reps = int.tryParse(_repsController.text) ?? widget.setItem.targetReps;
    widget.onChanged(weight, reps, isDone);
  }

  @override
  Widget build(BuildContext context) {
    final isDone = widget.setItem.isCompleted;

    return Container(
      color: isDone ? AppTheme.successGreen.withValues(alpha: 0.05) : Colors.transparent,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      child: Row(
        children: [
          // SET badge
          SizedBox(
            width: 32,
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDone ? AppTheme.successGreen : AppTheme.cardBorderColor,
              ),
              child: Center(
                child: Text(
                  '${widget.setItem.setNumber}',
                  style: TextStyle(
                    color: isDone ? Colors.black : AppTheme.textPrimary,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),

          // PREVIOUS faint text
          Expanded(
            flex: 3,
            child: Text(
              widget.previousSummary,
              style: const TextStyle(
                color: AppTheme.textMuted,
                fontSize: 12,
              ),
            ),
          ),

          // LBS input
          Expanded(
            flex: 3,
            child: Container(
              height: 32,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              child: TextField(
                controller: _weightController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                decoration: InputDecoration(
                  contentPadding: EdgeInsets.zero,
                  filled: true,
                  fillColor: AppTheme.backgroundColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(6),
                    borderSide: const BorderSide(color: AppTheme.cardBorderColor),
                  ),
                ),
                onChanged: (_) => _notifyChange(isDone),
              ),
            ),
          ),

          // REPS input
          Expanded(
            flex: 3,
            child: Container(
              height: 32,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              child: TextField(
                controller: _repsController,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                decoration: InputDecoration(
                  contentPadding: EdgeInsets.zero,
                  filled: true,
                  fillColor: AppTheme.backgroundColor,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(6),
                    borderSide: const BorderSide(color: AppTheme.cardBorderColor),
                  ),
                ),
                onChanged: (_) => _notifyChange(isDone),
              ),
            ),
          ),

          // Checkmark button
          SizedBox(
            width: 44,
            child: IconButton(
              icon: Icon(
                isDone ? Icons.check_circle_rounded : Icons.check_circle_outline_rounded,
                color: isDone ? AppTheme.successGreen : AppTheme.textSecondary,
                size: 24,
              ),
              onPressed: () => _notifyChange(!isDone),
            ),
          ),
        ],
      ),
    );
  }
}
