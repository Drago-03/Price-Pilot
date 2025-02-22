import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'services/auth_service.dart';

Future<void> main() async {
  try {
    WidgetsFlutterBinding.ensureInitialized();
    await Firebase.initializeApp(
      options: const FirebaseOptions(
        apiKey: "YOUR_API_KEY", // Replace with your actual Firebase config
        appId: "YOUR_APP_ID",
        messagingSenderId: "YOUR_SENDER_ID",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
      ),
    );
    final prefs = await SharedPreferences.getInstance();

    // Initialize services here
    // await Get.putAsync(() => StorageService().init());
    // await Get.putAsync(() => LocationService().init());

    runApp(
      const ProviderScope(
        child: PricePilotApp(),
      ),
    );
  } catch (e) {
    print('Error initializing app: $e');
    // Show error screen or handle error appropriately
    runApp(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('Error initializing app: $e'),
          ),
        ),
      ),
    );
  }
}

class PricePilotApp extends StatelessWidget {
  const PricePilotApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Price Pilot',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends ConsumerWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState =
        ref.watch(authServiceProvider.select((value) => value.currentUser));

    return authState == null ? const LoginScreen() : const HomeScreen();
  }
}
