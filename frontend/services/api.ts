import axios from 'axios';
import Constants from 'expo-constants';

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PriceResponse {
  price: number;
  currency: string;
  surge_multiplier: number;
  estimate_minutes: number;
}

export interface ComparisonResponse {
  route: {
    pickup_location: string;
    dropoff_location: string;
  };
  prices: {
    uber: PriceResponse;
    ola: PriceResponse;
  };
}

export const comparePrices = async (
  pickup_location: string,
  dropoff_location: string
): Promise<ComparisonResponse> => {
  try {
    const response = await api.get('/compare-prices', {
      params: {
        pickup_location,
        dropoff_location,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error comparing prices:', error);
    throw error;
  }
};

export const getPriceHistory = async (
  route_id: number,
  start_date?: string,
  end_date?: string
) => {
  try {
    const response = await api.get(`/price-history/${route_id}`, {
      params: {
        start_date,
        end_date,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
};

export const getPopularRoutes = async (limit: number = 10) => {
  try {
    const response = await api.get('/popular-routes', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular routes:', error);
    throw error;
  }
}; 