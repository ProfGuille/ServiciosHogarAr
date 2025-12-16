import {
  users,
  serviceCategories,
  serviceProviders,
  providerServices,
  serviceRequests,
  reviews,
  messages,
  conversations,
  payments,
  providerCredits,
  creditPurchases,
  leadResponses,
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
  type Conversation,
  type InsertConversation,
  type Payment,
  type InsertPayment,
} from "./shared/schema.js.js.js.js";
import { db } from "./db.js.js.js.js";
import { eq, desc, asc, like, and, or, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for authentication system)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Service categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategoryById(id: number): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  updateServiceCategoryStatus(id: number, isActive: boolean): Promise<ServiceCategory>;
  
  // Provider Credits
  getProviderCredits(providerId: number): Promise<{ currentCredits: number; totalPurchased: number; totalUsed: number } | undefined>;
  addProviderCredits(providerId: number, credits: number, amount: number): Promise<void>;
  useProviderCredit(providerId: number): Promise<boolean>;
  
  // Lead responses
  createLeadResponse(data: {
    serviceRequestId: number;
    providerId: number;
    creditsUsed: number;
    responseMessage: string;
    quotedPrice?: string;
  }): Promise<any>;
  
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
  updateProviderService(id: number, updates: Partial<InsertProviderService>): Promise<ProviderService | undefined>;
  deleteProviderService(id: number): Promise<void>;
  
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
  updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined>;
  getReviewByUserAndRequest(reviewerId: string, serviceRequestId: number): Promise<Review | undefined>;
  
  // Conversations and Messages
  getConversationsForUser(userId: string): Promise<(Conversation & { 
    customer: User; 
    provider: User; 
    lastMessage?: Message;
  })[]>;
  getOrCreateConversation(customerId: string, providerId: string, serviceRequestId?: number): Promise<Conversation>;
  getMessagesForConversation(conversationId: number, limit?: number, offset?: number): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: string): Promise<void>;
  updateConversationUnreadCount(conversationId: number, isCustomerSender: boolean): Promise<void>;
  
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
  // User operations (mandatory for authentication system)
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

  async getServiceCategoryById(id: number): Promise<ServiceCategory | undefined> {
    const [category] = await db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.id, id));
    return category;
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [newCategory] = await db
      .insert(serviceCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateServiceCategoryStatus(id: number, isActive: boolean): Promise<ServiceCategory> {
    const [updatedCategory] = await db
      .update(serviceCategories)
      .set({ isActive })
      .where(eq(serviceCategories.id, id))
      .returning();
    return updatedCategory;
  }

  // Provider Credits
  async getProviderCredits(providerId: number): Promise<{ currentCredits: number; totalPurchased: number; totalUsed: number } | undefined> {
    const [credits] = await db
      .select()
      .from(providerCredits)
      .where(eq(providerCredits.providerId, providerId));
    return credits;
  }

  async addProviderCredits(providerId: number, credits: number, amount: number): Promise<void> {
    // Check if provider already has credits record
    const existing = await this.getProviderCredits(providerId);
    
    if (existing) {
      // Update existing credits
      await db
        .update(providerCredits)
        .set({
          currentCredits: existing.currentCredits + credits,
          totalPurchased: existing.totalPurchased + credits,
        })
        .where(eq(providerCredits.providerId, providerId));
    } else {
      // Create new credits record
      await db
        .insert(providerCredits)
        .values({
          providerId: providerId,
          currentCredits: credits,
          totalPurchased: credits,
          totalUsed: 0,
        });
    }
    
    // Record purchase
    await db
      .insert(creditPurchases)
      .values({
        providerId: providerId,
        credits: credits,
        amount: amount.toString(),
        paymentMethod: 'mercadopago',
        status: 'completed',
      });
  }

  async useProviderCredit(providerId: number): Promise<boolean> {
    const credits = await this.getProviderCredits(providerId);
    
    if (!credits || credits.currentCredits < 1) {
      return false;
    }
    
    await db
      .update(providerCredits)
      .set({
        currentCredits: credits.currentCredits - 1,
        totalUsed: credits.totalUsed + 1,
      })
      .where(eq(providerCredits.providerId, providerId));
    
    // Record lead response - we'll need the serviceRequestId to do this properly
    // For now, just update the credit balance
    
    return true;
  }

  // Lead responses
  async createLeadResponse(data: {
    serviceRequestId: number;
    providerId: number;
    creditsUsed: number;
    responseMessage: string;
    quotedPrice?: string;
  }): Promise<any> {
    const [response] = await db
      .insert(leadResponses)
      .values({
        serviceRequestId: data.serviceRequestId,
        providerId: data.providerId,
        creditsUsed: data.creditsUsed,
        responseMessage: data.responseMessage,
        quotedPrice: data.quotedPrice,
      })
      .returning();
    return response;
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
    const services = await db
      .select({
        id: providerServices.id,
        providerId: providerServices.providerId,
        categoryId: providerServices.categoryId,
        customServiceName: providerServices.customServiceName,
        description: providerServices.description,
        basePrice: providerServices.basePrice,
        isActive: providerServices.isActive,
        createdAt: providerServices.createdAt,
        categoryName: serviceCategories.name,
      })
      .from(providerServices)
      .leftJoin(serviceCategories, eq(providerServices.categoryId, serviceCategories.id))
      .where(and(
        eq(providerServices.providerId, providerId),
        eq(providerServices.isActive, true)
      ));
    return services;
  }

  async createProviderService(service: InsertProviderService): Promise<ProviderService> {
    const [newService] = await db
      .insert(providerServices)
      .values(service)
      .returning();
    return newService;
  }

  async updateProviderService(id: number, updates: Partial<InsertProviderService>): Promise<ProviderService | undefined> {
    const [updatedService] = await db
      .update(providerServices)
      .set(updates)
      .where(eq(providerServices.id, id))
      .returning();
    return updatedService;
  }

  async deleteProviderService(id: number): Promise<void> {
    await db
      .delete(providerServices)
      .where(eq(providerServices.id, id));
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

  async updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined> {
    const [updatedReview] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async getReviewByUserAndRequest(reviewerId: string, serviceRequestId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.reviewerId, reviewerId),
        eq(reviews.serviceRequestId, serviceRequestId)
      ));
    return review;
  }

  // Conversations and Messages
  async getConversationsForUser(userId: string): Promise<(Conversation & { 
    customer: User; 
    provider: User; 
    lastMessage?: Message;
  })[]> {
    // First get conversations for the user
    const userConversations = await db
      .select()
      .from(conversations)
      .where(or(
        eq(conversations.customerId, userId),
        eq(conversations.providerId, userId)
      ))
      .orderBy(desc(conversations.lastMessageAt));

    // Then get user details for each conversation
    const result = await Promise.all(
      userConversations.map(async (conv) => {
        const [customer] = await db
          .select()
          .from(users)
          .where(eq(users.id, conv.customerId));
        
        const [provider] = await db
          .select()
          .from(users)
          .where(eq(users.id, conv.providerId));

        return {
          ...conv,
          customer,
          provider,
        };
      })
    );

    // Get last message for each conversation
    const conversationsWithMessages = await Promise.all(
      result.map(async (conv) => {
        const [lastMessage] = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);
        
        return {
          ...conv,
          lastMessage,
        };
      })
    );

    return conversationsWithMessages;
  }

  async getOrCreateConversation(customerId: string, providerId: string, serviceRequestId?: number): Promise<Conversation> {
    // Try to find existing conversation
    const [existing] = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.customerId, customerId),
        eq(conversations.providerId, providerId)
      ));

    if (existing) {
      return existing;
    }

    // Create new conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        customerId,
        providerId,
        serviceRequestId,
      })
      .returning();

    return newConversation;
  }

  async getMessagesForConversation(conversationId: number, limit = 50, offset = 0): Promise<(Message & { sender: User })[]> {
    return await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          userType: users.userType,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset) as any;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();

    // Update conversation last message time and unread counts
    await this.updateConversationUnreadCount(
      message.conversationId, 
      false // Will be determined in the method
    );

    return newMessage;
  }

  async markMessagesAsRead(conversationId: number, userId: string): Promise<void> {
    // Mark messages as read
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.conversationId, conversationId),
        eq(messages.senderId, userId)
      ));

    // Reset unread count for the user
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (conversation) {
      const updateData = conversation.customerId === userId
        ? { customerUnreadCount: 0 }
        : { providerUnreadCount: 0 };

      await db
        .update(conversations)
        .set(updateData)
        .where(eq(conversations.id, conversationId));
    }
  }

  async updateConversationUnreadCount(conversationId: number, isCustomerSender: boolean): Promise<void> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (conversation) {
      // Increment unread count for the receiver
      const updateData = isCustomerSender
        ? { 
            providerUnreadCount: conversation.providerUnreadCount + 1,
            lastMessageAt: new Date()
          }
        : { 
            customerUnreadCount: conversation.customerUnreadCount + 1,
            lastMessageAt: new Date()
          };

      await db
        .update(conversations)
        .set(updateData)
        .where(eq(conversations.id, conversationId));
    }
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
