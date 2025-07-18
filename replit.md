# Replit.md - Service Marketplace Platform

## Overview

This is a full-stack service marketplace platform built with React, Express.js, and PostgreSQL. The application connects customers with service providers (profesionales) in various categories like plumbing, electrical work, cleaning, etc. It features user authentication via Replit Auth, service booking, messaging, reviews, and comprehensive admin/provider dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with session management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API**: RESTful endpoints with structured error handling
- **Development**: Hot reloading with Vite middleware integration

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type safety across frontend/backend
- **Migration**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth (OIDC)
- **Session Management**: PostgreSQL-backed sessions with configurable TTL
- **User Types**: customer, provider, admin with role-based access control
- **Security**: HTTP-only cookies, CSRF protection, secure session handling

### Admin Dashboard (Completed)
- **Overview**: Platform statistics with user, provider, request, and completion metrics
- **User Management**: Complete user listing with role-based filtering and status tracking
- **Provider Management**: Verification system for service providers with approval workflow
- **Request Management**: Global view of all service requests with status tracking
- **Category Management**: CRUD operations for service categories with activation controls
- **Analytics**: Platform growth metrics and financial performance tracking
- **Real-time Data**: Live statistics and recent activity monitoring

### Provider Dashboard (Advanced - Completed)
- **6-Tab Interface**: Complete business management solution for service providers
  - **Overview Tab**: General statistics, profile information, and verification status
  - **Requests Tab**: Full request lifecycle management with status updates and response system
  - **Services Tab**: Complete CRUD operations for provider service offerings
  - **Earnings Tab**: Detailed financial tracking with payment history and method breakdown
  - **Calendar Tab**: Availability management and appointment scheduling
  - **Settings Tab**: Professional profile configuration and contact information
- **Business Management**: End-to-end tools for professional service providers
- **Real-time Updates**: Live synchronization across all dashboard components
- **Mobile Responsive**: Optimized interface for all device sizes

### Business Model - Lead Generation (Like HomeSolution.net)
- **Professionals Pay for Visibility**: Service providers purchase credits to access customer leads
- **Free for Customers**: Users search and request services at no cost - NO platform fees
- **Credit System**: Professionals buy credit packages (100, 250, 500, 1000) to respond to service requests
- **Credit Cost**: Each response to a lead costs 1 credit
- **No Transaction Fees**: Direct payment between customers and professionals
- **Payment Processing**: Mercado Pago for credit purchases by professionals
- **No Credit Expiration**: Credits never expire once purchased

### Email Notification System (Completed - July 18, 2025)
- **Built with Nodemailer**: Comprehensive email service with graceful fallback when not configured
- **Email Templates**: Professional HTML templates for all key platform interactions
- **Automated Notifications**:
  - New service request alerts for providers with service details and location
  - Customer notifications when providers respond with quoted prices
  - Credit purchase confirmations with transaction details
  - Welcome emails for new users (customers and providers)
- **Configuration**: Requires EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, EMAIL_PORT secrets
- **Development Mode**: Logs email content to console when email service not configured
- **Integration Points**: Service request creation, provider responses, payment confirmations, user registration

### Real-time Messaging System (Completed - July 18, 2025)
- **WebSocket Integration**: Real-time bidirectional communication between users
- **Conversation Management**: Grouped messaging with unread count tracking
- **Chat Interface**: Professional WhatsApp-style chat UI with typing indicators
- **Message Persistence**: All messages stored in PostgreSQL with full history
- **Mobile Responsive**: Optimized for both desktop and mobile usage
- **Authentication Integration**: Seamless integration with existing Replit Auth system
- **Professional-Customer Communication**: Direct messaging between service providers and customers

### Advanced Analytics & Business Intelligence Dashboard (Enhanced - July 18, 2025)
- **Comprehensive KPI Tracking**: Platform-wide statistics including users, providers, revenue, and conversion rates
- **Real-time Data Visualization**: Interactive charts and graphs using Recharts library
- **Multi-dimensional Analytics**: Revenue analytics, user growth tracking, provider performance metrics
- **Category Performance Analysis**: Service category breakdown with completion rates and pricing insights
- **Conversion Funnel Analysis**: Complete user journey tracking from registration to payment
- **Credit System Analytics**: Business intelligence for credit purchases, utilization rates, and package performance
- **Real-time Metrics**: Live 24-hour activity tracking with auto-refresh every 30 seconds
- **Provider Performance Insights**: Top performer rankings with completion rates and earnings
- **Admin-only Access**: Secured dashboard available only to admin users
- **Time Range Filtering**: 7-day, 30-day, 90-day, and yearly analytics views
- **Mobile Responsive Design**: Optimized interface for all device sizes
- **Database-driven Insights**: Real-time queries from PostgreSQL for authentic business intelligence
- **Six Analytics Tabs**: Overview, Revenue, Credits, Users, Providers, and Conversion analysis

### WordPress Integration for Content Management and SEO (Completed - July 18, 2025)
- **Complete API System**: Secure WordPress integration with API key authentication
- **Content Synchronization**: Bidirectional sync between WordPress and platform data
- **SEO Management**: Dynamic SEO metadata system with structured data support
- **Admin Dashboard**: WordPress integration management at /admin/wordpress
- **API Endpoints**: 
  - Categories and providers export for WordPress content creation
  - Content import from WordPress with SEO metadata
  - Dynamic SEO data serving for any page type
  - Sync logging and monitoring capabilities
- **Security Features**: API key management with permissions and expiration dates
- **Documentation**: Complete integration guide for WordPress plugin development
- **Database Schema**: WordPress content, SEO metadata, API keys, and sync logging tables
- **SEO Components**: React SEO head component with dynamic metadata loading

### Third-Party API Integration System (Completed - July 18, 2025)
- **Partner Management**: Complete partnership onboarding with verification and contract management
- **API Authentication**: Secure API key system with scopes, rate limiting, and expiration controls
- **REST API v1**: Professional API endpoints for categories, providers, requests, and analytics
- **Rate Limiting**: Configurable request limits per partner with usage tracking and analytics
- **Webhook System**: Real-time event notifications with retry logic and delivery monitoring
- **Admin Interface**: Comprehensive partner management dashboard at /admin/integrations
- **Request Logging**: Complete audit trail of all API requests with performance metrics
- **IP Security**: Optional IP whitelisting for enhanced partner security
- **Usage Analytics**: Real-time monitoring of API usage, success rates, and bandwidth consumption
- **Documentation**: Complete API integration guide with SDKs and best practices
- **Database Schema**: Partners, API keys, request logs, webhooks, and analytics tables
- **Event System**: Automated webhooks for user.created, provider.verified, request.created, payment.processed, and review.created

### Multi-Language Support System (Completed - July 18, 2025)
- **Internationalization Framework**: Complete i18n setup with react-i18next for broader market reach
- **Language Management**: Database-driven language system supporting Spanish (default) and English
- **Translation System**: Comprehensive translation management with key-value pairs and context support
- **Language Switcher**: User-friendly language selector with flag icons and native language names
- **User Preferences**: Personal language preference storage and automatic loading for authenticated users
- **Localized Content**: Support for localized content including service categories, descriptions, and SEO metadata
- **Database Schema**: Languages, translations, localized content, and user language preference tables
- **API Endpoints**: Complete REST API for language management, translations, and user preferences
- **Frontend Integration**: Seamless integration across all pages with translated navigation, landing page, and common terms
- **Automatic Detection**: Browser language detection with localStorage persistence
- **Admin Management**: Future support for admin translation management interface

### Payment System (NEEDS REFACTORING)
- **For Professionals**:
  - Mercado Pago for purchasing credits/memberships
  - Credit packages: 100, 250, 500, 1000 credits
  - Monthly memberships with included credits
  - Auto-renewal options
- **For Customers**: 
  - FREE to search and request services
  - Direct payment to professionals (outside platform)
  - No platform fees or commissions
- **Payment History**: Complete payment tracking for customers, providers, and admin
- **Payment Status Management**: Real-time status updates across all payment methods
- **E2E Testing Suite**: Comprehensive testing framework with visual interface
  - ✅ Automated test scenarios for all payment methods
  - ✅ Frontend test panel at /test-payments
  - ✅ Database validation and fee calculation verification

### Database Schema
- **Users**: Profile information, user types, timestamps
- **Service Categories**: Hierarchical service classification
- **Service Providers**: Business profiles, ratings, verification status
- **Provider Services**: Service offerings with pricing and descriptions
- **Service Requests**: Booking system with status tracking
- **Reviews**: Rating and feedback system with duplicate prevention and update capability
- **Conversations**: Chat conversation grouping with unread tracking
- **Messages**: Real-time messaging system with conversation threading
- **Sessions**: Authentication session storage

### Frontend Components
- **Layout**: Responsive navbar, footer, and page layouts
- **Service Discovery**: Search, filtering, and category browsing
- **Service-Specific Pages**: Dedicated pages for each service category:
  - `/servicios/plomeria` - Plumbing services with specialized UI
  - `/servicios/electricidad` - Electrical services with safety highlights
  - `/servicios/pintura` - Painting services with portfolio focus
  - `/servicios/limpieza` - Cleaning services with schedule options
  - `/servicios/carpinteria` - Carpentry services with custom work emphasis
- **Booking System**: Multi-step booking form with validation
- **Dashboards**: Role-specific dashboards (customer, provider, admin)
- **My Requests Page** (Completed - July 18, 2025): Comprehensive customer dashboard for service requests
  - Tabbed interface for filtering by status (All, Pending, Quoted, Accepted, Completed)
  - Detailed request cards with status badges and provider information
  - Request management actions: accept/reject quotes, cancel requests, leave reviews
  - Direct messaging integration with providers
  - Review system with star ratings and comments
- **UI Library**: Comprehensive component library built on Radix UI

### API Structure
- **Authentication**: `/api/auth/*` - User authentication and session management
- **Services**: `/api/categories`, `/api/providers` - Service discovery
- **Bookings**: `/api/requests` - Service request management
- **Reviews**: `/api/reviews` - Rating and feedback system
- **Provider Management**: `/api/provider-services`, `/api/providers/:id/*` - Advanced provider operations
  - `/api/provider-services` - CRUD operations for provider services
  - `/api/providers/:id/stats` - Provider performance statistics
  - `/api/providers/:id/payments` - Provider payment history
  - `/api/providers/me` - Current provider profile management
- **Admin**: `/api/admin/*` - Administrative functions
  - `/api/admin/stats` - Platform statistics
  - `/api/admin/users` - User management
  - `/api/admin/providers` - Provider verification and management
  - `/api/admin/requests` - Request oversight

## Data Flow

### User Authentication Flow
1. User accesses protected route
2. Middleware checks session validity
3. If unauthenticated, redirects to Replit Auth
4. Upon successful auth, creates/updates user profile
5. Establishes session with PostgreSQL storage
6. Returns user data to frontend

### Service Discovery Flow
1. User searches for services or browses categories
2. Frontend queries `/api/providers` with filters
3. Backend retrieves providers with related services and ratings
4. Results displayed with pagination and sorting options
5. User can view detailed provider profiles

### Booking Flow
1. Customer selects service provider
2. Multi-step booking form collects service details
3. Form validation using Zod schemas
4. API creates service request with pending status
5. Provider receives notification
6. Status updates tracked through request lifecycle

## External Dependencies

### Database
- **Neon**: Serverless PostgreSQL hosting
- **Connection**: WebSocket support for serverless environments
- **Pooling**: Connection pooling for performance optimization

### Authentication
- **Replit Auth**: OpenID Connect provider
- **Session Storage**: PostgreSQL with connect-pg-simple
- **Security**: Passport.js integration for auth strategies

### Frontend Libraries
- **React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation shared between frontend/backend
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework

### Development Tools
- **Vite**: Build tool with HMR and development server
- **TypeScript**: Type safety across the entire stack
- **ESLint/Prettier**: Code formatting and linting
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express middleware
- **Hot Reloading**: Full-stack hot reload with Vite integration
- **Database**: Neon development database with migrations
- **Environment**: Environment variables for configuration

### Production
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Serving**: Express serves both API and static files
- **Database**: Production PostgreSQL with optimized connections
- **Session Storage**: PostgreSQL-backed sessions for scalability
- **Environment**: Production environment variables and secrets

### Architecture Decisions

1. **Monorepo Structure**: Shared types and schemas between frontend/backend for consistency
2. **Drizzle ORM**: Type-safe database operations with excellent PostgreSQL support
3. **Replit Auth**: Simplified authentication flow optimized for Replit environment
4. **React Query**: Efficient server state management with caching and synchronization
5. **Tailwind + Radix**: Consistent, accessible UI components with utility styling
6. **PostgreSQL Sessions**: Scalable session storage that survives server restarts
7. **Vite Integration**: Seamless development experience with hot reloading
8. **Service-Specific Pages**: Individual landing pages for each service category instead of complex filtering