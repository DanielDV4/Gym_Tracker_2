import 'package:flutter/material.dart';

class AppTheme {
  static const Color backgroundColor = Color(0xFF0D0D0D);
  static const Color cardColor = Color(0xFF1C1C1E);
  static const Color cardBorderColor = Color(0xFF2C2C2E);
  static const Color primaryAccent = Color(0xFF00E676);
  static const Color successGreen = Color(0xFF00E676);
  static const Color warningRed = Color(0xFFFF453A);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF8E8E93);
  static const Color textMuted = Color(0xFF636366);

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: backgroundColor,
      cardColor: cardColor,
      colorScheme: const ColorScheme.dark(
        surface: backgroundColor,
        primary: primaryAccent,
        secondary: successGreen,
        error: warningRed,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: backgroundColor,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: cardColor,
        selectedItemColor: primaryAccent,
        unselectedItemColor: textSecondary,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
