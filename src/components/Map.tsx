import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Car, Clock } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface RidePrice {
  service: string;
  price: number;
  time: number;
  type: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is missing. Please add it to your .env file.');
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [prices, setPrices] = useState<RidePrice[]>([]);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.fill',
              stylers: [{ color: '#ffffff' }, { lightness: 17 }]
            }
          ]
        });
        setMap(mapInstance);

        // Initialize the Places Autocomplete for both inputs
        const pickupInput = document.getElementById('pickup-input') as HTMLInputElement;
        const dropInput = document.getElementById('drop-input') as HTMLInputElement;
        
        new google.maps.places.Autocomplete(pickupInput);
        new google.maps.places.Autocomplete(dropInput);
      }
    });
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          if (map) {
            map.setCenter(location);
            map.setZoom(15);
            addMarker(location);
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, [map]);

  const addMarker = (location: Location) => {
    if (map) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));
      
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        animation: google.maps.Animation.DROP,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4F46E5',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#FFFFFF'
        }
      });
      
      setMarkers([marker]);
    }
  };

  const calculatePrices = async () => {
    if (!searchInput || !destinationInput) {
      alert('Please enter both pickup and drop-off locations');
      return;
    }

    // Simulate API calls to ride services
    // In a real application, you would make actual API calls to the ride services
    const mockPrices: RidePrice[] = [
      { service: 'Uber', price: Math.random() * 500 + 100, time: Math.floor(Math.random() * 20) + 5, type: 'UberGo' },
      { service: 'Ola', price: Math.random() * 500 + 100, time: Math.floor(Math.random() * 20) + 5, type: 'Mini' },
      { service: 'Rapido', price: Math.random() * 500 + 100, time: Math.floor(Math.random() * 20) + 5, type: 'Bike' }
    ];

    // Sort prices from lowest to highest
    const sortedPrices = mockPrices.sort((a, b) => a.price - b.price);
    setPrices(sortedPrices);

    // Calculate route
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true
    });

    try {
      const result = await directionsService.route({
        origin: searchInput,
        destination: destinationInput,
        travelMode: google.maps.TravelMode.DRIVING
      });

      directionsRenderer.setDirections(result);
      setDistance(result.routes[0].legs[0].distance?.text || '');
      setDuration(result.routes[0].legs[0].duration?.text || '');
    } catch (error) {
      console.error('Error calculating route:', error);
      alert('Could not calculate route. Please check your addresses.');
    }
  };

  const centerOnUserLocation = () => {
    if (userLocation && map) {
      map.setCenter(userLocation);
      map.setZoom(15);
      addMarker(userLocation);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="pickup-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <input
                  id="pickup-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter pickup location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="drop-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Drop-off Location
                </label>
                <input
                  id="drop-input"
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  placeholder="Enter drop-off location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={calculatePrices}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4" />
                Compare Prices
              </button>
              <button
                onClick={centerOnUserLocation}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                My Location
              </button>
            </div>

            {(distance || duration) && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Distance: {distance}</span>
                  <span>Duration: {duration}</span>
                </div>
              </div>
            )}

            {prices.length > 0 && (
              <div className="mt-4 space-y-3">
                {prices.map((price, index) => (
                  <div
                    key={price.service}
                    className={`p-4 rounded-lg ${
                      index === 0
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{price.service}</h3>
                        <p className="text-sm text-gray-500">{price.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{price.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {price.time} mins
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="mt-2 text-sm text-green-600">
                        Best Price Available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
    </div>
  );
}