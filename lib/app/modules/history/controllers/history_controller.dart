import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:price_pilot/models/price_model.dart';
import 'package:price_pilot/models/route_model.dart';

final historyControllerProvider =
    StateNotifierProvider<HistoryController, HistoryState>((ref) {
  return HistoryController();
});

class HistoryState {
  final bool isLoading;
  final bool isLoadingHistory;
  final List<RouteModel> routes;
  final List<PriceModel> priceHistory;
  final int? selectedRouteId;

  HistoryState({
    this.isLoading = false,
    this.isLoadingHistory = false,
    this.routes = const [],
    this.priceHistory = const [],
    this.selectedRouteId,
  });

  HistoryState copyWith({
    bool? isLoading,
    bool? isLoadingHistory,
    List<RouteModel>? routes,
    List<PriceModel>? priceHistory,
    int? selectedRouteId,
  }) {
    return HistoryState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingHistory: isLoadingHistory ?? this.isLoadingHistory,
      routes: routes ?? this.routes,
      priceHistory: priceHistory ?? this.priceHistory,
      selectedRouteId: selectedRouteId ?? this.selectedRouteId,
    );
  }
}

class HistoryController extends StateNotifier<HistoryState> {
  HistoryController() : super(HistoryState()) {
    loadRoutes();
  }

  Future<void> loadRoutes() async {
    state = state.copyWith(isLoading: true);
    try {
      // TODO: Implement actual API call
      final popularRoutes = [
        RouteModel(
          id: 1,
          name: "Home to Work",
          startLocation: "Home",
          endLocation: "Work",
          distance: 10.5,
          popularityScore: 100,
        ),
      ];
      state = state.copyWith(
        routes: popularRoutes,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
      // Handle error
    }
  }

  Future<void> selectRoute(int routeId) async {
    state = state.copyWith(selectedRouteId: routeId);
    await loadPriceHistory(routeId);
  }

  Future<void> loadPriceHistory(int routeId) async {
    state = state.copyWith(isLoadingHistory: true);
    try {
      // TODO: Implement actual API call
      final history = [
        PriceModel(
          id: 1,
          routeId: routeId,
          provider: "Uber",
          price: 250.0,
          surgeMultiplier: 1.0,
          timestamp: DateTime.now(),
          estimatedMinutes: 15,
        ),
      ];
      state = state.copyWith(
        priceHistory: history,
        isLoadingHistory: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingHistory: false);
      // Handle error
    }
  }
}
