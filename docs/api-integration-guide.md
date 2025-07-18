# API Integration Guide for Third-Party Partners

## Overview

ServiciosHogar.com.ar provides a comprehensive REST API for third-party integrations and partnerships. This guide covers authentication, available endpoints, webhooks, and best practices for integrating with our platform.

## Authentication

All API requests require authentication using API keys provided through our partner program.

### API Key Authentication

Include your API key in the request header:

```
X-API-Key: your-api-key-here
```

Or as a Bearer token:

```
Authorization: Bearer your-api-key-here
```

### Getting API Keys

1. Contact our partnership team to register as a partner
2. Admin approval and partner verification process
3. API keys generated through the admin panel with specific scopes and permissions
4. Keys can have rate limits, expiration dates, and IP restrictions

## API Versioning

Current API version: **v1**

All endpoints are prefixed with `/api/v1/`

Base URL: `https://servicioshogar.com.ar/api/v1/`

## Rate Limiting

- **Default:** 1000 requests per minute per API key
- **Burst:** Individual endpoints may have additional rate limits
- **Headers:** Rate limit information included in response headers
- **429 Status:** Returned when rate limit exceeded

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Available Endpoints

### Categories

Get service categories with statistics:

```http
GET /api/v1/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Plomería",
      "requestCount": 150,
      "avgPrice": 25000
    }
  ],
  "meta": {
    "total": 8,
    "version": "v1",
    "timestamp": "2025-07-18T10:30:00Z"
  }
}
```

### Service Providers

Get verified service providers:

```http
GET /api/v1/providers?limit=50&offset=0&verified=true&city=Buenos Aires
```

**Query Parameters:**
- `limit` (default: 50) - Number of results per page
- `offset` (default: 0) - Results offset for pagination
- `verified` (default: true) - Filter by verification status
- `city` - Filter by city name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "businessName": "Plomería Profesional BA",
      "description": "Servicios de plomería residencial y comercial",
      "city": "Buenos Aires",
      "province": "CABA",
      "rating": 4.8,
      "totalReviews": 45,
      "isVerified": true,
      "experienceYears": 8,
      "hourlyRate": 3500,
      "createdAt": "2025-01-15T08:00:00Z"
    }
  ],
  "meta": {
    "total": 250,
    "limit": 50,
    "offset": 0,
    "version": "v1",
    "timestamp": "2025-07-18T10:30:00Z"
  }
}
```

### Service Requests

Get service requests data (requires `requests:read` scope):

```http
GET /api/v1/requests?limit=50&status=pending&categoryId=1
```

**Query Parameters:**
- `limit` (default: 50) - Number of results per page
- `offset` (default: 0) - Results offset for pagination
- `status` - Filter by request status (pending, quoted, accepted, in_progress, completed, cancelled)
- `categoryId` - Filter by service category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "title": "Reparación de grifo que gotea",
      "description": "Grifo de la cocina que gotea constantemente",
      "status": "pending",
      "budget": 15000,
      "city": "Buenos Aires",
      "categoryId": 1,
      "createdAt": "2025-07-18T09:15:00Z",
      "scheduledDate": "2025-07-20T14:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "version": "v1",
    "timestamp": "2025-07-18T10:30:00Z"
  }
}
```

### Analytics

Get platform analytics (requires `analytics:read` scope):

```http
GET /api/v1/analytics?period=30d
```

**Query Parameters:**
- `period` - Time period for analytics (7d, 30d, 90d)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProviders": 850,
    "activeProviders": 720,
    "totalRequests": 2340,
    "completedRequests": 1890,
    "period": "30d"
  },
  "meta": {
    "version": "v1",
    "timestamp": "2025-07-18T10:30:00Z"
  }
}
```

## Webhooks

Receive real-time notifications about platform events.

### Webhook Events

Available webhook events:

- `user.created` - New user registration
- `provider.verified` - Service provider verification
- `request.created` - New service request
- `request.completed` - Service request completion
- `payment.processed` - Payment processing
- `review.created` - New review submission

### Webhook Configuration

Configure webhook URLs in your partner settings. Webhooks are sent as POST requests with the following format:

```json
{
  "event": "request.created",
  "data": {
    "requestId": 456,
    "title": "Reparación de grifo que gotea",
    "description": "Grifo de la cocina que gotea constantemente",
    "budget": 15000,
    "location": "Buenos Aires",
    "categoryId": 1,
    "scheduledDate": "2025-07-20T14:00:00Z",
    "urgency": "medium",
    "createdAt": "2025-07-18T09:15:00Z"
  },
  "timestamp": "2025-07-18T09:15:00Z",
  "source": "ServiciosHogar.com.ar"
}
```

### Webhook Headers

```
Content-Type: application/json
User-Agent: ServiciosHogar-Webhook/1.0
X-Webhook-Event: request.created
X-Webhook-Timestamp: 2025-07-18T09:15:00Z
```

### Webhook Retry Logic

- **Initial delivery:** Immediate
- **Retry attempts:** Up to 3 retries
- **Retry delay:** Exponential backoff (2^attempt minutes)
- **Timeout:** 30 seconds per request
- **Success:** HTTP 2xx response codes
- **Failure:** HTTP 4xx/5xx response codes or timeout

### Webhook Security

1. **HTTPS only:** All webhooks delivered over HTTPS
2. **IP verification:** Optional IP whitelist for webhook delivery
3. **Signature verification:** HMAC signature for request verification (coming soon)

## Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": "Invalid API key",
  "code": 401,
  "timestamp": "2025-07-18T10:30:00Z"
}
```

### Common Errors

1. **Invalid API Key**
   ```json
   {
     "error": "Invalid or inactive API key",
     "code": 401
   }
   ```

2. **Insufficient Permissions**
   ```json
   {
     "error": "Insufficient permissions for this endpoint",
     "code": 403
   }
   ```

3. **Rate Limit Exceeded**
   ```json
   {
     "error": "Too many requests, please try again later",
     "code": 429
   }
   ```

4. **Monthly Limit Exceeded**
   ```json
   {
     "error": "Monthly request limit exceeded",
     "code": 429
   }
   ```

## SDK and Libraries

### JavaScript/Node.js Example

```javascript
const ServiciosHogarAPI = {
  baseURL: 'https://servicioshogar.com.ar/api/v1',
  apiKey: 'your-api-key',
  
  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async getCategories() {
    return this.request('/categories');
  },
  
  async getProviders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/providers?${query}`);
  },
  
  async getAnalytics(period = '30d') {
    return this.request(`/analytics?period=${period}`);
  }
};

// Usage
try {
  const categories = await ServiciosHogarAPI.getCategories();
  console.log('Categories:', categories.data);
} catch (error) {
  console.error('API Error:', error.message);
}
```

### Python Example

```python
import requests
import json

class ServiciosHogarAPI:
    def __init__(self, api_key):
        self.base_url = 'https://servicioshogar.com.ar/api/v1'
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })
    
    def request(self, endpoint, method='GET', **kwargs):
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    def get_categories(self):
        return self.request('/categories')
    
    def get_providers(self, **params):
        return self.request('/providers', params=params)
    
    def get_analytics(self, period='30d'):
        return self.request('/analytics', params={'period': period})

# Usage
api = ServiciosHogarAPI('your-api-key')

try:
    categories = api.get_categories()
    print(f"Found {len(categories['data'])} categories")
    
    providers = api.get_providers(verified=True, limit=10)
    print(f"Found {providers['meta']['total']} verified providers")
    
except requests.exceptions.HTTPError as e:
    print(f"API Error: {e}")
```

## Integration Patterns

### 1. Lead Management System

Integrate with our platform to:
- Monitor new service requests (`request.created` webhook)
- Track provider responses and quotes
- Analyze market demand by category and location

### 2. CRM Integration

Sync data between platforms:
- Import verified providers to your CRM
- Track customer interactions and service history
- Maintain up-to-date provider ratings and reviews

### 3. Analytics Dashboard

Build custom dashboards:
- Fetch real-time platform statistics
- Monitor category performance trends
- Track provider activity and engagement

### 4. Marketing Automation

Leverage platform data for marketing:
- Identify high-demand service categories
- Target verified providers in specific locations
- Track conversion rates and ROI

## Best Practices

### 1. Rate Limit Management

```javascript
class RateLimitedAPI {
  constructor(apiKey, requestsPerMinute = 900) {
    this.apiKey = apiKey;
    this.requestQueue = [];
    this.requestsPerMinute = requestsPerMinute;
    this.requestInterval = 60000 / requestsPerMinute;
    this.lastRequestTime = 0;
  }
  
  async makeRequest(endpoint, options) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.requestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
    return this.request(endpoint, options);
  }
}
```

### 2. Error Handling and Retries

```javascript
async function makeRequestWithRetry(endpoint, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await api.request(endpoint, options);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### 3. Webhook Handling

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook/servicioshogar', (req, res) => {
  const { event, data, timestamp } = req.body;
  
  // Verify webhook signature (when available)
  // const signature = req.headers['x-webhook-signature'];
  // if (!verifySignature(req.body, signature)) {
  //   return res.status(401).send('Unauthorized');
  // }
  
  try {
    switch (event) {
      case 'request.created':
        handleNewRequest(data);
        break;
      case 'provider.verified':
        handleProviderVerification(data);
        break;
      case 'payment.processed':
        handlePaymentProcessed(data);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Error processing webhook');
  }
});

async function handleNewRequest(data) {
  // Update your CRM, send notifications, etc.
  console.log(`New service request: ${data.title}`);
  
  // Example: Add to your lead management system
  await yourCRM.addLead({
    source: 'ServiciosHogar',
    title: data.title,
    budget: data.budget,
    location: data.location,
    category: data.categoryId
  });
}
```

### 4. Data Synchronization

```javascript
class DataSync {
  constructor(api) {
    this.api = api;
    this.syncInterval = 60 * 60 * 1000; // 1 hour
  }
  
  async syncProviders() {
    let offset = 0;
    const limit = 50;
    
    while (true) {
      const response = await this.api.getProviders({ 
        limit, 
        offset, 
        verified: true 
      });
      
      const providers = response.data;
      if (providers.length === 0) break;
      
      await this.processProviders(providers);
      
      if (providers.length < limit) break;
      offset += limit;
    }
  }
  
  async processProviders(providers) {
    for (const provider of providers) {
      await this.updateLocalProvider(provider);
    }
  }
  
  startSync() {
    setInterval(() => {
      this.syncProviders().catch(console.error);
    }, this.syncInterval);
  }
}
```

## Monitoring and Analytics

### Request Logging

All API requests are logged and can be monitored through the admin panel:

- Request count and success rates
- Response times and performance metrics
- Error rates and common failure patterns
- Bandwidth usage and data transfer

### Usage Analytics

Partners have access to:

- Real-time usage statistics
- Monthly request summaries
- Performance benchmarks
- Rate limit utilization

## Support and Resources

### Documentation

- **API Reference:** Complete endpoint documentation
- **Integration Examples:** Sample code and use cases
- **Webhook Reference:** Event types and payload schemas
- **Status Page:** API status and maintenance notifications

### Support Channels

1. **Technical Documentation:** https://servicioshogar.com.ar/docs/api
2. **Partner Support:** partnerships@servicioshogar.com.ar
3. **Developer Forum:** Community discussion and Q&A
4. **Status Updates:** Real-time API status and announcements

### Partner Program

Join our partner program to access:

- Dedicated integration support
- Priority technical assistance
- Beta access to new features
- Revenue sharing opportunities
- Co-marketing initiatives

Contact us at partnerships@servicioshogar.com.ar to get started.

## Changelog

### Version 1.0 (July 2025)
- Initial API release
- Categories, providers, and requests endpoints
- Webhook system implementation
- Rate limiting and authentication
- Admin analytics and monitoring

### Coming Soon
- Signature verification for webhooks
- GraphQL API support
- Advanced filtering and search capabilities
- Real-time WebSocket connections
- Enhanced analytics and reporting tools

---

This guide provides everything needed to integrate with ServiciosHogar.com.ar's API. For questions or additional support, please contact our partnership team.