import {
  users,
  serviceCategories,
  serviceProviders,
  providerServices,
  serviceRequests,
  reviews,
  messages,
  payments,
  type User,
  type UpsertUser,
  type ServiceCategory,
  type InsertServiceCategory,
  type ServiceProvider,
  type InsertServiceProvider,
  type ProviderService,
  type InsertProviderService,
  type ServiceRequest,
  type InsertServiceRequest,
  type Review,
  type InsertReview,
  type Message,
  type InsertMessage,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, or, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Service categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  
  // Service providers
  getServiceProviders(filters?: {
    city?: string;
    categoryId?: number;
    isVerified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ServiceProvider[]>;
  getServiceProviderById(id: number): Promise<ServiceProvider | undefined>;
  getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  updateServiceProvider(id: number, updates: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined>;
  
  // Provider services
  getProviderServices(providerId: number): Promise<ProviderService[]>;
  createProviderService(service: InsertProviderService): Promise<ProviderService>;
  
  // Service requests
  getServiceRequests(filters?: {
    customerId?: string;
    providerId?: number;
    status?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }): Promise<ServiceRequest[]>;
  getServiceRequestById(id: number): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: number, updates: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined>;
  
  // Reviews
  getReviewsForProvider(providerId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Messages
  getMessagesForServiceRequest(serviceRequestId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Analytics
  getProviderStats(providerId: number): Promise<{
    totalJobs: number;
    completedJobs: number;
    averageRating: number;
    totalEarnings: number;
  }>;
  
  getPlatformStats(): Promise<{
    totalUsers: number;
    totalProviders: number;
    totalRequests: number;
    totalCompletedJobs: number;
  }>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByCustomer(customerId: string): Promise<Payment[]>;
  getPaymentsByProvider(providerId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  getPaymentByServiceRequest(serviceRequestId: number): Promise<Payment | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  // Service categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.isActive, true))
      .orderBy(asc(serviceCategories.name));
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [newCategory] = await db
      .insert(serviceCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Service providers
  async getServiceProviders(filters: {
    city?: string;
    categoryId?: number;
    isVerified?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<ServiceProvider[]> {
    const conditions = [];
    conditions.push(eq(serviceProviders.isActive, true));
    
    if (filters.city) {
      conditions.push(like(serviceProviders.city, `%${filters.city}%`));
    }
    
    if (filters.isVerified !== undefined) {
      conditions.push(eq(serviceProviders.isVerified, filters.isVerified));
    }

    const baseQuery = db
      .select()
      .from(serviceProviders)
      .where(and(...conditions))
      .orderBy(desc(serviceProviders.rating), desc(serviceProviders.totalReviews));
    
    // Apply pagination if needed
    if (filters.limit && filters.offset) {
      return await baseQuery.limit(filters.limit).offset(filters.offset);
    } else if (filters.limit) {
      return await baseQuery.limit(filters.limit);
    } else if (filters.offset) {
      return await baseQuery.offset(filters.offset);
    }

    return await baseQuery;
  }

  async getServiceProviderById(id: number): Promise<ServiceProvider | undefined> {
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.id, id));
    return provider;
  }

  async getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId));
    return provider;
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [newProvider] = await db
      .insert(serviceProviders)
      .values(provider)
      .returning();
    return newProvider;
  }

  async updateServiceProvider(id: number, updates: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined> {
    const [updatedProvider] = await db
      .update(serviceProviders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceProviders.id, id))
      .returning();
    return updatedProvider;
  }

  // Provider services
  async getProviderServices(providerId: number): Promise<ProviderService[]> {
    return await db
      .select()
      .from(providerServices)
      .where(and(
        eq(providerServices.providerId, providerId),
        eq(providerServices.isActive, true)
      ));
  }

  async createProviderService(service: InsertProviderService): Promise<ProviderService> {
    const [newService] = await db
      .insert(providerServices)
      .values(service)
      .returning();
    return newService;
  }

  // Service requests
  async getServiceRequests(filters: {
    customerId?: string;
    providerId?: number;
    status?: string;
    city?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ServiceRequest[]> {
    const conditions = [];
    
    if (filters.customerId) {
      conditions.push(eq(serviceRequests.customerId, filters.customerId));
    }
    
    if (filters.providerId) {
      conditions.push(eq(serviceRequests.providerId, filters.providerId));
    }
    
    if (filters.status) {
      conditions.push(eq(serviceRequests.status, filters.status as any));
    }
    
    if (filters.city) {
      conditions.push(like(serviceRequests.city, `%${filters.city}%`));
    }
    
    const baseQuery = db
      .select()
      .from(serviceRequests)
      .orderBy(desc(serviceRequests.createdAt));
    
    const queryWithConditions = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    
    // Apply pagination if needed
    if (filters.limit && filters.offset) {
      return await queryWithConditions.limit(filters.limit).offset(filters.offset);
    } else if (filters.limit) {
      return await queryWithConditions.limit(filters.limit);
    } else if (filters.offset) {
      return await queryWithConditions.offset(filters.offset);
    }

    return await queryWithConditions;
  }

  async getServiceRequestById(id: number): Promise<ServiceRequest | undefined> {
    const [request] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));
    return request;
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [newRequest] = await db
      .insert(serviceRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async updateServiceRequest(id: number, updates: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined> {
    const [updatedRequest] = await db
      .update(serviceRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Reviews
  async getReviewsForProvider(providerId: number): Promise<Review[]> {
    // Get reviews for a provider by joining with service requests
    return await db
      .select({
        id: reviews.id,
        serviceRequestId: reviews.serviceRequestId,
        reviewerId: reviews.reviewerId,
        revieweeId: reviews.revieweeId,
        rating: reviews.rating,
        comment: reviews.comment,
        isPublic: reviews.isPublic,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .innerJoin(serviceRequests, eq(reviews.serviceRequestId, serviceRequests.id))
      .where(and(
        eq(serviceRequests.providerId, providerId),
        eq(reviews.isPublic, true)
      ))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  // Messages
  async getMessagesForServiceRequest(serviceRequestId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.serviceRequestId, serviceRequestId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Analytics
  async getProviderStats(providerId: number): Promise<{
    totalJobs: number;
    completedJobs: number;
    averageRating: number;
    totalEarnings: number;
  }> {
    const [stats] = await db
      .select({
        totalJobs: count(serviceRequests.id),
        completedJobs: sql<number>`COUNT(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 END)`,
        totalEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${serviceRequests.status} = 'completed' THEN ${serviceRequests.quotedPrice} ELSE 0 END), 0)`,
      })
      .from(serviceRequests)
      .where(eq(serviceRequests.providerId, providerId));

    const [ratingStats] = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      })
      .from(reviews)
      .innerJoin(serviceRequests, eq(reviews.serviceRequestId, serviceRequests.id))
      .where(eq(serviceRequests.providerId, providerId));

    return {
      totalJobs: stats.totalJobs,
      completedJobs: stats.completedJobs,
      averageRating: Number(ratingStats.averageRating.toFixed(1)),
      totalEarnings: Number(stats.totalEarnings),
    };
  }

  async getPlatformStats(): Promise<{
    totalUsers: number;
    totalProviders: number;
    totalRequests: number;
    totalCompletedJobs: number;
  }> {
    const [userStats] = await db
      .select({
        totalUsers: count(users.id),
      })
      .from(users);

    const [providerStats] = await db
      .select({
        totalProviders: count(serviceProviders.id),
      })
      .from(serviceProviders)
      .where(eq(serviceProviders.isActive, true));

    const [requestStats] = await db
      .select({
        totalRequests: count(serviceRequests.id),
        totalCompletedJobs: sql<number>`COUNT(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 END)`,
      })
      .from(serviceRequests);

    return {
      totalUsers: userStats.totalUsers,
      totalProviders: providerStats.totalProviders,
      totalRequests: requestStats.totalRequests,
      totalCompletedJobs: requestStats.totalCompletedJobs,
    };
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    return payment;
  }

  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.customerId, customerId))
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentsByProvider(providerId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.providerId, providerId))
      .orderBy(desc(payments.createdAt));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentByServiceRequest(serviceRequestId: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.serviceRequestId, serviceRequestId));
    return payment;
  }
}

export const storage = new DatabaseStorage();
