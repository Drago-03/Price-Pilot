import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:price_pilot/app/modules/settings/controllers/settings_controller.dart';
import 'package:url_launcher/url_launcher.dart';

class SettingsView extends GetView<SettingsController> {
  const SettingsView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSection(
                'Preferences',
                [
                  _buildSwitchTile(
                    'Push Notifications',
                    'Get notified about price changes',
                    Icons.notifications,
                    controller.notificationsEnabled,
                    controller.toggleNotifications,
                  ),
                  _buildSwitchTile(
                    'Location Services',
                    'Allow access to your location',
                    Icons.location_on,
                    controller.locationEnabled,
                    controller.toggleLocation,
                  ),
                  _buildSwitchTile(
                    'Dark Mode',
                    'Switch between light and dark theme',
                    Icons.dark_mode,
                    controller.darkModeEnabled,
                    controller.toggleDarkMode,
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildSection(
                'Support',
                [
                  _buildLinkTile(
                    'Privacy Policy',
                    'Read our privacy policy',
                    Icons.privacy_tip,
                    () => controller.openUrl('https://pricepilot.com/privacy'),
                  ),
                  _buildLinkTile(
                    'Terms of Service',
                    'Read our terms of service',
                    Icons.description,
                    () => controller.openUrl('https://pricepilot.com/terms'),
                  ),
                  _buildLinkTile(
                    'Contact Support',
                    'Get help with the app',
                    Icons.help,
                    () => controller.openUrl('mailto:support@pricepilot.com'),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Center(
                child: Text(
                  'Version 1.0.0',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildSwitchTile(
    String title,
    String subtitle,
    IconData icon,
    RxBool value,
    void Function(bool) onChanged,
  ) {
    return Obx(() => SwitchListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      secondary: Icon(icon),
      value: value.value,
      onChanged: onChanged,
    ));
  }

  Widget _buildLinkTile(
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap,
  ) {
    return ListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      leading: Icon(icon),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
} 