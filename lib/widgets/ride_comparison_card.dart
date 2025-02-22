import 'package:flutter/material.dart';
import '../models/ride.dart';

class RideComparisonCard extends StatelessWidget {
  final Ride ride;
  final VoidCallback? onSelect;

  const RideComparisonCard({
    Key? key,
    required this.ride,
    this.onSelect,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onSelect,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    ride.serviceProvider,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  Text(
                    '₹${ride.price.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    ride.vehicleType,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    '${ride.estimatedTimeInMinutes} mins',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${ride.distance.toStringAsFixed(1)} km',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              if (ride.trackingUrl != null) ...[
                const SizedBox(height: 8),
                Text(
                  'Live tracking available',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.green,
                      ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
} 