import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/location.dart';
import '../models/ride.dart';

final rideServiceProvider = Provider<RideService>((ref) => RideService());

class RideService {
  static const String _baseUrl = 'http://localhost:8000/api/v1';
  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
  };

  Future<List<Ride>> compareRides(Location pickup, Location drop) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/compare-rides'),
        headers: _headers,
        body: jsonEncode({
          'pickup': pickup.toJson(),
          'drop': drop.toJson(),
        }),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Ride.fromJson(json)).toList();
      } else if (response.statusCode == 429) {
        throw Exception('Rate limit exceeded. Please try again later.');
      } else {
        throw Exception('Failed to fetch ride comparisons');
      }
    } catch (e) {
      // For development, return mock data
      return _getMockRides();
    }
  }

  List<Ride> _getMockRides() {
    return [
      Ride(
        serviceProvider: 'Uber',
        price: 250.0,
        vehicleType: 'UberGo',
        estimatedTimeInMinutes: 15,
        distance: 8.5,
      ),
      Ride(
        serviceProvider: 'Ola',
        price: 245.0,
        vehicleType: 'Mini',
        estimatedTimeInMinutes: 18,
        distance: 8.5,
      ),
      Ride(
        serviceProvider: 'Rapido',
        price: 150.0,
        vehicleType: 'Bike',
        estimatedTimeInMinutes: 12,
        distance: 8.5,
      ),
    ];
  }

  Future<String?> getTrackingUrl(String serviceProvider, String bookingId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/tracking-url/$serviceProvider/$bookingId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['trackingUrl'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  void setAuthToken(String token) {
    _headers['Authorization'] = 'Bearer $token';
  }
} 