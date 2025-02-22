import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '../../components/Themed';
import * as Location from 'expo-location';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { PriceCard } from '../../components/home/PriceCard';
import { comparePrices, PriceResponse } from '../../services/api';

interface Price {
  service: string;
  amount: number;
  currency: string;
  surge_multiplier: number;
  estimate_minutes: number;
}

export default function CompareScreen() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Price[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (address[0]) {
        const locationString = `${address[0].street}, ${address[0].city}`;
        setPickupLocation(locationString);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    try {
      const scannedData = JSON.parse(data);
      if (scannedData.pickup) setPickupLocation(scannedData.pickup);
      if (scannedData.dropoff) setDropoffLocation(scannedData.dropoff);
      setScanning(false);
    } catch (error) {
      console.error('Error processing QR code:', error);
      setScanning(false);
    }
  };

  const handleCompare = async () => {
    if (!pickupLocation || !dropoffLocation) return;
    
    setLoading(true);
    try {
      const response = await comparePrices(pickupLocation, dropoffLocation);
      const priceList: Price[] = Object.entries(response.prices).map(([service, data]) => ({
        service,
        ...data
      }));
      setPrices(priceList);
    } catch (error) {
      console.error('Error comparing prices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (scanning) {
    return (
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Pickup Location"
            value={pickupLocation}
            onChangeText={setPickupLocation}
          />
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <Text>📍</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Dropoff Location"
            value={dropoffLocation}
            onChangeText={setDropoffLocation}
          />
          <TouchableOpacity style={styles.locationButton} onPress={() => setScanning(true)}>
            <Text>📷</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.compareButton, (!pickupLocation || !dropoffLocation) && styles.disabledButton]}
          onPress={handleCompare}
          disabled={!pickupLocation || !dropoffLocation || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.compareButtonText}>Compare Prices</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        {prices.map((price, index) => (
          <PriceCard
            key={index}
            service={price.service}
            price={price.amount}
            currency={price.currency}
            surgeMultiplier={price.surge_multiplier}
            estimateMinutes={price.estimate_minutes}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  locationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  compareButton: {
    backgroundColor: '#2f95dc',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  compareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
  },
}); 