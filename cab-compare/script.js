// Global variables for map services
let map = null;
let directionsService = null;
let directionsRenderer = null;
let pickupAutocomplete = null;
let dropAutocomplete = null;

// Initialize Google Maps and services
function initMap() {
    try {
        // Initialize services
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: false,
            preserveViewport: false
        });

        // Initialize map
        const mapElement = document.getElementById('map');
        if (mapElement) {
            map = new google.maps.Map(mapElement, {
                zoom: 12,
                center: { lat: 20.5937, lng: 78.9629 }, // Center of India
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                ],
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false
            });
            directionsRenderer.setMap(map);
        }

        // Initialize autocomplete for pickup and drop locations
        const pickupInput = document.getElementById('pickup');
        const dropInput = document.getElementById('drop');

        if (pickupInput && dropInput) {
            pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
                componentRestrictions: { country: 'in' }
            });
            dropAutocomplete = new google.maps.places.Autocomplete(dropInput, {
                componentRestrictions: { country: 'in' }
            });

            // Add place_changed listeners
            pickupAutocomplete.addListener('place_changed', () => {
                const place = pickupAutocomplete.getPlace();
                if (!place.geometry) {
                    alert('Please select a location from the dropdown.');
                    pickupInput.value = '';
                }
            });

            dropAutocomplete.addListener('place_changed', () => {
                const place = dropAutocomplete.getPlace();
                if (!place.geometry) {
                    alert('Please select a location from the dropdown.');
                    dropInput.value = '';
                }
            });
        }

        // Initialize cab booking functionality
        initCabBooking();
    } catch (error) {
        console.error('Error initializing Google Maps:', error);
        alert('Failed to initialize maps. Please refresh the page.');
    }
}

function initCabBooking() {
    const cabForm = document.getElementById('cabBookingForm');
    const cabResults = document.getElementById('cabResults');
    let comparisonModal = null;

    // Initialize the modal
    const modalElement = document.getElementById('comparisonModal');
    if (modalElement) {
        comparisonModal = new bootstrap.Modal(modalElement);
    }

    // Base price calculation constants
    const PRICE_PER_KM = 12; // Base rate per kilometer
    const PRICE_PER_MINUTE = 2; // Base rate per minute
    const BASE_FARE = 50; // Minimum base fare
    const SURGE_MULTIPLIER = 1.2; // Surge pricing multiplier for peak hours
    const TRAFFIC_MULTIPLIER = 1.1; // Additional cost for heavy traffic

    // Calculate base price based on distance and duration
    function calculateBasePrice(distance, duration, trafficDuration) {
        if (!distance || !duration) {
            throw new Error('Invalid distance or duration');
        }

        const distanceInKm = distance / 1000; // Convert meters to kilometers
        const durationInMinutes = duration / 60; // Convert seconds to minutes
        
        // Calculate traffic impact
        const trafficMultiplier = trafficDuration > duration ? TRAFFIC_MULTIPLIER : 1;
        const distanceCost = distanceInKm * PRICE_PER_KM;
        const timeCost = durationInMinutes * PRICE_PER_MINUTE;
        
        // Apply surge pricing during peak hours (8-10 AM and 5-7 PM)
        const currentHour = new Date().getHours();
        const isPeakHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19);
        const surgeMultiplier = isPeakHour ? SURGE_MULTIPLIER : 1;
        
        // Calculate total fare with all multipliers
        let totalFare = (BASE_FARE + distanceCost + timeCost) * surgeMultiplier * trafficMultiplier;
        
        // Round to nearest 10
        totalFare = Math.ceil(totalFare / 10) * 10;
        
        return Math.max(totalFare, BASE_FARE); // Ensure minimum base fare
    }

    // Calculate route with traffic data
    async function calculateRoute(pickup, drop) {
        return new Promise((resolve, reject) => {
            if (!directionsService) {
                reject(new Error('Maps service not initialized'));
                return;
            }

            directionsService.route({
                origin: pickup,
                destination: drop,
                travelMode: google.maps.TravelMode.DRIVING,
                drivingOptions: {
                    departureTime: new Date(),
                    trafficModel: google.maps.TrafficModel.BEST_GUESS
                }
            }, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    resolve(result);
                } else {
                    reject(new Error(`Route calculation failed: ${status}`));
                }
            });
        });
    }

    // Display fare estimates in the comparison modal
    function displayFareEstimates(distance, duration, trafficDuration) {
        const fareList = document.getElementById('fareList');
        if (!fareList) return;

        try {
            const basePrice = calculateBasePrice(distance, duration, trafficDuration);
            
            // Calculate provider-specific prices with more realistic multipliers
            const estimates = [
                {
                    provider: 'Uber',
                    types: [
                        { name: 'UberGo', multiplier: 1.0, baseMultiplier: 0.95 },
                        { name: 'Premier', multiplier: 1.5, baseMultiplier: 1.1 },
                        { name: 'UberXL', multiplier: 2.0, baseMultiplier: 1.25 }
                    ]
                },
                {
                    provider: 'Ola',
                    types: [
                        { name: 'Mini', multiplier: 0.9, baseMultiplier: 0.9 },
                        { name: 'Sedan', multiplier: 1.4, baseMultiplier: 1.05 },
                        { name: 'Prime', multiplier: 1.8, baseMultiplier: 1.2 }
                    ]
                },
                {
                    provider: 'Rapido',
                    types: [
                        { name: 'Bike', multiplier: 0.5, baseMultiplier: 0.6 },
                        { name: 'Auto', multiplier: 0.8, baseMultiplier: 0.75 },
                        { name: 'Prime', multiplier: 1.3, baseMultiplier: 1.0 }
                    ]
                }
            ];

            // Clear previous results
            fareList.innerHTML = '';

            // Add fare estimates for each provider and vehicle type
            estimates.forEach(provider => {
                provider.types.forEach(type => {
                    const finalMultiplier = type.multiplier * type.baseMultiplier;
                    const estimatedFare = Math.round(basePrice * finalMultiplier);
                    const eta = Math.round(trafficDuration / 60); // Use traffic-aware duration

                    const fareItem = document.createElement('div');
                    fareItem.className = 'list-group-item fade-in';
                    fareItem.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="mb-1">${provider.provider} ${type.name}</h5>
                                <p class="mb-1">
                                    <i class="fas fa-rupee-sign"></i> ${estimatedFare}
                                    <small class="text-muted ms-2">
                                        <i class="fas fa-clock"></i> ${eta} mins
                                    </small>
                                    ${trafficDuration > duration * 1.2 ? 
                                        '<small class="text-warning ms-2"><i class="fas fa-exclamation-triangle"></i> Heavy traffic</small>' 
                                        : ''}
                                </p>
                            </div>
                            <button class="btn btn-outline-primary btn-sm">
                                Book Now
                            </button>
                        </div>
                    `;
                    fareList.appendChild(fareItem);
                });
            });

            // Show the fare results section
            const fareResults = document.getElementById('fareResults');
            if (fareResults) {
                fareResults.classList.remove('d-none');
            }
        } catch (error) {
            console.error('Error displaying fare estimates:', error);
            fareList.innerHTML = '<div class="alert alert-danger">Failed to calculate fares. Please try again.</div>';
        }
    }

    cabForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const button = this.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;
        const pickup = this.querySelector('input[placeholder="Enter pickup location"]').value;
        const drop = this.querySelector('input[placeholder="Enter drop location"]').value;

        try {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Comparing...';

            if (!pickup || !drop) {
                throw new Error('Please enter both pickup and drop locations');
            }

            // Show the comparison modal
            if (comparisonModal) {
                comparisonModal.show();
            }

            // Initialize map if not already done
            if (!directionsRenderer.getMap()) {
                initializeMap();
            }

            // Calculate route with traffic data
            const route = await calculateRoute(pickup, drop);
            directionsRenderer.setDirections(route);

            // Update route info with traffic data
            const routeInfo = document.getElementById('routeInfo');
            if (routeInfo) {
                const leg = route.routes[0].legs[0];
                routeInfo.querySelector('.distance span').textContent = leg.distance.text;
                routeInfo.querySelector('.duration span').textContent = leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text;
                routeInfo.classList.remove('d-none');
            }

            // Calculate and display fare estimates using traffic data
            const leg = route.routes[0].legs[0];
            displayFareEstimates(
                leg.distance.value,
                leg.duration.value,
                leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value
            );

            // Show results
            cabResults.style.display = 'block';
            cabResults.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error comparing cab prices:', error);
            alert(error.message || 'Failed to calculate route. Please check the addresses and try again.');
        } finally {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    });
}

// Add location button functionality
function initLocationButtons() {
    const locationButtons = document.querySelectorAll('.use-location-btn');
    locationButtons.forEach(button => {
        button.addEventListener('click', async () => {
            try {
                if (!navigator.geolocation) {
                    throw new Error('Geolocation is not supported by your browser');
                }

                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                });

                const { latitude, longitude } = position.coords;
                const geocoder = new google.maps.Geocoder();
                
                const result = await new Promise((resolve, reject) => {
                    geocoder.geocode(
                        { location: { lat: latitude, lng: longitude } },
                        (results, status) => {
                            if (status === 'OK') {
                                resolve(results[0]);
                            } else {
                                reject(new Error('Geocoding failed'));
                            }
                        }
                    );
                });

                // Find the nearest input field
                const nearestInput = button.closest('div').querySelector('input');
                if (nearestInput) {
                    nearestInput.value = result.formatted_address;
                }
            } catch (error) {
                console.error('Error getting location:', error);
                alert('Could not get your location. Please enter it manually.');
            }
        });
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initLocationButtons();
});
