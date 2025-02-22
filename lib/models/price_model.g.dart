// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'price_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PriceModelImpl _$$PriceModelImplFromJson(Map<String, dynamic> json) =>
    _$PriceModelImpl(
      id: (json['id'] as num).toInt(),
      routeId: (json['routeId'] as num).toInt(),
      provider: json['provider'] as String,
      price: (json['price'] as num).toDouble(),
      surgeMultiplier: (json['surgeMultiplier'] as num).toDouble(),
      timestamp: DateTime.parse(json['timestamp'] as String),
      estimatedMinutes: (json['estimatedMinutes'] as num).toInt(),
    );

Map<String, dynamic> _$$PriceModelImplToJson(_$PriceModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'routeId': instance.routeId,
      'provider': instance.provider,
      'price': instance.price,
      'surgeMultiplier': instance.surgeMultiplier,
      'timestamp': instance.timestamp.toIso8601String(),
      'estimatedMinutes': instance.estimatedMinutes,
    };
