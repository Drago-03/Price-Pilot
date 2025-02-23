const axios = require('axios');
const crypto = require('node:crypto');
const { Client } = require('@googlemaps/google-maps-services-js');

class BecknClient {
    constructor(config) {
        this.subscriberId = config.subscriberId;
        this.subscriberUri = config.subscriberUri;
        this.privateKey = config.privateKey;
        this.publicKey = config.publicKey;
        this.uniqueKey = config.uniqueKey;
        this.city = config.city;
        this.country = config.country;
    }

    // Create Beckn request headers
    createAuthorizationHeader(message) {
        const created = Math.floor(Date.now() / 1000);
        const expires = created + 3600; // 1 hour expiry
        
        const signature = this.createSignature(message, created, expires);
        
        return {
            'Authorization': `Signature keyId="${this.subscriberId}|${this.uniqueKey}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`,
            'Content-Type': 'application/json'
        };
    }

    // Create cryptographic signature
    createSignature(message, created, expires) {
        const digest = crypto
            .createHash('sha256')
            .update(JSON.stringify(message))
            .digest('hex');
        
        const signingString = `(created): ${created}
(expires): ${expires}
digest: BLAKE-512=${digest}`;

        const signature = crypto
            .createSign('SHA256')
            .update(signingString)
            .sign(this.privateKey, 'base64');
        
        return signature;
    }

    // Send search request to Beckn network
    async search(intent) {
        const message = {
            context: {
                domain: "mobility",
                country: this.country,
                city: this.city,
                action: "search",
                timestamp: new Date().toISOString(),
                message_id: crypto.randomUUID(),
                transaction_id: crypto.randomUUID(),
                subscriber_id: this.subscriberId,
                subscriber_uri: this.subscriberUri
            },
            message: {
                intent: intent
            }
        };

        const headers = this.createAuthorizationHeader(message);
        
        try {
            const response = await axios.post('/search', message, { headers });
            return response.data;
        } catch (error) {
            console.error('Beckn search request failed:', error);
            throw error;
        }
    }

    // Initialize order
    async init(order) {
        const message = {
            context: {
                domain: "mobility",
                country: this.country,
                city: this.city,
                action: "init",
                timestamp: new Date().toISOString(),
                message_id: crypto.randomUUID(),
                transaction_id: crypto.randomUUID(),
                subscriber_id: this.subscriberId,
                subscriber_uri: this.subscriberUri
            },
            message: {
                order: order
            }
        };

        const headers = this.createAuthorizationHeader(message);
        
        try {
            const response = await axios.post('/init', message, { headers });
            return response.data;
        } catch (error) {
            console.error('Beckn init request failed:', error);
            throw error;
        }
    }

    // Confirm order
    async confirm(order) {
        const message = {
            context: {
                domain: "mobility",
                country: this.country,
                city: this.city,
                action: "confirm",
                timestamp: new Date().toISOString(),
                message_id: crypto.randomUUID(),
                transaction_id: crypto.randomUUID(),
                subscriber_id: this.subscriberId,
                subscriber_uri: this.subscriberUri
            },
            message: {
                order: order
            }
        };

        const headers = this.createAuthorizationHeader(message);
        
        try {
            const response = await axios.post('/confirm', message, { headers });
            return response.data;
        } catch (error) {
            console.error('Beckn confirm request failed:', error);
            throw error;
        }
    }

    // Track order status
    async status(orderId) {
        const message = {
            context: {
                domain: "mobility",
                country: this.country,
                city: this.city,
                action: "status",
                timestamp: new Date().toISOString(),
                message_id: crypto.randomUUID(),
                transaction_id: crypto.randomUUID(),
                subscriber_id: this.subscriberId,
                subscriber_uri: this.subscriberUri
            },
            message: {
                order_id: orderId
            }
        };

        const headers = this.createAuthorizationHeader(message);
        
        try {
            const response = await axios.post('/status', message, { headers });
            return response.data;
        } catch (error) {
            console.error('Beckn status request failed:', error);
            throw error;
        }
    }
}

module.exports = BecknClient; 