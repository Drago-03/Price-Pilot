import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../Themed';
import { FontAwesome } from '@expo/vector-icons';

interface PriceCardProps {
  service: string;
  price: number;
  currency: string;
  surgeMultiplier?: number;
  estimateMinutes: number;
}

const serviceLogos = {
  'Uber': 'car',
  'Ola': 'taxi'
};

export const PriceCard: React.FC<PriceCardProps> = ({
  service,
  price,
  currency,
  surgeMultiplier,
  estimateMinutes
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name={serviceLogos[service] || 'car'} size={24} color="#333" />
        <Text style={styles.serviceName}>{service}</Text>
        {surgeMultiplier && surgeMultiplier > 1 && (
          <View style={styles.surgeBadge}>
            <Text style={styles.surgeText}>{surgeMultiplier}x</Text>
          </View>
        )}
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.currency}>{currency}</Text>
        <Text style={styles.price}>{price.toFixed(2)}</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.estimate}>{estimateMinutes} min</Text>
        <View style={styles.rating}>
          <FontAwesome name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>4.8</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  surgeBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  surgeText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimate: {
    color: '#666',
    fontSize: 14,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
}); 