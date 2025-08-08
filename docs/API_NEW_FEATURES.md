# API Documentation - New Features

## Business Intelligence Dashboard

### Analytics Endpoints

#### `GET /api/analytics/dashboard`
Returns comprehensive dashboard metrics including:
- Total providers and verified providers count
- Service requests statistics
- Revenue analytics with monthly breakdowns
- User activity metrics
- Provider performance data

**Query Parameters:**
- `startDate` (optional): Filter data from this date (ISO 8601)
- `endDate` (optional): Filter data until this date (ISO 8601)

**Response:**
```json
{
  "totalProviders": 150,
  "verifiedProviders": 120,
  "totalRequests": 450,
  "revenueData": [
    {
      "month": "2024-01-01",
      "revenue": 125000,
      "transactions": 45
    }
  ],
  "userActivity": [
    {
      "event": "provider_view",
      "count": 1250
    }
  ],
  "topProviders": [
    {
      "id": 1,
      "businessName": "Plomería Express",
      "totalRevenue": 50000,
      "avgRating": "4.8"
    }
  ]
}
```

#### `GET /api/analytics/performance`
Returns system performance metrics including:
- Response times
- Active user counts
- System health indicators

#### `POST /api/analytics/track`
Track custom analytics events.

**Request Body:**
```json
{
  "eventType": "provider_view",
  "userId": 123,
  "metadata": {
    "providerId": 456,
    "source": "search"
  }
}
```

## Enhanced Social Features

### Photo Upload API

#### `POST /api/upload/photo`
Upload a single photo for reviews.

**Request:** Multipart form data with `photo` field
**File Limits:** 5MB max, image types only
**Response:**
```json
{
  "success": true,
  "photoUrl": "/uploads/photos/photo-1234567890-123456789.jpg",
  "filename": "photo-1234567890-123456789.jpg"
}
```

#### `POST /api/upload/photos`
Upload multiple photos (up to 4) for reviews.

### Enhanced Reviews

Reviews now support:
- **Multiple photos** (up to 4 images, 5MB each)
- **Detailed rating breakdown:**
  - `workQuality` (1-5)
  - `communication` (1-5) 
  - `punctuality` (1-5)
  - `value` (1-5)
- **Quality tags** for categorizing service aspects
- **Provider responses** to reviews
- **Verification badges** for authenticated reviews
- **Community voting** (helpful/not helpful)

**Example Enhanced Review:**
```json
{
  "id": 123,
  "serviceRequestId": 456,
  "rating": 4.5,
  "comment": "Excellent work, very professional",
  "photos": [
    "/uploads/photos/before-work.jpg",
    "/uploads/photos/after-work.jpg"
  ],
  "workQuality": 5,
  "communication": 4,
  "punctuality": 5,
  "value": 4,
  "tags": ["professional", "clean-work", "on-time"],
  "isVerified": true,
  "helpfulCount": 12,
  "responseFromProvider": "Thank you for the great review!",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Progressive Web App (PWA)

### Service Worker Features

The PWA implementation includes:

#### **Caching Strategies:**
- **Static resources**: Cache-first strategy
- **API calls**: Network-first with fallback
- **Images**: Stale-while-revalidate
- **Documents**: Network-first

#### **Offline Functionality:**
- Cached pages available offline
- Background sync for failed requests
- Offline indicator and messaging

#### **Push Notifications:**
- Web Push API integration with VAPID keys
- Notification categories: booking confirmations, messages, reminders
- Customizable notification preferences

### PWA API Endpoints

#### `POST /api/push/subscribe`
Subscribe to push notifications.

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "key...",
      "auth": "auth..."
    }
  },
  "userId": 123
}
```

#### `POST /api/push/send`
Send push notification to user.

**Request Body:**
```json
{
  "userId": 123,
  "title": "Booking Confirmed",
  "body": "Your service booking has been confirmed",
  "icon": "/icons/icon-192x192.png",
  "data": {
    "type": "booking",
    "bookingId": 456
  }
}
```

### Installation Prompts

The PWA includes 4 types of installation prompts:
1. **Banner**: Top banner with install option
2. **Card**: Prominent card in the main interface
3. **Button**: Discrete install button in header/menu
4. **Floating**: Floating action button

### App Shortcuts

Quick access shortcuts available on mobile home screen:
- "Search Services" - `/search`
- "My Bookings" - `/bookings`
- "Messages" - `/messages`
- "Profile" - `/profile`

## Location-Based Search

### Geolocation API

#### `GET /api/geolocation/providers`
Search providers by location with advanced filtering.

**Query Parameters:**
- `latitude` (required): User's latitude
- `longitude` (required): User's longitude
- `radius` (optional): Search radius in km (default: 10)
- `service` (optional): Service category filter
- `minRating` (optional): Minimum rating filter (1-5)
- `maxPrice` (optional): Maximum hourly rate filter
- `sortBy` (optional): Sort by `distance`, `rating`, or `price`
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "providers": [
    {
      "id": 1,
      "businessName": "Local Plumber",
      "latitude": -34.6037,
      "longitude": -58.3816,
      "distance": 2.5,
      "averageRating": "4.8",
      "hourlyRate": 3500,
      "services": [
        {
          "serviceName": "Plumbing Repair",
          "customServiceName": "Emergency Repairs"
        }
      ]
    }
  ],
  "totalResults": 25,
  "searchCenter": {
    "latitude": -34.6118,
    "longitude": -58.3960
  },
  "searchRadius": 10
}
```

### Distance Calculation

Uses Haversine formula for accurate distance calculations:
- Accounts for Earth's curvature
- Returns results in kilometers
- Optimized for performance with minimal database queries

## Performance Features

### Bundle Optimization

Frontend bundle includes:
- Code splitting for routes
- Dynamic imports for heavy components
- Tree shaking for unused code
- Image optimization and lazy loading

### Caching Strategy

- **Static assets**: Long-term caching
- **API responses**: Smart cache invalidation
- **Images**: Progressive loading and WebP support
- **Service worker**: Intelligent cache management

### Database Optimization

- Indexed location-based queries
- Optimized analytics aggregations
- Connection pooling for high performance
- Query optimization for distance calculations

## Security Features

### File Upload Security

- File type validation (images only)
- File size limits (5MB per image)
- Sanitized file names
- Secure storage path handling

### Push Notification Security

- VAPID key authentication
- Encrypted notification payloads
- User permission management
- Rate limiting for notifications

### Analytics Privacy

- Anonymous event tracking
- GDPR compliance considerations
- Data retention policies
- User consent management