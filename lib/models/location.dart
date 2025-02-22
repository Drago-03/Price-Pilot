class Location {
  final double latitude;
  final double longitude;
  final String? address;
  final String? placeId;
  final String? locality;
  final String? city;

  Location({
    required this.latitude,
    required this.longitude,
    this.address,
    this.placeId,
    this.locality,
    this.city,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
      placeId: json['placeId'] as String?,
      locality: json['locality'] as String?,
      city: json['city'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'placeId': placeId,
      'locality': locality,
      'city': city,
    };
  }

  @override
  String toString() {
    return address ?? '$latitude, $longitude';
  }
} 