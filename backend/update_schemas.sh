#!/bin/bash

# Actualizar provider_credits
sed -i "s/credits: integer/currentCredits: integer.default(0),\n  totalPurchased: integer.default(0),\n  totalUsed: integer.default(0)/g" src/shared/schema/providerCredits.ts

# Actualizar serviceProviders
sed -i "s/});/rating: real('rating').default(0),\n  totalReviews: integer('total_reviews').default(0),\n  businessName: varchar('business_name', { length: 255 }),\n  isVerified: boolean('is_verified').default(false),\n  city: varchar('city', { length: 100 }),\n  categoryId: integer('category_id'),\n&/g" src/shared/schema/serviceProviders.ts

# Actualizar serviceRequests
sed -i "s/createdAt: timestamp/status: varchar('status', { length: 50 }).default('pending'),\n  customerId: integer('customer_id'),\n  providerId: integer('provider_id'),\n  city: varchar('city', { length: 100 }),\n  quotedPrice: varchar('quoted_price', { length: 50 }),\n&/g" src/shared/schema/serviceRequests.ts

# Actualizar payments
sed -i "s/paidAt: timestamp/serviceRequestId: integer('service_request_id'),\n  customerId: integer('customer_id'),\n  providerId: integer('provider_id'),\n&/g" src/shared/schema/payments.ts

# Actualizar reviews
sed -i "s/});/reviewerId: integer('reviewer_id'),\n  revieweeId: integer('reviewee_id'),\n  serviceRequestId: integer('service_request_id'),\n&/g" src/shared/schema/reviews.ts

# Aplicar cambios a todos los esquemas
find src/shared/schema -name "*.ts" -exec sed -i "s/\.notNull()//g" {} +
