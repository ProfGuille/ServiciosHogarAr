# WordPress Integration Guide

## Overview

This document outlines the WordPress integration system for ServiciosHogar.com.ar, which allows content synchronization, SEO management, and seamless data exchange between WordPress and the main platform.

## Architecture

### Database Schema

The integration includes four main tables:

1. **wordpress_content** - Stores content synced from WordPress
2. **seo_metadata** - Dynamic SEO metadata for platform pages
3. **wordpress_api_keys** - Secure API keys for WordPress authentication
4. **content_sync_log** - Audit trail for all sync operations

### API Endpoints

#### For WordPress Plugin

```
GET /api/wordpress/categories        # Export service categories
GET /api/wordpress/providers         # Export service providers
POST /api/wordpress/content/sync     # Import content from WordPress
GET /api/wordpress/sync-logs         # View sync history
```

#### For SEO Management

```
GET /api/seo/:pageType/:identifier?  # Get SEO metadata
POST /api/admin/seo                  # Create/update SEO metadata
```

#### For Admin Management

```
POST /api/admin/wordpress/api-keys   # Create API keys
GET /api/admin/wordpress/api-keys    # List API keys
```

## Authentication

All WordPress API endpoints require authentication via API key:

```
X-API-Key: your-generated-api-key
```

API keys are generated through the admin panel and include:
- Unique identifier
- Permissions array
- Optional expiration date
- Usage tracking

## WordPress Plugin Requirements

### Installation

1. Create a WordPress plugin that communicates with ServiciosHogar.com.ar
2. Store the API endpoint URL and API key in WordPress admin settings
3. Implement content synchronization functionality

### Required Functionality

#### 1. Category Synchronization

Fetch service categories to create corresponding WordPress posts/pages:

```php
$response = wp_remote_get('https://servicioshogar.com.ar/api/wordpress/categories', [
    'headers' => [
        'X-API-Key' => $api_key
    ]
]);
```

#### 2. Provider Synchronization

Import service provider data for content creation:

```php
$response = wp_remote_get('https://servicioshogar.com.ar/api/wordpress/providers?limit=50&verified_only=true', [
    'headers' => [
        'X-API-Key' => $api_key
    ]
]);
```

#### 3. Content Push

Send WordPress content to the platform:

```php
$data = [
    'contentType' => 'post',
    'wordpressId' => $post_id,
    'title' => $post_title,
    'slug' => $post_slug,
    'content' => $post_content,
    'excerpt' => $post_excerpt,
    'featuredImage' => $featured_image_url,
    'seo' => [
        'title' => $seo_title,
        'description' => $seo_description,
        'keywords' => $seo_keywords,
        'canonical' => $canonical_url
    ]
];

$response = wp_remote_post('https://servicioshogar.com.ar/api/wordpress/content/sync', [
    'headers' => [
        'X-API-Key' => $api_key,
        'Content-Type' => 'application/json'
    ],
    'body' => json_encode($data)
]);
```

#### 4. SEO Integration

Implement dynamic SEO metadata fetching for enhanced pages:

```php
function get_servicios_seo($page_type, $identifier = null) {
    $url = "https://servicioshogar.com.ar/api/seo/{$page_type}";
    if ($identifier) {
        $url .= "/{$identifier}";
    }
    
    $response = wp_remote_get($url);
    
    if (is_wp_error($response)) {
        return false;
    }
    
    return json_decode(wp_remote_retrieve_body($response), true);
}
```

## SEO Implementation

### Dynamic SEO Data

The platform provides SEO metadata for different page types:

- **home** - Homepage SEO
- **services** - Services listing page
- **service_detail** - Individual service pages
- **provider_profile** - Provider profile pages
- **category** - Service category pages
- **location** - Location-based pages

### SEO Data Structure

```json
{
  "title": "Page title (160 chars max)",
  "description": "Meta description (320 chars max)",
  "keywords": "comma, separated, keywords",
  "canonicalUrl": "https://servicioshogar.com.ar/page",
  "ogTitle": "Open Graph title",
  "ogDescription": "Open Graph description",
  "ogImage": "https://example.com/image.jpg",
  "structuredData": {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ServiciosHogar.com.ar"
  }
}
```

### WordPress SEO Integration

```php
// Add to wp_head
function add_servicios_seo() {
    if (is_servicios_page()) {
        $seo = get_servicios_seo(get_page_type(), get_page_identifier());
        
        if ($seo) {
            echo "<title>{$seo['title']}</title>\n";
            echo "<meta name='description' content='{$seo['description']}'>\n";
            
            if ($seo['keywords']) {
                echo "<meta name='keywords' content='{$seo['keywords']}'>\n";
            }
            
            if ($seo['canonicalUrl']) {
                echo "<link rel='canonical' href='{$seo['canonicalUrl']}'>\n";
            }
            
            // Open Graph tags
            if ($seo['ogTitle']) {
                echo "<meta property='og:title' content='{$seo['ogTitle']}'>\n";
            }
            
            if ($seo['ogDescription']) {
                echo "<meta property='og:description' content='{$seo['ogDescription']}'>\n";
            }
            
            if ($seo['ogImage']) {
                echo "<meta property='og:image' content='{$seo['ogImage']}'>\n";
            }
            
            // Structured data
            if ($seo['structuredData']) {
                echo "<script type='application/ld+json'>" . json_encode($seo['structuredData']) . "</script>\n";
            }
        }
    }
}
add_action('wp_head', 'add_servicios_seo');
```

## Content Strategy

### Recommended WordPress Content Structure

1. **Service Category Pages**
   - Create dedicated pages for each service category
   - Include provider listings from the platform
   - Optimize for local SEO with location-specific content

2. **Provider Showcase Pages**
   - Feature top-rated providers
   - Include testimonials and case studies
   - Link to provider profiles on the main platform

3. **Blog Content**
   - Home improvement tips
   - Seasonal service guides
   - Local market insights
   - Provider spotlights

4. **Location Pages**
   - City-specific service pages
   - Local provider directories
   - Regional service pricing guides

### Content Sync Strategy

1. **Automated Sync**
   - Daily sync of new providers
   - Weekly sync of service categories
   - Real-time sync of important updates

2. **Content Templates**
   - Use provider data to generate standardized pages
   - Include dynamic pricing information
   - Add location-specific content

3. **SEO Optimization**
   - Use platform SEO data for enhanced metadata
   - Implement breadcrumb navigation
   - Add structured data for rich snippets

## Security Considerations

### API Key Management

1. Store API keys securely in WordPress database
2. Use HTTPS for all API communications
3. Implement key rotation policies
4. Monitor API usage and set rate limits

### Data Validation

1. Validate all incoming data from WordPress
2. Sanitize content before storage
3. Implement CSRF protection for admin operations
4. Log all sync operations for audit trails

### Access Control

1. Restrict API key creation to admin users
2. Implement permission-based access control
3. Regular security audits of integration points
4. Monitor for suspicious API usage patterns

## Monitoring and Maintenance

### Sync Monitoring

- Check sync logs regularly for failures
- Monitor API response times and errors
- Set up alerts for sync failures
- Track content freshness and updates

### Performance Optimization

- Implement caching for frequently accessed data
- Use pagination for large data sets
- Optimize database queries for sync operations
- Monitor server resources during sync operations

### Troubleshooting

Common issues and solutions:

1. **API Key Not Working**
   - Verify key is active and not expired
   - Check permissions array includes required operations
   - Ensure correct header format (X-API-Key)

2. **Sync Failures**
   - Check network connectivity
   - Verify data format matches expected schema
   - Review error logs for specific failure reasons

3. **SEO Data Not Loading**
   - Verify page type and identifier parameters
   - Check for custom SEO metadata in admin panel
   - Ensure proper fallback to default SEO data

## Future Enhancements

### Planned Features

1. **Bidirectional Sync**
   - Allow WordPress content to update platform data
   - Sync user comments and reviews
   - Share analytics data between platforms

2. **Advanced SEO Features**
   - Automatic sitemap generation
   - Schema markup optimization
   - Local SEO enhancements

3. **Content Personalization**
   - User-specific content recommendations
   - Location-based content delivery
   - A/B testing for content optimization

4. **Enhanced Analytics**
   - Cross-platform analytics integration
   - Content performance tracking
   - User journey analysis

## Support and Documentation

For technical support with the WordPress integration:

1. Check the sync logs in the admin panel
2. Review API documentation for endpoint specifications
3. Contact the development team for integration assistance
4. Submit bug reports through the admin interface

This integration enables a powerful content management system that enhances SEO, improves user experience, and provides seamless synchronization between WordPress and the ServiciosHogar.com.ar platform.