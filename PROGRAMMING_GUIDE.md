# Programming Guide - ServiciosHogar.com.ar

## 🛠️ Developer Documentation

### Overview
This guide provides comprehensive programming information for developers working on the ServiciosHogar.com.ar platform, including architecture details, coding standards, API documentation, and development workflows.

## 🏗️ Architecture Overview

### Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS + shadcn/ui + Radix UI
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter (lightweight routing)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Fetch API with custom wrapper

#### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon hosted)
- **ORM**: Drizzle ORM
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **File Upload**: Multer middleware

#### Infrastructure
- **Frontend Hosting**: Hostinger (Apache)
- **Backend Hosting**: Render (Node.js)
- **Database Hosting**: Neon (PostgreSQL)
- **Version Control**: Git (GitHub)

### Project Structure
```
ServiciosHogarAr/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── types/           # TypeScript type definitions
│   │   └── assets/          # Static assets
│   ├── public/              # Public static files
│   └── dist/                # Build output
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── db/              # Database configuration
│   │   ├── validation/      # Zod schemas
│   │   └── utils/           # Utility functions
│   └── migrations/          # Database migrations
├── shared/                  # Shared types and utilities
├── docs/                    # Additional documentation
└── tests/                   # E2E and integration tests
```

## 🎯 Development Setup

### Prerequisites
```bash
# Required software
Node.js >= 18.0.0
npm >= 8.0.0
Git
PostgreSQL (for local development)
```

### Local Development Environment
```bash
# 1. Clone repository
git clone https://github.com/ProfGuille/ServiciosHogarAr.git
cd ServiciosHogarAr

# 2. Install dependencies
npm install                  # Root dependencies
cd frontend && npm install   # Frontend dependencies
cd ../backend && npm install # Backend dependencies

# 3. Set up environment variables
cd backend
cp .env.example .env
# Edit .env with your local database credentials

cd ../frontend
cp .env.development.example .env.development
# Edit .env.development with local backend URL

# 4. Set up database
cd ../backend
npm run db:migrate          # Run migrations
npm run db:seed            # Seed with sample data

# 5. Start development servers
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Development Scripts
```bash
# Backend scripts
npm run dev                 # Start development server with hot reload
npm run build              # Build TypeScript to JavaScript
npm run start              # Start production server
npm run db:generate        # Generate new migration
npm run db:migrate         # Run pending migrations
npm run db:seed            # Seed database with sample data
npm run test               # Run unit tests
npm run lint               # Run ESLint
npm run typecheck          # Check TypeScript types

# Frontend scripts
npm run dev                # Start development server
npm run build              # Build for production
npm run preview            # Preview production build
npm run test               # Run unit tests
npm run test:e2e           # Run E2E tests
npm run lint               # Run ESLint
npm run typecheck          # Check TypeScript types
```

## 📝 Coding Standards

### TypeScript Configuration

#### tsconfig.json (Backend)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@shared/*": ["../../shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### tsconfig.json (Frontend)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@shared/*": ["../../shared/*"],
      "@assets/*": ["./assets/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Code Style Guidelines

#### Naming Conventions
```typescript
// Variables and functions: camelCase
const userName = 'john_doe';
const calculateTotalPrice = (items: Item[]) => { };

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// Types and interfaces: PascalCase
interface UserProfile {
  id: number;
  name: string;
}

type ServiceCategory = 'CLEANING' | 'PLUMBING' | 'ELECTRICAL';

// Components: PascalCase
const ServiceCard = ({ service }: { service: Service }) => { };

// Files: kebab-case
// service-card.tsx
// user-profile.ts
// api-client.ts
```

#### Import Organization
```typescript
// 1. Node modules
import React from 'react';
import { z } from 'zod';

// 2. Internal modules (with aliases)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { Service } from '@shared/types';

// 3. Relative imports
import './service-card.css';
```

#### Error Handling
```typescript
// API error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Async function error handling
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to create booking');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Unexpected error occurred');
  }
}
```

## 🗄️ Database Programming

### Schema Definition (Drizzle ORM)

#### Core Tables
```typescript
// backend/src/db/schema.ts
import { pgTable, serial, varchar, text, timestamp, integer, decimal, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  role: varchar('role', { length: 20 }).default('CLIENT'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }),
  duration: integer('duration'), // minutes
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => users.id),
  providerId: integer('provider_id').references(() => users.id),
  serviceId: integer('service_id').references(() => services.id),
  scheduledDate: timestamp('scheduled_date').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

#### Relationships and Queries
```typescript
// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  bookingsAsClient: many(bookings, { relationName: 'clientBookings' }),
  bookingsAsProvider: many(bookings, { relationName: 'providerBookings' }),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id],
    relationName: 'clientBookings',
  }),
  provider: one(users, {
    fields: [bookings.providerId],
    references: [users.id],
    relationName: 'providerBookings',
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));

// Query examples
export async function getBookingWithDetails(bookingId: number) {
  return await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: {
      client: true,
      provider: true,
      service: true,
    },
  });
}

export async function getUserBookings(userId: number) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      bookingsAsClient: {
        with: {
          service: true,
          provider: true,
        },
        orderBy: desc(bookings.createdAt),
      },
    },
  });
}
```

### Validation Schemas
```typescript
// backend/src/validation/schemas.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const createBookingSchema = z.object({
  serviceId: z.number().positive('Service ID is required'),
  providerId: z.number().positive('Provider ID is required'),
  scheduledDate: z.string().datetime('Invalid date format'),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
});

// Shared types generated from schemas
export type CreateUserData = z.infer<typeof createUserSchema>;
export type CreateBookingData = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusData = z.infer<typeof updateBookingStatusSchema>;
```

## 🔌 API Development

### RESTful API Design

#### Route Structure
```typescript
// backend/src/routes/index.ts
import express from 'express';
import { authRoutes } from './auth';
import { userRoutes } from './users';
import { serviceRoutes } from './services';
import { bookingRoutes } from './bookings';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);

export { router as apiRoutes };
```

#### Authentication Middleware
```typescript
// backend/src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### Route Handlers
```typescript
// backend/src/routes/bookings.ts
import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { createBookingSchema, updateBookingStatusSchema } from '../validation/schemas';
import * as bookingController from '../controllers/bookingController';

const router = express.Router();

// Get all bookings (admin only)
router.get('/', 
  authenticate, 
  authorize(['ADMIN']), 
  bookingController.getAllBookings
);

// Get user's bookings
router.get('/my-bookings', 
  authenticate, 
  bookingController.getUserBookings
);

// Create new booking
router.post('/', 
  authenticate,
  validateRequest(createBookingSchema),
  bookingController.createBooking
);

// Update booking status
router.patch('/:id/status',
  authenticate,
  validateRequest(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

// Get booking details
router.get('/:id',
  authenticate,
  bookingController.getBookingById
);

export { router as bookingRoutes };
```

#### Controller Implementation
```typescript
// backend/src/controllers/bookingController.ts
import { Request, Response } from 'express';
import { db } from '../db/connection';
import { bookings, users, services } from '../db/schema';
import { eq, and } from 'drizzle-orm';

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, providerId, scheduledDate, notes } = req.body;
    const clientId = req.user!.id;

    // Validate provider exists and offers the service
    const provider = await db.query.users.findFirst({
      where: and(eq(users.id, providerId), eq(users.role, 'PROVIDER')),
    });

    if (!provider) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Create booking
    const [booking] = await db.insert(bookings).values({
      clientId,
      providerId,
      serviceId,
      scheduledDate: new Date(scheduledDate),
      notes,
      status: 'PENDING',
    }).returning();

    // Get booking with related data
    const fullBooking = await db.query.bookings.findFirst({
      where: eq(bookings.id, booking.id),
      with: {
        client: true,
        provider: true,
        service: true,
      },
    });

    res.status(201).json(fullBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const userBookings = await db.query.bookings.findMany({
      where: eq(bookings.clientId, userId),
      with: {
        service: true,
        provider: true,
      },
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });

    res.json(userBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

## ⚛️ Frontend Development

### Component Architecture

#### Base Component Structure
```typescript
// frontend/src/components/service-card.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Service } from '@shared/types';

interface ServiceCardProps {
  service: Service;
  onBook: (serviceId: number) => void;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onBook, 
  className 
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {service.name}
          <Badge variant="secondary">{service.category}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {service.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            ${service.basePrice}
          </span>
          <Button onClick={() => onBook(service.id)}>
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### Custom Hooks
```typescript
// frontend/src/hooks/use-auth.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, LoginData } from '@shared/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        return null;
      }

      return response.json();
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['auth', 'user'], null);
    queryClient.clear();
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: loginMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
  };
};
```

#### API Client
```typescript
// frontend/src/lib/api-client.ts
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(response.status, error.message || response.statusText);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});
```

## 🧪 Testing Guidelines

### Unit Testing (Backend)
```typescript
// backend/src/__tests__/bookingController.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createBooking } from '../controllers/bookingController';
import { db } from '../db/connection';

vi.mock('../db/connection');

describe('BookingController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const mockBooking = {
        id: 1,
        clientId: 1,
        providerId: 2,
        serviceId: 1,
        scheduledDate: new Date(),
        status: 'PENDING',
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockBooking]),
        }),
      } as any);

      const req = {
        body: {
          serviceId: 1,
          providerId: 2,
          scheduledDate: '2024-01-15T10:00:00Z',
        },
        user: { id: 1 },
      } as any;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      await createBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        status: 'PENDING',
      }));
    });
  });
});
```

### Component Testing (Frontend)
```typescript
// frontend/src/components/__tests__/service-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceCard } from '../service-card';
import type { Service } from '@shared/types';

const mockService: Service = {
  id: 1,
  name: 'House Cleaning',
  description: 'Professional house cleaning service',
  category: 'CLEANING',
  basePrice: '2500.00',
  duration: 120,
  isActive: true,
  createdAt: new Date(),
};

describe('ServiceCard', () => {
  it('renders service information correctly', () => {
    const onBook = vi.fn();
    
    render(<ServiceCard service={mockService} onBook={onBook} />);
    
    expect(screen.getByText('House Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Professional house cleaning service')).toBeInTheDocument();
    expect(screen.getByText('CLEANING')).toBeInTheDocument();
    expect(screen.getByText('$2500.00')).toBeInTheDocument();
  });

  it('calls onBook when reserve button is clicked', () => {
    const onBook = vi.fn();
    
    render(<ServiceCard service={mockService} onBook={onBook} />);
    
    fireEvent.click(screen.getByText('Reservar'));
    
    expect(onBook).toHaveBeenCalledWith(1);
  });
});
```

### E2E Testing
```typescript
// tests/e2e/booking-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('user can complete a service booking', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Login
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="submit-login"]');
    
    // Browse services
    await page.click('[data-testid="services-link"]');
    await expect(page.locator('[data-testid="service-card"]')).toBeVisible();
    
    // Select a service
    await page.click('[data-testid="service-card"]:first-child [data-testid="book-button"]');
    
    // Fill booking form
    await page.fill('[data-testid="date-input"]', '2024-01-15');
    await page.fill('[data-testid="time-input"]', '10:00');
    await page.fill('[data-testid="notes-input"]', 'Please arrive on time');
    
    // Submit booking
    await page.click('[data-testid="submit-booking"]');
    
    // Verify booking confirmation
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
    await expect(page.locator('text=Booking confirmed')).toBeVisible();
  });
});
```

## 🚀 Deployment and DevOps

### Build Configuration

#### Vite Configuration
```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'zod', 'clsx'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

#### Backend Build Configuration
```json
// backend/package.json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "tsx src/migrate.ts",
    "test": "vitest",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm install
          cd frontend && npm install
          cd ../backend && npm install
      
      - name: Run tests
        run: |
          cd backend && npm run test
          cd ../frontend && npm run test
      
      - name: Type check
        run: |
          cd backend && npm run typecheck
          cd ../frontend && npm run typecheck

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to Hostinger
        run: |
          # Custom deployment script
          ./deploy-hostinger.sh
```

## 📚 Additional Resources

### Useful Libraries and Tools

#### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "drizzle-orm": "^0.36.4",
    "@neondatabase/serverless": "^1.0.1",
    "zod": "^3.25.76",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "tsx": "^4.20.3",
    "vitest": "^2.1.8",
    "drizzle-kit": "^0.20.10"
  }
}
```

#### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wouter": "^3.3.5",
    "@tanstack/react-query": "^5.59.20",
    "react-hook-form": "^7.53.2",
    "zod": "^3.25.76",
    "@hookform/resolvers": "^3.10.0",
    "tailwindcss": "^3.4.15",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "lucide-react": "^0.468.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@playwright/test": "^1.49.0"
  }
}
```

### Performance Optimization

#### Backend Optimization
- Use database indexing for frequently queried fields
- Implement caching with Redis for expensive operations
- Use database connection pooling
- Implement rate limiting for API endpoints
- Use compression middleware for responses

#### Frontend Optimization
- Implement code splitting with dynamic imports
- Use React.lazy for component lazy loading
- Optimize images with proper formats and sizes
- Implement virtual scrolling for large lists
- Use React.memo for expensive components

### Security Best Practices

#### Authentication & Authorization
- Use strong JWT secrets and implement token rotation
- Implement proper CORS configuration
- Use HTTPS for all communications
- Implement rate limiting and request validation
- Hash passwords with bcrypt (minimum 12 rounds)

#### Data Protection
- Validate all inputs with Zod schemas
- Sanitize user inputs to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement proper error handling without exposing sensitive data
- Regular security audits and dependency updates

---

**This programming guide should be updated regularly to reflect new features, best practices, and architectural changes.**