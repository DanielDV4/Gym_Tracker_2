import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

enum BannerType { success, error, info }

class StickyBanner extends StatelessWidget {
  final String message;
  final BannerType type;
  final VoidCallback? onDismiss;

  const StickyBanner({
    super.key,
    required this.message,
    required this.type,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color borderColor;
    Color textColor;
    IconData icon;

    switch (type) {
      case BannerType.success:
        bg = AppTheme.successGreen.withValues(alpha: 0.15);
        borderColor = AppTheme.successGreen.withValues(alpha: 0.4);
        textColor = AppTheme.successGreen;
        icon = Icons.trending_up;
        break;
      case BannerType.error:
        bg = AppTheme.warningRed.withValues(alpha: 0.15);
        borderColor = AppTheme.warningRed.withValues(alpha: 0.4);
        textColor = AppTheme.warningRed;
        icon = Icons.warning_amber_rounded;
        break;
      case BannerType.info:
      default:
        bg = AppTheme.primaryAccent.withValues(alpha: 0.15);
        borderColor = AppTheme.primaryAccent.withValues(alpha: 0.4);
        textColor = AppTheme.primaryAccent;
        icon = Icons.info_outline;
        break;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(12),
          bottomRight: Radius.circular(12),
        ),
        border: Border(
          top: BorderSide(color: borderColor, width: 1),
        ),
      ),
      child: Row(
        children: [
          Icon(icon, color: textColor, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: textColor,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          if (onDismiss != null)
            GestureDetector(
              onTap: onDismiss,
              child: Icon(Icons.close, color: textColor, size: 16),
            ),
        ],
      ),
    );
  }
}
