import 'package:get/get.dart';
import 'package:price_pilot/app/data/models/price_model.dart';
import 'package:price_pilot/app/data/repositories/price_repository.dart';

class HistoryController extends GetxController {
  final PriceRepository _priceRepository;

  HistoryController({
    required PriceRepository priceRepository,
  }) : _priceRepository = priceRepository;

  final isLoading = false.obs;
  final isLoadingHistory = false.obs;
  final routes = <RouteModel>[].obs;
  final priceHistory = <PriceModel>[].obs;
  final selectedRouteId = RxnInt();

  @override
  void onInit() {
    super.onInit();
    loadRoutes();
  }

  Future<void> loadRoutes() async {
    isLoading.value = true;
    try {
      final popularRoutes = await _priceRepository.getPopularRoutes();
      routes.assignAll(popularRoutes);
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load routes',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> selectRoute(int routeId) async {
    selectedRouteId.value = routeId;
    await loadPriceHistory(routeId);
  }

  Future<void> loadPriceHistory(int routeId) async {
    isLoadingHistory.value = true;
    try {
      final history = await _priceRepository.getPriceHistory(
        routeId,
        DateTime.now().subtract(const Duration(days: 7)),
        DateTime.now(),
      );
      priceHistory.assignAll(history);
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load price history',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoadingHistory.value = false;
    }
  }
} 