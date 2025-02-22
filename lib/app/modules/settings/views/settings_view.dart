import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

final settingsProvider =
    StateNotifierProvider<SettingsNotifier, SettingsState>((ref) {
  return SettingsNotifier();
});

class SettingsState {
  final bool isDarkMode;
  final bool isNotificationsEnabled;
  final bool isLocationEnabled;

  SettingsState({
    this.isDarkMode = false,
    this.isNotificationsEnabled = true,
    this.isLocationEnabled = true,
  });

  SettingsState copyWith({
    bool? isDarkMode,
    bool? isNotificationsEnabled,
    bool? isLocationEnabled,
  }) {
    return SettingsState(
      isDarkMode: isDarkMode ?? this.isDarkMode,
      isNotificationsEnabled:
          isNotificationsEnabled ?? this.isNotificationsEnabled,
      isLocationEnabled: isLocationEnabled ?? this.isLocationEnabled,
    );
  }
}

class SettingsNotifier extends StateNotifier<SettingsState> {
  SettingsNotifier() : super(SettingsState());

  void toggleDarkMode() {
    state = state.copyWith(isDarkMode: !state.isDarkMode);
  }

  void toggleNotifications() {
    state =
        state.copyWith(isNotificationsEnabled: !state.isNotificationsEnabled);
  }

  void toggleLocation() {
    state = state.copyWith(isLocationEnabled: !state.isLocationEnabled);
  }
}

class SettingsView extends ConsumerWidget {
  const SettingsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(settingsProvider);
    final controller = ref.read(settingsProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          SwitchListTile(
            title: const Text('Dark Mode'),
            subtitle: const Text('Enable dark theme'),
            value: state.isDarkMode,
            onChanged: (_) => controller.toggleDarkMode(),
          ),
          SwitchListTile(
            title: const Text('Notifications'),
            subtitle: const Text('Enable price alerts'),
            value: state.isNotificationsEnabled,
            onChanged: (_) => controller.toggleNotifications(),
          ),
          SwitchListTile(
            title: const Text('Location Services'),
            subtitle: const Text('Enable location access'),
            value: state.isLocationEnabled,
            onChanged: (_) => controller.toggleLocation(),
          ),
          const Divider(),
          ListTile(
            title: const Text('Privacy Policy'),
            leading: const Icon(Icons.privacy_tip),
            onTap: () => _launchURL('https://example.com/privacy'),
          ),
          ListTile(
            title: const Text('Terms of Service'),
            leading: const Icon(Icons.description),
            onTap: () => _launchURL('https://example.com/terms'),
          ),
          ListTile(
            title: const Text('About'),
            leading: const Icon(Icons.info),
            onTap: () => showAboutDialog(
              context: context,
              applicationName: 'Price Pilot',
              applicationVersion: '1.0.0',
              applicationLegalese: '© 2024 Price Pilot',
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _launchURL(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }
}
