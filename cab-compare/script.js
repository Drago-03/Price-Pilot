function initCabBooking() {
    const cabForm = document.getElementById('cabBookingForm');
    const cabResults = document.getElementById('cabResults');
    let comparisonModal = null;
    let directionsService = null;
    let directionsRenderer = null;

    // Initialize the modal and Google Maps services
    const modalElement = document.getElementById('comparisonModal');
    if (modalElement) {
        comparisonModal = new bootstrap.Modal(modalElement);
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer();
    }

    // Base price calculation constants
    const PRICE_PER_KM = 12; // Base rate per kilometer
    const PRICE_PER_MINUTE = 2; // Base rate per minute
    const BASE_FARE = 50; // Minimum base fare
    const SURGE_MULTIPLIER = 1.2; // Surge pricing multiplier for peak hours

    // Calculate base price based on distance and duration
    function calculateBasePrice(distance, duration) {
        const distanceInKm = distance / 1000; // Convert meters to kilometers
        const durationInMinutes = duration / 60; // Convert seconds to minutes
        
        const distanceCost = distanceInKm * PRICE_PER_KM;
        const timeCost = durationInMinutes * PRICE_PER_MINUTE;
        
        // Apply surge pricing during peak hours (8-10 AM and 5-7 PM)
        const currentHour = new Date().getHours();
        const isPeakHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19);
        const surgeMultiplier = isPeakHour ? SURGE_MULTIPLIER : 1;
        
        let totalFare = (BASE_FARE + distanceCost + timeCost) * surgeMultiplier;
        return Math.max(totalFare, BASE_FARE); // Ensure minimum base fare
    }

    // Display fare estimates in the comparison modal
    function displayFareEstimates(distance, duration) {
        const fareList = document.getElementById('fareList');
        if (!fareList) return;

        const basePrice = calculateBasePrice(distance, duration);
        
        // Calculate provider-specific prices
        const estimates = [
            {
                provider: 'Uber',
                types: [
                    { name: 'UberGo', multiplier: 1.0 },
                    { name: 'Premier', multiplier: 1.5 },
                    { name: 'UberXL', multiplier: 2.0 }
                ]
            },
            {
                provider: 'Ola',
                types: [
                    { name: 'Mini', multiplier: 0.9 },
                    { name: 'Sedan', multiplier: 1.4 },
                    { name: 'Prime', multiplier: 1.8 }
                ]
            },
            {
                provider: 'Rapido',
                types: [
                    { name: 'Bike', multiplier: 0.5 },
                    { name: 'Auto', multiplier: 0.8 },
                    { name: 'Prime', multiplier: 1.3 }
                ]
            }
        ];

        // Clear previous results
        fareList.innerHTML = '';

        // Add fare estimates for each provider and vehicle type
        estimates.forEach(provider => {
            provider.types.forEach(type => {
                const estimatedFare = Math.round(basePrice * type.multiplier);
                const eta = Math.round(duration / 60); // Convert seconds to minutes

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

            // Show the comparison modal
            if (comparisonModal) {
                comparisonModal.show();
            }

            // Calculate route using Google Maps Directions Service
            const route = await new Promise((resolve, reject) => {
                directionsService.route({
                    origin: pickup,
                    destination: drop,
                    travelMode: google.maps.TravelMode.DRIVING
                }, (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        resolve(result);
                    } else {
                        reject(new Error('Failed to calculate route'));
                    }
                });
            });

            // Display route on map
            const map = document.getElementById('map');
            if (map) {
                directionsRenderer.setMap(new google.maps.Map(map, {
                    zoom: 12,
                    center: { lat: 0, lng: 0 },
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    ]
                }));
                directionsRenderer.setDirections(route);
            }

            // Update route info
            const routeInfo = document.getElementById('routeInfo');
            if (routeInfo) {
                const leg = route.routes[0].legs[0];
                routeInfo.querySelector('.distance span').textContent = leg.distance.text;
                routeInfo.querySelector('.duration span').textContent = leg.duration.text;
                routeInfo.classList.remove('d-none');
            }

            // Calculate and display fare estimates
            displayFareEstimates(
                route.routes[0].legs[0].distance.value,
                route.routes[0].legs[0].duration.value
            );

            // Show results
            cabResults.style.display = 'block';
            cabResults.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error comparing cab prices:', error);
            alert('Failed to calculate route. Please check the addresses and try again.');
        } finally {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    });
}
