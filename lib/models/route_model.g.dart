// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'route_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RouteModelImpl _$$RouteModelImplFromJson(Map<String, dynamic> json) =>
    _$RouteModelImpl(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      startLocation: json['startLocation'] as String,
      endLocation: json['endLocation'] as String,
      distance: (json['distance'] as num).toDouble(),
      popularityScore: (json['popularityScore'] as num).toInt(),
    );

Map<String, dynamic> _$$RouteModelImplToJson(_$RouteModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'startLocation': instance.startLocation,
      'endLocation': instance.endLocation,
      'distance': instance.distance,
      'popularityScore': instance.popularityScore,
    };
