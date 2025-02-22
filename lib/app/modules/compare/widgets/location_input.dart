import 'package:flutter/material.dart';

class LocationInput extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final VoidCallback onCurrentLocation;
  final VoidCallback onScanQR;

  const LocationInput({
    super.key,
    required this.controller,
    required this.label,
    required this.onCurrentLocation,
    required this.onScanQR,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              decoration: InputDecoration(
                labelText: label,
                border: const OutlineInputBorder(),
                suffixIcon: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.my_location),
                      onPressed: onCurrentLocation,
                      tooltip: 'Use current location',
                    ),
                    IconButton(
                      icon: const Icon(Icons.qr_code_scanner),
                      onPressed: onScanQR,
                      tooltip: 'Scan QR code',
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
} 