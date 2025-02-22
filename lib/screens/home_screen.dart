import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../models/location.dart';
import '../models/ride.dart';
import '../services/ride_service.dart';
import '../widgets/ride_comparison_card.dart';

final selectedPickupProvider = StateProvider<Location?>((ref) => null);
final selectedDropProvider = StateProvider<Location?>((ref) => null);
final ridesProvider = FutureProvider.autoDispose<List<Ride>>((ref) async {
  final pickup = ref.watch(selectedPickupProvider);
  final drop = ref.watch(selectedDropProvider);
  
  if (pickup == null || drop == null) return [];
  
  return ref.read(rideServiceProvider).compareRides(pickup, drop);
});

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _pickupController = TextEditingController();
  final _dropController = TextEditingController();
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  bool _showResults = false;

  static const LatLng _defaultLocation = LatLng(12.9716, 77.5946); // Bangalore

  @override
  void dispose() {
    _pickupController.dispose();
    _dropController.dispose();
    _mapController?.dispose();
    super.dispose();
  }

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
  }

  void _addMarker(LatLng position, String id, String title) {
    setState(() {
      _markers.add(
        Marker(
          markerId: MarkerId(id),
          position: position,
          infoWindow: InfoWindow(title: title),
        ),
      );
    });
  }

  void _selectLocation(bool isPickup) async {
    // TODO: Implement location search
    // For now, using mock data
    final location = Location(
      latitude: isPickup ? 12.9716 : 12.9516,
      longitude: isPickup ? 77.5946 : 77.5846,
      address: isPickup ? 'Current Location' : 'Destination',
    );

    if (isPickup) {
      ref.read(selectedPickupProvider.notifier).state = location;
      _pickupController.text = location.toString();
      _addMarker(
        LatLng(location.latitude, location.longitude),
        'pickup',
        'Pickup',
      );
    } else {
      ref.read(selectedDropProvider.notifier).state = location;
      _dropController.text = location.toString();
      _addMarker(
        LatLng(location.latitude, location.longitude),
        'drop',
        'Drop',
      );
    }
  }

  void _compareRides() {
    final pickup = ref.read(selectedPickupProvider);
    final drop = ref.read(selectedDropProvider);

    if (pickup == null || drop == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select both pickup and drop locations')),
      );
      return;
    }

    setState(() {
      _showResults = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final rides = ref.watch(ridesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Price Pilot'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              // TODO: Implement logout
            },
          ),
        ],
      ),
      body: Column(
        children: [
          if (!_showResults) ...[
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  TextField(
                    controller: _pickupController,
                    decoration: const InputDecoration(
                      labelText: 'Pickup Location',
                      prefixIcon: Icon(Icons.location_on),
                    ),
                    readOnly: true,
                    onTap: () => _selectLocation(true),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _dropController,
                    decoration: const InputDecoration(
                      labelText: 'Drop Location',
                      prefixIcon: Icon(Icons.location_on),
                    ),
                    readOnly: true,
                    onTap: () => _selectLocation(false),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _compareRides,
                    child: const Text('Compare Prices'),
                  ),
                ],
              ),
            ),
            Expanded(
              child: GoogleMap(
                onMapCreated: _onMapCreated,
                initialCameraPosition: const CameraPosition(
                  target: _defaultLocation,
                  zoom: 12,
                ),
                markers: _markers,
                myLocationEnabled: true,
                myLocationButtonEnabled: true,
              ),
            ),
          ] else ...[
            Expanded(
              child: rides.when(
                data: (rideList) {
                  if (rideList.isEmpty) {
                    return const Center(
                      child: Text('No rides available'),
                    );
                  }

                  return ListView.builder(
                    itemCount: rideList.length,
                    itemBuilder: (context, index) {
                      return RideComparisonCard(
                        ride: rideList[index],
                        onSelect: () {
                          // TODO: Implement ride selection
                        },
                      );
                    },
                  );
                },
                loading: () => const Center(
                  child: CircularProgressIndicator(),
                ),
                error: (error, stack) => Center(
                  child: Text('Error: $error'),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    _showResults = false;
                    _markers.clear();
                    _pickupController.clear();
                    _dropController.clear();
                    ref.read(selectedPickupProvider.notifier).state = null;
                    ref.read(selectedDropProvider.notifier).state = null;
                  });
                },
                child: const Text('New Search'),
              ),
            ),
          ],
        ],
      ),
    );
  }
} 