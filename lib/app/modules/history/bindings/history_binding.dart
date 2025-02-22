import 'package:get/get.dart';
import 'package:price_pilot/app/data/repositories/price_repository.dart';
import 'package:price_pilot/app/modules/history/controllers/history_controller.dart';

class HistoryBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => HistoryController(
      priceRepository: Get.find<PriceRepository>(),
    ));
  }
} 