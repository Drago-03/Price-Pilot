import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:price_pilot/app/modules/history/controllers/history_controller.dart';
import 'package:price_pilot/app/data/models/price_model.dart';
import 'package:price_pilot/core/theme/app_theme.dart';

class HistoryView extends GetView<HistoryController> {
  const HistoryView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Price History'),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Recent Routes',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Obx(() => controller.isLoading.value
              ? const Center(child: CircularProgressIndicator())
              : Expanded(
                  child: ListView.builder(
                    itemCount: controller.routes.length,
                    itemBuilder: (context, index) {
                      final route = controller.routes[index];
                      return RouteCard(
                        route: route,
                        isSelected: controller.selectedRouteId.value == route.id,
                        onTap: () => controller.selectRoute(route.id),
                      );
                    },
                  ),
                ),
            ),
            const SizedBox(height: 24),
            if (controller.selectedRouteId.value != null) ...[
              const Text(
                'Price Trends',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              Obx(() => controller.isLoadingHistory.value
                ? const Center(child: CircularProgressIndicator())
                : Expanded(
                    child: ListView.builder(
                      itemCount: controller.priceHistory.length,
                      itemBuilder: (context, index) {
                        final price = controller.priceHistory[index];
                        return PriceHistoryCard(price: price);
                      },
                    ),
                  ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class RouteCard extends StatelessWidget {
  final RouteModel route;
  final bool isSelected;
  final VoidCallback onTap;

  const RouteCard({
    Key? key,
    required this.route,
    required this.isSelected,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: isSelected ? 4 : 2,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isSelected
          ? BorderSide(color: Theme.of(context).colorScheme.primary, width: 2)
          : BorderSide.none,
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'From: ${route.pickupLocation}',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              Text(
                'To: ${route.dropoffLocation}',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 8),
              Text(
                '${route.searchCount} searches',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
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
    Key? key,
    required this.price,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isSurge = price.surgeMultiplier > 1.0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  price.service,
                  style: theme.textTheme.titleMedium,
                ),
                Text(
                  '${price.currency} ${price.amount.toStringAsFixed(2)}',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            if (isSurge) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppTheme.errorColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '${(price.surgeMultiplier * 100 - 100).toStringAsFixed(0)}% Surge',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppTheme.errorColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
} 