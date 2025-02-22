import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '../../components/Themed';
import { getPopularRoutes, getPriceHistory } from '../../services/api';
import Colors from '../../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

interface Route {
  id: number;
  pickup_location: string;
  dropoff_location: string;
  search_count: number;
}

interface PriceHistoryItem {
  id: number;
  service_provider: 'UBER' | 'OLA';
  price: number;
  currency: string;
  surge_multiplier: number;
  timestamp: string;
}

export default function HistoryScreen() {
  const [popularRoutes, setPopularRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularRoutes();
  }, []);

  const loadPopularRoutes = async () => {
    try {
      const routes = await getPopularRoutes(10);
      setPopularRoutes(routes);
      setLoading(false);
    } catch (error) {
      console.error('Error loading popular routes:', error);
      setLoading(false);
    }
  };

  const loadPriceHistory = async (route: Route) => {
    setSelectedRoute(route);
    setLoading(true);
    try {
      const history = await getPriceHistory(route.id);
      setPriceHistory(history.history);
    } catch (error) {
      console.error('Error loading price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRouteItem = ({ item }: { item: Route }) => (
    <TouchableOpacity
      style={[
        styles.routeCard,
        selectedRoute?.id === item.id && styles.selectedCard,
      ]}
      onPress={() => loadPriceHistory(item)}
    >
      <View style={styles.routeInfo}>
        <Text style={styles.locationText}>From: {item.pickup_location}</Text>
        <Text style={styles.locationText}>To: {item.dropoff_location}</Text>
        <Text style={styles.searchCount}>
          <FontAwesome name="search" size={12} color={Colors.light.tint} /> {item.search_count} searches
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: PriceHistoryItem }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.serviceProvider}>{item.service_provider}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.price}>
          {item.currency} {item.price.toFixed(2)}
        </Text>
        {item.surge_multiplier > 1 && (
          <Text style={styles.surge}>{item.surge_multiplier}x surge</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Routes</Text>
      <FlatList
        data={popularRoutes}
        renderItem={renderRouteItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.routeList}
      />

      {selectedRoute && (
        <>
          <Text style={styles.title}>Price History</Text>
          <FlatList
            data={priceHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.historyList}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  routeList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
  routeInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  searchCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  historyList: {
    flex: 1,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  serviceProvider: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  surge: {
    fontSize: 12,
    color: '#E74C3C',
    backgroundColor: '#FADBD8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
}); 