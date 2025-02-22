import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:price_pilot/models/price_model.dart';
import 'package:price_pilot/models/route_model.dart';
import '../controllers/history_controller.dart';

class HistoryView extends ConsumerWidget {
  const HistoryView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(historyControllerProvider);
    final controller = ref.read(historyControllerProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Price History'),
      ),
      body: Column(
        children: [
          Expanded(
            flex: 1,
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    itemCount: state.routes.length,
                    itemBuilder: (context, index) {
                      final route = state.routes[index];
                      return RouteCard(
                        route: route,
                        isSelected: route.id == state.selectedRouteId,
                        onTap: () => controller.selectRoute(route.id),
                      );
                    },
                  ),
          ),
          Expanded(
            flex: 2,
            child: state.isLoadingHistory
                ? const Center(child: CircularProgressIndicator())
                : state.priceHistory.isEmpty
                    ? const Center(
                        child: Text('Select a route to view price history'),
                      )
                    : ListView.builder(
                        itemCount: state.priceHistory.length,
                        itemBuilder: (context, index) {
                          final price = state.priceHistory[index];
                          return PriceHistoryCard(price: price);
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class RouteCard extends StatelessWidget {
  final RouteModel route;
  final bool isSelected;
  final VoidCallback onTap;

  const RouteCard({
    super.key,
    required this.route,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: isSelected ? 4 : 1,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                route.name,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                '${route.startLocation} → ${route.endLocation}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 4),
              Text(
                'Distance: ${route.distance.toStringAsFixed(1)} km',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class PriceHistoryCard extends StatelessWidget {
  final PriceModel price;

  const PriceHistoryCard({
    super.key,
    required this.price,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  price.provider,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Text(
                  '₹${price.price.toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Surge: ${price.surgeMultiplier}x',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            Text(
              'ETA: ${price.estimatedMinutes} mins',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            Text(
              'Time: ${price.timestamp.toString()}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
