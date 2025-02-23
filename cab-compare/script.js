// Global variables for map and location services
let map, directionsService, directionsRenderer;
let autocompletePickup, autocompleteDrop;
let locationModal, comparisonModal;

/**
 * Initialize Google Maps and related services
 * Sets up the map with custom styling and initializes direction services
 */
function initMap() {
    // Initialize Bootstrap modals for location and comparison
    locationModal = new bootstrap.Modal(document.getElementById('locationModal'));
    comparisonModal = new bootstrap.Modal(document.getElementById('comparisonModal'));

    // Initialize the map with custom dark theme styling
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 20.5937, lng: 78.9629 }, // Center on India
        zoom: 5,
        styles: [
            // Dark theme map styles
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{ "color": "#242f3e" }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#17263c" }]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{ "color": "#38414e" }]
            },
            {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#212a37" }]
            }
        ]
    });

    // Initialize directions service and renderer
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // We'll add custom markers
        polylineOptions: {
            strokeColor: '#4f46e5',
            strokeWeight: 6,
            strokeOpacity: 0.8
        }
    });

    // Set up autocomplete for location inputs
    const pickupInput = document.getElementById('pickup');
    const dropInput = document.getElementById('drop');

    const autocompleteOptions = {
        componentRestrictions: { country: "in" }, // Restrict to India
        fields: ["formatted_address", "geometry", "name"],
        strictBounds: false
    };

    // Initialize autocomplete for both pickup and drop locations
    autocompletePickup = new google.maps.places.Autocomplete(pickupInput, autocompleteOptions);
    autocompleteDrop = new google.maps.places.Autocomplete(dropInput, autocompleteOptions);

    // Add place_changed event listeners
    autocompletePickup.addListener('place_changed', () => {
        const place = autocompletePickup.getPlace();
        if (!place.geometry) {
            alert("No location details available for this place.");
            return;
        }
        updateMap(place.geometry.location, null);
    });

    autocompleteDrop.addListener('place_changed', () => {
        const place = autocompleteDrop.getPlace();
        if (!place.geometry) {
            alert("No location details available for this place.");
            return;
        }
        updateMap(null, place.geometry.location);
    });

    // Set up location permission request button
    document.getElementById('requestLocationBtn').addEventListener('click', async () => {
        locationModal.hide();
        await getCurrentLocation();
    });
}

/**
 * Check browser's geolocation permission status
 * @returns {Promise<string>} Permission state ('granted', 'denied', or 'prompt')
 */
async function checkLocationPermission() {
    try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state;
    } catch (error) {
        console.error('Error checking location permission:', error);
        return 'prompt';
    }
}

/**
 * Get user's current location using browser's geolocation API
 * @returns {Promise<GeolocationPosition>} User's current position
 */
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => {
                let message;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = "You denied the request for location access. Please enable it in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        message = "The request to get user location timed out.";
                        break;
                    default:
                        message = "An unknown error occurred while getting location.";
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Event listener for the "Use My Location" button
document.getElementById('currentLocationBtn').addEventListener('click', async function() {
    const button = this;
    const originalContent = button.innerHTML;
    
    try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            throw new Error("Geolocation is not supported by this browser.");
        }

        // Check permission status
        const permissionStatus = await checkLocationPermission();
        
        if (permissionStatus === 'denied') {
            throw new Error('PERMISSION_DENIED');
        }

        // Show permission modal if not granted
        if (permissionStatus === 'prompt') {
            locationModal.show();
            return;
        }

        // Update button state and get location
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Getting Location...';
        button.disabled = true;

        const position = await getCurrentLocation();
        await showPosition(position);
    } catch (error) {
        showError(error);
    } finally {
        // Reset button state
        button.innerHTML = originalContent;
        button.disabled = false;
    }
});

/**
 * Update map with markers and route visualization
 * @param {google.maps.LatLng} pickupLocation - Pickup location coordinates
 * @param {google.maps.LatLng} dropLocation - Drop-off location coordinates
 */
function updateMap(pickupLocation, dropLocation) {
    const pickup = pickupLocation || (autocompletePickup.getPlace() && autocompletePickup.getPlace().geometry.location);
    const drop = dropLocation || (autocompleteDrop.getPlace() && autocompleteDrop.getPlace().geometry.location);

    if (pickup && drop) {
        // If both locations are available, calculate and display route
        calculateRoute(pickup, drop);
    } else if (pickup) {
        // If only pickup location is available, center map and add marker
        map.setCenter(pickup);
        map.setZoom(15);
        new google.maps.Marker({
            position: pickup,
            map: map,
            title: "Pickup Location",
            animation: google.maps.Animation.DROP
        });
    } else if (drop) {
        // If only drop location is available, center map and add marker
        map.setCenter(drop);
        map.setZoom(15);
        new google.maps.Marker({
            position: drop,
            map: map,
            title: "Drop Location",
            animation: google.maps.Animation.DROP
        });
    }
}

/**
 * Calculate and display route between two points
 * @param {google.maps.LatLng} pickup - Starting point coordinates
 * @param {google.maps.LatLng} drop - Destination coordinates
 */
function calculateRoute(pickup, drop) {
    const request = {
        origin: typeof pickup === 'string' ? pickup : { lat: pickup.lat(), lng: pickup.lng() },
        destination: typeof drop === 'string' ? drop : { lat: drop.lat(), lng: drop.lng() },
        travelMode: 'DRIVING'
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            // Display the route on the map
            directionsRenderer.setDirections(result);
            
            const route = result.routes[0];
            const leg = route.legs[0];
            
            // Update route information display
            const routeInfo = document.getElementById('routeInfo');
            routeInfo.classList.remove('d-none');
            routeInfo.querySelector('.distance').textContent = `Distance: ${leg.distance.text}`;
            routeInfo.querySelector('.duration').textContent = `Duration: ${leg.duration.text}`;
            
            // Adjust map bounds to fit the route
            map.fitBounds(route.bounds);
        } else {
            alert("Could not calculate the route. Please try again.");
        }
    });
}

/**
 * Handle form submission for fare comparison
 * Shows comparison modal and animates route display
 */
document.getElementById('cabBookingForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const button = this.querySelector('button[type="submit"]');
    const originalContent = button.innerHTML;
    const pickup = this.querySelector('input[placeholder="Enter pickup location"]').value;
    const drop = this.querySelector('input[placeholder="Enter drop location"]').value;

    try {
        // Update button state
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Comparing...';

        // Show the comparison modal
        comparisonModal.show();

        // Initialize map view
        map.setCenter({ lat: 20.5937, lng: 78.9629 });
        map.setZoom(5);

        // Add delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Calculate and display the route
        await calculateAndDisplayRoute(pickup, drop);

        // Fetch fare comparison data
        const response = await fetch('/api/compare-fares', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pickup, drop })
        });

        if (!response.ok) throw new Error('Failed to fetch fare comparison');

        const fares = await response.json();
        displayFareResults(fares);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch comparison. Please try again.');
    } finally {
        // Reset button state
        button.disabled = false;
        button.innerHTML = originalContent;
    }
});

// Calculate and display route with animation
async function calculateAndDisplayRoute(pickup, drop) {
    return new Promise((resolve, reject) => {
        const request = {
            origin: pickup,
            destination: drop,
            travelMode: 'DRIVING'
        };

        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
                
                const route = result.routes[0];
                const leg = route.legs[0];
                
                // Update route info with animation
                const routeInfo = document.getElementById('routeInfo');
                routeInfo.classList.remove('d-none');
                routeInfo.classList.add('fade-in');
                
                routeInfo.querySelector('.distance span').textContent = leg.distance.text;
                routeInfo.querySelector('.duration span').textContent = leg.duration.text;
                
                // Animate to route bounds
                const bounds = route.bounds;
                map.fitBounds(bounds);
                
                // Add markers with animation
                new google.maps.Marker({
                    position: leg.start_location,
                    map: map,
                    title: "Pickup Location",
                    animation: google.maps.Animation.DROP,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4f46e5",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#ffffff"
                    }
                });

                new google.maps.Marker({
                    position: leg.end_location,
                    map: map,
                    title: "Drop Location",
                    animation: google.maps.Animation.DROP,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#e11d48",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#ffffff"
                    }
                });

                resolve();
            } else {
                reject(new Error("Could not calculate the route"));
            }
        });
    });
}

// Display fare comparison results with animation
function displayFareResults(fares) {
    const fareList = document.getElementById('fareList');
    const fareResults = document.getElementById('fareResults');
    fareList.innerHTML = '';
    
    fares.forEach((service, index) => {
        service.Details.forEach((detail, detailIndex) => {
            const item = document.createElement('div');
            item.className = 'list-group-item fade-in';
            item.style.animationDelay = `${(index * 0.2 + detailIndex * 0.1)}s`;
            
            // Handle error state
            if (detail.Status === "Error") {
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="./assets/images/${service.Service.toLowerCase()}.png" 
                                 alt="${service.Service}" 
                                 class="provider-logo me-3"
                                 onerror="this.src='./assets/images/fallback-cab.png'">
                            <div>
                                <h5 class="mb-1">${service.Service}</h5>
                                <p class="mb-1 text-danger">Service temporarily unavailable</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="./assets/images/${service.Service.toLowerCase()}.png" 
                                 alt="${service.Service}" 
                                 class="provider-logo me-3"
                                 onerror="this.src='./assets/images/fallback-cab.png'">
                            <div>
                                <h5 class="mb-1">${service.Service} ${detail.Type || ''}</h5>
                                <p class="mb-1">ETA: ${detail.ETA}</p>
                            </div>
                        </div>
                        <div class="text-end">
                            <h4 class="mb-1">₹${detail.Fare}</h4>
                            <button class="btn btn-sm btn-outline-primary book-now-btn" 
                                    data-service="${service.Service.toLowerCase()}"
                                    data-type="${detail.Type || ''}"
                                    onclick="handleBooking(this)">
                                Book Now
                            </button>
                        </div>
                    </div>
                `;
            }
            
            fareList.appendChild(item);
        });
    });
    
    fareResults.classList.remove('d-none');
    fareResults.classList.add('slide-up');
}

// Handle booking button click
function handleBooking(button) {
    const service = button.dataset.service;
    const type = button.dataset.type;
    
    // Get the current route information
    const pickup = document.querySelector('input[placeholder="Enter pickup location"]').value;
    const drop = document.querySelector('input[placeholder="Enter drop location"]').value;
    
    // Redirect to appropriate booking service
    let bookingUrl;
    switch(service) {
        case 'uber':
            bookingUrl = `https://m.uber.com/ul/?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(drop)}`;
            break;
        case 'ola':
            bookingUrl = `https://book.olacabs.com/?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}`;
            break;
        case 'rapido':
            bookingUrl = `https://app.rapido.bike/booking?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}`;
            break;
        default:
            alert('Booking service not available');
            return;
    }
    
    window.open(bookingUrl, '_blank');
}

// Function to show current position on map
async function showPosition(position) {
    const { latitude, longitude } = position.coords;
    const currentLocation = { lat: latitude, lng: longitude };
    
    // Update pickup input with current location
    const geocoder = new google.maps.Geocoder();
    try {
        const result = await new Promise((resolve, reject) => {
            geocoder.geocode({ location: currentLocation }, (results, status) => {
                if (status === 'OK') resolve(results[0]);
                else reject(new Error('Geocoding failed'));
            });
        });
        
        document.getElementById('pickup').value = result.formatted_address;
        updateMap(currentLocation, null);
    } catch (error) {
        console.error('Error getting address:', error);
        alert('Could not get your current location address.');
    }
}

// Function to show errors
function showError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        <strong>Error:</strong> ${error.message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find the form container and insert the error at the top
    const form = document.querySelector('.service-card form');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Initialize map when page loads
function initializeApp() {
    // Initialize Google Maps
    if (typeof google === 'undefined') {
        console.error('Google Maps not loaded');
        return;
    }
    
    try {
        initMap();
        initFoodDelivery();
        initCabBooking();
        initLocationHandling();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Wait for Google Maps to load
if (window.google && window.google.maps) {
    initializeApp();
} else {
    window.initializeApp = initializeApp;
}

// Food Delivery Functionality
function initFoodDelivery() {
    const foodForm = document.getElementById('foodDeliveryForm');
    const foodResults = document.getElementById('foodResults');

    foodForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const button = this.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;

        try {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Comparing...';

            // Simulate API call to food delivery services
            const results = await compareFoodPrices();
            displayFoodResults(results);
            
            foodResults.style.display = 'block';
            foodResults.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error comparing food prices:', error);
            alert('Failed to fetch food prices. Please try again.');
        } finally {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    });
}

// Cab Booking Functionality
function initCabBooking() {
    const cabForm = document.getElementById('cabBookingForm');
    const cabResults = document.getElementById('cabResults');

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
            comparisonModal.show();

            // Initialize map view and calculate route
            await calculateAndDisplayRoute(pickup, drop);

            // Fetch fare comparison data from backend
            const response = await fetch('http://localhost:3000/get-fare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pickup, drop })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch comparison');
            }

            const fares = await response.json();
            displayFareResults(fares);
            
            // Show results
            cabResults.style.display = 'block';
            cabResults.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error comparing cab prices:', error);
            alert('Failed to fetch cab prices. Please try again.');
        } finally {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    });
}

// Simulate food price comparison
async function compareFoodPrices() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data - replace with actual API calls
    return [
        {
            provider: 'Zomato',
            price: '₹450',
            deliveryTime: '35-40 min',
            rating: 4.2,
            discount: '50% OFF up to ₹100'
        },
        {
            provider: 'Swiggy',
            price: '₹420',
            deliveryTime: '40-45 min',
            rating: 4.0,
            discount: '₹60 OFF'
        }
    ];
}

// Simulate cab price comparison
async function compareCabPrices() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data - replace with actual API calls
    return [
        {
            provider: 'Uber',
            price: '₹350',
            time: '5 mins away',
            type: 'UberGo',
            surge: 1.0
        },
        {
            provider: 'Ola',
            price: '₹330',
            time: '7 mins away',
            type: 'Mini',
            surge: 1.0
        }
    ];
}

// Display food delivery results
function displayFoodResults(results) {
    const container = document.querySelector('#foodResults .price-cards');
    container.innerHTML = '';

    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'price-card animate__animated animate__fadeIn';
        card.innerHTML = `
            <div class="price-info">
                <div class="d-flex align-items-center">
                    <strong class="me-2">${result.provider}</strong>
                    <span class="badge bg-success">${result.rating}★</span>
                </div>
                <div class="price-amount">${result.price}</div>
                <div class="delivery-time">
                    <i class="fas fa-clock me-1"></i>${result.deliveryTime}
                </div>
                <div class="text-success">
                    <i class="fas fa-tag me-1"></i>${result.discount}
                </div>
            </div>
            <button class="btn btn-sm btn-outline-primary">Order Now</button>
        `;
        container.appendChild(card);
    });
}

// Display cab booking results
function displayCabResults(results) {
    const container = document.querySelector('#cabResults .price-cards');
    container.innerHTML = '';

    results.forEach(result => {
        const card = document.createElement('div');
        card.className = 'price-card animate__animated animate__fadeIn';
        card.innerHTML = `
            <div class="price-info">
                <div class="d-flex align-items-center">
                    <strong class="me-2">${result.provider}</strong>
                    <span class="badge bg-primary">${result.type}</span>
                </div>
                <div class="price-amount">${result.price}</div>
                <div class="delivery-time">
                    <i class="fas fa-clock me-1"></i>${result.time}
                </div>
                ${result.surge > 1 ? `
                    <div class="text-warning">
                        <i class="fas fa-bolt me-1"></i>${result.surge}x Surge
                    </div>
                ` : ''}
            </div>
            <button class="btn btn-sm btn-outline-primary">Book Now</button>
        `;
        container.appendChild(card);
    });
}

// Initialize location functionality
function initLocationHandling() {
    const locationButtons = document.querySelectorAll('.use-location-btn');
    
    locationButtons.forEach(button => {
        button.addEventListener('click', async function(event) {
            event.preventDefault();
            const button = event.currentTarget;
            const originalContent = button.innerHTML;
            const form = button.closest('form');
            const inputField = form.querySelector('input[placeholder*="pickup location"], input[placeholder*="delivery"]');

            try {
                // Check if geolocation is supported
                if (!navigator.geolocation) {
                    throw new Error("Geolocation is not supported by your browser");
                }

                // Update button state
                button.disabled = true;
                button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Getting Location...';

                // Get current position
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    });
                });

                // Initialize geocoder
                const geocoder = new google.maps.Geocoder();
                
                // Convert coordinates to address
                geocoder.geocode(
                    { 
                        location: { 
                            lat: position.coords.latitude, 
                            lng: position.coords.longitude 
                        } 
                    },
                    (results, status) => {
                        if (status === 'OK' && results[0]) {
                            const address = results[0].formatted_address;
                            inputField.value = address;
                            
                            // If this is the cab booking form, update the map
                            if (form.id === 'cabBookingForm') {
                                const location = { 
                                    lat: position.coords.latitude, 
                                    lng: position.coords.longitude 
                                };
                                updateMap(location, null);
                            }
                            
                            // Success feedback
                            button.classList.add('btn-success');
                            button.innerHTML = '<i class="fas fa-check me-2"></i>Location Found';
                            
                            // Reset button after 2 seconds
                            setTimeout(() => {
                                button.classList.remove('btn-success');
                                button.disabled = false;
                                button.innerHTML = originalContent;
                            }, 2000);
                        } else {
                            throw new Error('Could not get address for this location');
                        }
                    }
                );

            } catch (error) {
                console.error('Error getting location:', error);
                
                // Error feedback
                button.classList.add('btn-danger');
                button.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Location Error';
                
                // Show error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-2';
                errorDiv.innerHTML = `
                    <strong>Error:</strong> ${error.message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                button.parentNode.insertBefore(errorDiv, button.nextSibling);
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    button.classList.remove('btn-danger');
                    button.disabled = false;
                    button.innerHTML = originalContent;
                }, 2000);
                
                // Auto dismiss error after 5 seconds
                setTimeout(() => {
                    errorDiv.remove();
                }, 5000);
            }
        });
    });
}

function showLocationModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('locationModal')) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'locationModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-location-arrow me-2"></i>Location Access Required
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Please enable location access in your browser settings to use this feature. Here's how:</p>
                        <ol>
                            <li>Click the lock/info icon in your browser's address bar</li>
                            <li>Find "Location" in the permissions list</li>
                            <li>Change the setting to "Allow"</li>
                            <li>Refresh the page</li>
                        </ol>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="window.location.reload()">
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Show the modal
    const locationModal = new bootstrap.Modal(document.getElementById('locationModal'));
    locationModal.show();
}
