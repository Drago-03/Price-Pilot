const BecknClient = require('../core/client');

class MobilityService {
    constructor(config) {
        this.becknClient = new BecknClient(config);
    }

    // Search for available cabs
    async searchCabs(pickup, drop) {
        const intent = {
            fulfillment: {
                start: {
                    location: {
                        gps: pickup // Format: "lat,long"
                    }
                },
                end: {
                    location: {
                        gps: drop // Format: "lat,long"
                    }
                }
            },
            category: {
                id: "mobility"
            }
        };

        try {
            const searchResults = await this.becknClient.search(intent);
            return this.transformSearchResults(searchResults);
        } catch (error) {
            console.error('Failed to search cabs:', error);
            throw error;
        }
    }

    // Transform Beckn search results to application format
    transformSearchResults(becknResults) {
        const providers = becknResults.message.catalog.providers || [];
        
        return providers.map(provider => ({
            Service: provider.descriptor.name,
            Details: provider.items.map(item => ({
                Type: item.descriptor.name,
                Fare: this.extractFare(item.price),
                ETA: this.extractETA(item.fulfillment_start_time),
                Status: "Available",
                DeepLink: this.generateDeepLink(provider.descriptor.name, item)
            }))
        }));
    }

    // Extract fare from Beckn price object
    extractFare(priceObj) {
        if (!priceObj) return "N/A";
        return `₹${priceObj.value}`;
    }

    // Extract and format ETA
    extractETA(timestamp) {
        if (!timestamp) return "N/A";
        const eta = new Date(timestamp) - new Date();
        const minutes = Math.round(eta / (1000 * 60));
        return `${minutes} mins`;
    }

    // Generate deep links for different providers
    generateDeepLink(provider, item) {
        const baseUrls = {
            'Uber': 'https://m.uber.com/ul/',
            'Ola': 'https://book.olacabs.com',
            'Rapido': 'https://app.rapido.bike/booking'
        };

        const baseUrl = baseUrls[provider] || '';
        if (!baseUrl) return null;

        const params = new URLSearchParams({
            pickup_lat: item.fulfillment.start.location.gps.split(',')[0],
            pickup_lng: item.fulfillment.start.location.gps.split(',')[1],
            dropoff_lat: item.fulfillment.end.location.gps.split(',')[0],
            dropoff_lng: item.fulfillment.end.location.gps.split(',')[1],
            product_id: item.id
        });

        return `${baseUrl}?${params.toString()}`;
    }

    // Initialize a cab booking
    async initBooking(provider, item) {
        const order = {
            provider: {
                id: provider.id
            },
            items: [{
                id: item.id,
                quantity: 1
            }],
            fulfillment: {
                type: "RIDE",
                start: item.fulfillment.start,
                end: item.fulfillment.end
            }
        };

        try {
            const initResult = await this.becknClient.init(order);
            return this.transformInitResult(initResult);
        } catch (error) {
            console.error('Failed to initialize booking:', error);
            throw error;
        }
    }

    // Transform init result
    transformInitResult(initResult) {
        return {
            bookingId: initResult.message.order.id,
            provider: initResult.message.order.provider.descriptor.name,
            status: initResult.message.order.state,
            price: this.extractFare(initResult.message.order.quote.price),
            eta: this.extractETA(initResult.message.order.fulfillment.start_time)
        };
    }

    // Confirm a cab booking
    async confirmBooking(bookingId) {
        try {
            const confirmResult = await this.becknClient.confirm({ id: bookingId });
            return this.transformConfirmResult(confirmResult);
        } catch (error) {
            console.error('Failed to confirm booking:', error);
            throw error;
        }
    }

    // Transform confirm result
    transformConfirmResult(confirmResult) {
        return {
            bookingId: confirmResult.message.order.id,
            status: confirmResult.message.order.state,
            tracking: {
                url: confirmResult.message.order.fulfillment.tracking,
                status: confirmResult.message.order.fulfillment.state.descriptor.name
            }
        };
    }

    // Track booking status
    async trackBooking(bookingId) {
        try {
            const statusResult = await this.becknClient.status(bookingId);
            return this.transformStatusResult(statusResult);
        } catch (error) {
            console.error('Failed to track booking:', error);
            throw error;
        }
    }

    // Transform status result
    transformStatusResult(statusResult) {
        return {
            bookingId: statusResult.message.order.id,
            status: statusResult.message.order.state,
            vehicle: {
                number: statusResult.message.order.fulfillment.vehicle.registration,
                model: statusResult.message.order.fulfillment.vehicle.category
            },
            driver: {
                name: statusResult.message.order.fulfillment.agent.name,
                phone: statusResult.message.order.fulfillment.agent.phone
            },
            tracking: {
                url: statusResult.message.order.fulfillment.tracking,
                status: statusResult.message.order.fulfillment.state.descriptor.name
            }
        };
    }
}

module.exports = MobilityService; 