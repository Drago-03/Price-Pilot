let map, directionsService, directionsRenderer;
let autocompletePickup, autocompleteDrop;
let locationModal, loginModal;
let isLoggedIn = false;

// Initialize Google Maps and Autocomplete
function initMap() {
    // Initialize Bootstrap modals
    locationModal = new bootstrap.Modal(document.getElementById('locationModal'));
    loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    
    // Show login modal and start login process
    loginModal.show();
    startLoginProcess();

    // Initialize the map centered on India
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{ "color": "#f5f5f5" }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#c9c9c9" }]
            }
        ]
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true
    });

    // Initialize autocomplete for pickup and drop locations
    const pickupInput = document.getElementById('pickup');
    const dropInput = document.getElementById('drop');

    const autocompleteOptions = {
        componentRestrictions: { country: "in" },
        fields: ["formatted_address", "geometry", "name"],
        strictBounds: false
    };

    autocompletePickup = new google.maps.places.Autocomplete(pickupInput, autocompleteOptions);
    autocompleteDrop = new google.maps.places.Autocomplete(dropInput, autocompleteOptions);

    // Add place_changed listeners
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

// Function to check location permission
async function checkLocationPermission() {
    try {
        if (navigator.permissions && navigator.permissions.query) {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            return result.state;
        }
        return 'prompt'; // Default to prompt if permissions API is not available
    } catch (error) {
        console.error('Error checking location permission:', error);
        return 'prompt';
    }
}

// Function to get current location
async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => resolve(position),
            error => reject(error),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Update the click handler for current location button
document.getElementById('currentLocationBtn').addEventListener('click', async function() {
    const button = this;
    const originalContent = button.innerHTML;
    
    try {
        if (!navigator.geolocation) {
            throw new Error("Geolocation is not supported by this browser.");
        }

        const permissionStatus = await checkLocationPermission();
        
        if (permissionStatus === 'denied') {
            throw new Error('PERMISSION_DENIED');
        }

        if (permissionStatus === 'prompt') {
            locationModal.show();
            return;
        }

        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Getting Location...';
        button.disabled = true;

        const position = await getCurrentLocation();
        await showPosition(position);
    } catch (error) {
        showError(error);
    } finally {
        button.innerHTML = originalContent;
        button.disabled = false;
    }
});

// Update map with markers and route
function updateMap(pickupLocation, dropLocation) {
    const pickup = pickupLocation || (autocompletePickup.getPlace() && autocompletePickup.getPlace().geometry.location);
    const drop = dropLocation || (autocompleteDrop.getPlace() && autocompleteDrop.getPlace().geometry.location);

    if (pickup && drop) {
        calculateRoute(pickup, drop);
    } else if (pickup) {
        map.setCenter(pickup);
        map.setZoom(15);
        new google.maps.Marker({
            position: pickup,
            map: map,
            title: "Pickup Location",
            animation: google.maps.Animation.DROP
        });
    } else if (drop) {
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

// Calculate and display route
function calculateRoute(pickup, drop) {
    const request = {
        origin: typeof pickup === 'string' ? pickup : { lat: pickup.lat(), lng: pickup.lng() },
        destination: typeof drop === 'string' ? drop : { lat: drop.lat(), lng: drop.lng() },
        travelMode: 'DRIVING'
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            const route = result.routes[0];
            const leg = route.legs[0];
            
            // Update route info
            const routeInfo = document.getElementById('routeInfo');
            routeInfo.classList.remove('d-none');
            routeInfo.querySelector('.distance').textContent = `Distance: ${leg.distance.text}`;
            routeInfo.querySelector('.duration').textContent = `Duration: ${leg.duration.text}`;
            
            // Fit map to route bounds
            map.fitBounds(route.bounds);
        } else {
            alert("Could not calculate the route. Please try again.");
        }
    });
}

// Initialize map when page loads
window.onload = initMap;

// Function to start the login process
async function startLoginProcess() {
    try {
        const response = await fetch('http://localhost:3000/start-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber: '9805763104' })
        });

        if (!response.ok) {
            throw new Error('Failed to start login process');
        }

        console.log('Login process started successfully');
    } catch (error) {
        console.error('Error starting login process:', error);
        alert('Failed to start login process. Please try again.');
    }
}

// Handle login form submission (OTP verification)
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const button = document.getElementById('loginButton');
    const otpInput = document.getElementById('otpInput');

    try {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';

        const response = await fetch('http://localhost:3000/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: '9805763104',
                otp: otpInput.value
            })
        });

        if (!response.ok) throw new Error('Failed to verify OTP');

        const result = await response.json();
        updateLoginStatus(result.services);

        if (result.allServicesLoggedIn) {
            isLoggedIn = true;
            loginModal.hide();
        } else {
            alert('Not all services were logged in successfully. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to verify OTP. Please try again.');
    } finally {
        button.disabled = false;
        button.innerHTML = 'Verify OTP';
    }
});

// Update login status in the modal
function updateLoginStatus(services) {
    const statusElements = document.querySelectorAll('.service-status .status');
    statusElements.forEach(element => {
        const service = element.parentElement.textContent.toLowerCase();
        if (service.includes('uber') && services.uber) {
            element.textContent = 'Logged in';
            element.classList.add('text-success');
        } else if (service.includes('ola') && services.ola) {
            element.textContent = 'Logged in';
            element.classList.add('text-success');
        } else if (service.includes('rapido') && services.rapido) {
            element.textContent = 'Logged in';
            element.classList.add('text-success');
        }
    });
}

// Modify the form submission handler to check login status
document.getElementById('locationForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!isLoggedIn) {
        loginModal.show();
        return;
    }

    const pickup = document.getElementById('pickup').value;
    const drop = document.getElementById('drop').value;
    const filterType = document.querySelector('input[name="filter"]:checked').value;

    if (!pickup || !drop) {
        alert("Please enter both pickup and drop locations.");
        return;
    }

    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    submitButton.disabled = true;

    // Calculate and display route
    calculateRoute(pickup, drop);

    // Fetch cab prices
    try {
        const response = await fetch('http://localhost:3000/get-fare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pickup: pickup,
                drop: drop
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        document.getElementById('fareResults').classList.remove('d-none');
        
        // Create results array with additional data
        const results = [
            { 
                provider: 'Uber',
                fare: data[0].Details[0].Fare,
                eta: data[0].Details[0].ETA || '15-20',
                loginUrl: `https://m.uber.com/looking?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(drop)}`,
                logo: 'https://img.icons8.com/color/48/000000/uber.png'
            },
            { 
                provider: 'Ola',
                fare: data[1].Details[0].Fare,
                eta: data[1].Details[0].ETA || '12-18',
                loginUrl: `https://book.olacabs.com/?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(drop)}`,
                logo: 'https://img.icons8.com/color/48/000000/ola-cabs.png'
            },
            { 
                provider: 'Rapido',
                fare: data[2].Details[0].Fare,
                eta: data[2].Details[0].ETA || '20-25',
                loginUrl: `https://app.rapido.bike/book-ride?pickup=${encodeURIComponent(pickup)}&dropoff=${encodeURIComponent(drop)}`,
                logo: 'https://play-lh.googleusercontent.com/L0bGBHgj9e4OP1RG4-eDQDLEdeR_x1DQtUf4II_z2qJ15cKutSqgvxPgWV9N3GWPpQ'
            }
        ];

        // Sort results based on filter type
        results.sort((a, b) => {
            if (filterType === 'cheapest') {
                return a.fare - b.fare;
            } else {
                const getAverageMinutes = (eta) => {
                    const [min, max] = eta.split('-').map(Number);
                    return (min + max) / 2;
                };
                return getAverageMinutes(a.eta) - getAverageMinutes(b.eta);
            }
        });

        const fareList = document.getElementById('fareList');
        fareList.innerHTML = '';

        // Append results with deep linking
        results.forEach((result, index) => {
            const item = document.createElement('a');
            item.href = result.loginUrl;
            item.className = 'list-group-item list-group-item-action';
            item.target = '_blank';
            
            const content = `
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <img src="${result.logo}" alt="${result.provider}" class="provider-logo">
                        <div class="ms-3">
                            <strong>${result.provider}</strong>
                            ${index === 0 ? 
                                `<span class="badge bg-success ms-2">
                                    ${filterType === 'cheapest' ? 'Best Price' : 'Fastest'}
                                </span>` : 
                                ''}
                            <div class="text-muted small">ETA: ${result.eta} mins</div>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="fare-price">₹${result.fare}</div>
                        <div class="text-muted small">Book Now →</div>
                    </div>
                </div>
            `;
            
            item.innerHTML = content;
            fareList.appendChild(item);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch fare prices. Please try again.');
    } finally {
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
});

// Show the user's current location in the Pickup input field
function showPosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK') {
            if (results[0]) {
                document.getElementById('pickup').value = results[0].formatted_address;
                
                // Center map on current location
                map.setCenter(latlng);
                map.setZoom(15);
                
                // Add marker for current location
                new google.maps.Marker({
                    position: latlng,
                    map: map,
                    title: "Your Location",
                    animation: google.maps.Animation.DROP
                });
            } else {
                alert('No address found for this location.');
            }
        } else {
            alert('Failed to get address for this location. Please try again.');
        }
    });
}

// Handle Geolocation Errors
function showError(error) {
    let message;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "Please allow location access to use this feature.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable. Please try again.";
            break;
        case error.TIMEOUT:
            message = "Location request timed out. Please try again.";
            break;
        case error.UNKNOWN_ERROR:
            message = "An unknown error occurred. Please try again.";
            break;
    }
    alert(message);
}
