class Ride {
  final String serviceProvider; // Ola, Uber, or Rapido
  final double price;
  final String vehicleType; // Mini, Prime, Bike, etc.
  final int estimatedTimeInMinutes;
  final double distance;
  final String? trackingUrl;
  final Map<String, dynamic>? additionalInfo;

  Ride({
    required this.serviceProvider,
    required this.price,
    required this.vehicleType,
    required this.estimatedTimeInMinutes,
    required this.distance,
    this.trackingUrl,
    this.additionalInfo,
  });

  factory Ride.fromJson(Map<String, dynamic> json) {
    return Ride(
      serviceProvider: json['serviceProvider'] as String,
      price: (json['price'] as num).toDouble(),
      vehicleType: json['vehicleType'] as String,
      estimatedTimeInMinutes: json['estimatedTimeInMinutes'] as int,
      distance: (json['distance'] as num).toDouble(),
      trackingUrl: json['trackingUrl'] as String?,
      additionalInfo: json['additionalInfo'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'serviceProvider': serviceProvider,
      'price': price,
      'vehicleType': vehicleType,
      'estimatedTimeInMinutes': estimatedTimeInMinutes,
      'distance': distance,
      'trackingUrl': trackingUrl,
      'additionalInfo': additionalInfo,
    };
  }
} 