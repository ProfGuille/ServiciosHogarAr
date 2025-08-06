// src/storage.ts
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
} from "./shared/schema.js";

import { db } from "./db.js";
import { eq, desc, asc, like, and, or, sql, count } from "drizzle-orm";
import { randomUUID } from 'crypto';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategoryById(id: number): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  updateServiceCategoryStatus(id: number, isActive: boolean): Promise<ServiceCategory>;
  getProviderCredits(providerId: number): Promise<{ currentCredits: number; totalPurchased: number; totalUsed: number } | undefined>;
  addProviderCredits(providerId: number, credits: number, amount: number): Promise<void>;
  useProviderCredit(providerId: number): Promise<boolean>;
  createLeadResponse(data: {
    serviceRequestId: number;
    providerId: number;
    creditsUsed: number;
    responseMessage: string;
    quotedPrice?: string;
  }): Promise<any>;
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
  getProviderServices(providerId: number): Promise<ProviderService[]>;
  createProviderService(service: InsertProviderService): Promise<ProviderService>;
  updateProviderService(id: number, updates: Partial<InsertProviderService>): Promise<ProviderService | undefined>;
  deleteProviderService(id: number): Promise<void>;
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
  getReviewsForProvider(providerId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined>;
  getReviewByUserAndRequest(reviewerId: string, serviceRequestId: number): Promise<Review | undefined>;
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
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByCustomer(customerId: string): Promise<Payment[]>;
  getPaymentsByProvider(providerId: number): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  getPaymentByServiceRequest(serviceRequestId: number): Promise<Payment | undefined>;

  // Función extra que querés agregar para insertar todo junto
  insertUserProviderAndServices(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
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
        set: { ...userData, updatedAt: new Date() },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories).orderBy(serviceCategories.name);
  }

  async getServiceCategoryById(id: number): Promise<ServiceCategory | undefined> {
    const [category] = await db.select().from(serviceCategories).where(eq(serviceCategories.id, id));
    return category;
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [created] = await db.insert(serviceCategories).values(category).returning();
    return created;
  }

  async updateServiceCategoryStatus(id: number, isActive: boolean): Promise<ServiceCategory> {
    const [updated] = await db.update(serviceCategories).set({ isActive }).where(eq(serviceCategories.id, id)).returning();
    return updated;
  }

  async getProviderCredits(providerId: number): Promise<{ currentCredits: number; totalPurchased: number; totalUsed: number } | undefined> {
    const [credits] = await db.select({
      currentCredits: providerCredits.currentCredits,
      totalPurchased: providerCredits.totalPurchased,
      totalUsed: providerCredits.totalUsed,
    }).from(providerCredits).where(eq(providerCredits.providerId, providerId));
    return credits;
  }

  async addProviderCredits(providerId: number, credits: number, amount: number): Promise<void> {
   await db.insert(creditPurchases).values({
  providerId: providerId,
  credits: credits,
  amount: amount.toFixed(2),  // Convertir number a string con 2 decimales
  createdAt: new Date(),      // No "purchasedAt", sino "createdAt"
  status: "pending",          // Agregá status si es requerido
});


    await db.update(providerCredits).set({
      currentCredits: sql`${providerCredits.currentCredits} + ${credits}`,
      totalPurchased: sql`${providerCredits.totalPurchased} + ${credits}`,
    }).where(eq(providerCredits.providerId, providerId));
  }

  async useProviderCredit(providerId: number): Promise<boolean> {
    const [credit] = await db.select().from(providerCredits).where(eq(providerCredits.providerId, providerId));
    if (!credit || credit.currentCredits <= 0) {
      return false;
    }
    await db.update(providerCredits).set({
      currentCredits: sql`${providerCredits.currentCredits} - 1`,
      totalUsed: sql`${providerCredits.totalUsed} + 1`,
    }).where(eq(providerCredits.providerId, providerId));
    return true;
  }

  async createLeadResponse(data: {
    serviceRequestId: number;
    providerId: number;
    creditsUsed: number;
    responseMessage: string;
    quotedPrice?: string;
  }): Promise<any> {
    return await db.insert(leadResponses).values(data).returning();
  }

  async getServiceProviders(filters?: {
    city?: string;
    categoryId?: number;
    isVerified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ServiceProvider[]> {
    let query = db.select().from(serviceProviders);

    if (filters) {
      if (filters.city) query = query.where(like(serviceProviders.city, `%${filters.city}%`));
      if (filters.categoryId) query = query.where(eq(serviceProviders.categoryId, filters.categoryId));
      if (filters.isVerified !== undefined) query = query.where(eq(serviceProviders.isVerified, filters.isVerified));
    }

    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.offset(filters.offset);

    return await query.orderBy(asc(serviceProviders.businessName));
  }

  async getServiceProviderById(id: number): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return provider;
  }

  async getServiceProviderByUserId(userId: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.userId, userId));
    return provider;
  }

  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [created] = await db.insert(serviceProviders).values(provider).returning();
    return created;
  }

  async updateServiceProvider(id: number, updates: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined> {
    const [updated] = await db.update(serviceProviders).set(updates).where(eq(serviceProviders.id, id)).returning();
    return updated;
  }

  async getProviderServices(providerId: number): Promise<ProviderService[]> {
    return await db.select().from(providerServices).where(eq(providerServices.providerId, providerId));
  }

  async createProviderService(service: InsertProviderService): Promise<ProviderService> {
    const [created] = await db.insert(providerServices).values(service).returning();
    return created;
  }

  async updateProviderService(id: number, updates: Partial<InsertProviderService>): Promise<ProviderService | undefined> {
    const [updated] = await db.update(providerServices).set(updates).where(eq(providerServices.id, id)).returning();
    return updated;
  }

  async deleteProviderService(id: number): Promise<void> {
    await db.delete(providerServices).where(eq(providerServices.id, id));
  }

  async getServiceRequests(filters?: {
    customerId?: string;
    providerId?: number;
    status?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }): Promise<ServiceRequest[]> {
    let query = db.select().from(serviceRequests);

    if (filters) {
      if (filters.customerId) query = query.where(eq(serviceRequests.customerId, filters.customerId));
      if (filters.providerId) query = query.where(eq(serviceRequests.providerId, filters.providerId));
      if (filters.status) query = query.where(eq(serviceRequests.status, filters.status));
      if (filters.city) query = query.where(like(serviceRequests.city, `%${filters.city}%`));
    }

    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.offset(filters.offset);

    return await query.orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequestById(id: number): Promise<ServiceRequest | undefined> {
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return request;
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const [created] = await db.insert(serviceRequests).values(request).returning();
    return created;
  }

  async updateServiceRequest(id: number, updates: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined> {
    const [updated] = await db.update(serviceRequests).set(updates).where(eq(serviceRequests.id, id)).returning();
    return updated;
  }

  async getReviewsForProvider(providerId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.providerId, providerId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined> {
    const [updated] = await db.update(reviews).set(updates).where(eq(reviews.id, id)).returning();
    return updated;
  }

  async getReviewByUserAndRequest(reviewerId: string, serviceRequestId: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(
      and(eq(reviews.reviewerId, reviewerId), eq(reviews.serviceRequestId, serviceRequestId))
    );
    return review;
  }

  async getConversationsForUser(userId: string): Promise<(Conversation & {
    customer: User;
    provider: User;
    lastMessage?: Message;
  })[]> {
    // Consulta más elaborada con joins, ejemplo simplificado
    // Deberías hacer el join a users para customer y provider y mensajes para lastMessage
    return [];
  }

  async getOrCreateConversation(customerId: string, providerId: string, serviceRequestId?: number): Promise<Conversation> {
    // Lógica para obtener o crear conversación
    throw new Error("Not implemented");
  }

  async getMessagesForConversation(conversationId: number, limit?: number, offset?: number): Promise<(Message & { sender: User })[]> {
    // Traer mensajes con info del remitente
    return [];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }

  async markMessagesAsRead(conversationId: number, userId: string): Promise<void> {
    // Actualizar estado leído mensajes
  }

  async updateConversationUnreadCount(conversationId: number, isCustomerSender: boolean): Promise<void> {
    // Actualizar contador no leídos
  }

  async getProviderStats(providerId: number): Promise<{
    totalJobs: number;
    completedJobs: number;
    averageRating: number;
    totalEarnings: number;
  }> {
    // Consultas estadísticas agregadas
    return {
      totalJobs: 0,
      completedJobs: 0,
      averageRating: 0,
      totalEarnings: 0,
    };
  }

  async getPlatformStats(): Promise<{
    totalUsers: number;
    totalProviders: number;
    totalRequests: number;
    totalCompletedJobs: number;
  }> {
    // Estadísticas generales plataforma
    return {
      totalUsers: 0,
      totalProviders: 0,
      totalRequests: 0,
      totalCompletedJobs: 0,
    };
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.customerId, customerId));
  }

  async getPaymentsByProvider(providerId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.providerId, providerId));
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }

  async getPaymentByServiceRequest(serviceRequestId: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.serviceRequestId, serviceRequestId));
    return payment;
  }

  // Función extra para insertar usuario, proveedor y servicios de ejemplo
  async insertUserProviderAndServices(): Promise<void> {
    const userData: UpsertUser = {
      id: '123',
      email: 'testuser@example.com',
      firstName: 'Test',
      lastName: 'User',
      userType: 'provider',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const providerData: InsertServiceProvider = {
      userId: userData.id,
      businessName: 'Prestador de Prueba',
      description: 'Descripción de prueba.',
      experienceYears: 3,
      serviceAreas: ['Ciudad 1', 'Provincia 1'],
      hourlyRate: "1000.00",
      phoneNumber: '123456789',
      address: 'Calle Falsa 123',
      city: 'Ciudad',
      province: 'Provincia',
      postalCode: '0000',
      isVerified: false,
      isActive: true,
      rating: "4.50",
      totalReviews: 10,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.insert(users).values(userData).onConflictDoUpdate({
        target: users.id,
        set: { ...userData, updatedAt: new Date() },
      });

      await db.insert(serviceProviders).values(providerData).onConflictDoUpdate({
        target: serviceProviders.userId,
        set: { ...providerData, updatedAt: new Date() },
      });

      // Ejemplo de servicios para el proveedor
      const servicesToInsert: InsertProviderService[] = [
        {
          providerId: providerData.userId,
          categoryId: 1,
          customServiceName: 'Servicio ejemplo 1',
          description: 'Descripción del servicio 1',
          basePrice: "1500.00",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          providerId: providerData.userId,
          categoryId: 2,
          customServiceName: 'Servicio ejemplo 2',
          description: 'Descripción del servicio 2',
          basePrice: "2000.00",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const service of servicesToInsert) {
        await db.insert(providerServices).values(service).onConflictDoNothing();
      }

      console.log('Usuario, proveedor y servicios insertados o actualizados correctamente.');
    } catch (error) {
      console.error('Error en insertUserProviderAndServices:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
// storage.ts (al final del archivo)

import { db } from './db.js';
import { users, serviceProviders, providerServices } from './shared/schema.js';

export async function insertUserProviderAndServices() {
  // Insertar usuario
  const [createdUser] = await db.insert(users).values({
    id: '123',
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User',
    userType: 'provider',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // Insertar proveedor
  const [createdProvider] = await db.insert(serviceProviders).values({
    userId: createdUser.id,
    businessName: 'Prestador de Prueba',
    description: 'Descripción de prueba.',
    experienceYears: 3,
    serviceAreas: ['Ciudad 1', 'Provincia 1'],
    hourlyRate: "1000.00",
    phoneNumber: '123456789',
    address: 'Calle Falsa 123',
    city: 'Ciudad',
    province: 'Provincia',
    postalCode: '0000',
    isVerified: false,
    isActive: true,
    rating: "4.50",
    totalReviews: 10,
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // Insertar servicios para proveedor (si querés)
  await db.insert(providerServices).values([
    {
      providerId: createdProvider.id,
      categoryId: 1,
      customServiceName: 'Servicio A',
      description: 'Descripción Servicio A',
      basePrice: "500.00",
      isActive: true,
      createdAt: new Date(),
    },
    {
      providerId: createdProvider.id,
      categoryId: 2,
      customServiceName: 'Servicio B',
      description: 'Descripción Servicio B',
      basePrice: "750.00",
      isActive: true,
      createdAt: new Date(),
    }
  ]);

  return { createdUser, createdProvider };
}
export async function insertUserProviderAndServicesTest() {
  try {
    const [createdUser] = await db.insert(users).values({
      id: randomUUID(),  // genera un id único para evitar duplicados
      email: `testuser_${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      userType: 'provider',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log('Usuario creado:', createdUser);

    const [createdProvider] = await db.insert(serviceProviders).values({
      userId: createdUser.id,
      businessName: 'Prestador de Prueba',
      description: 'Descripción de prueba.',
      experienceYears: 3,
      serviceAreas: ['Ciudad 1', 'Provincia 1'],
      hourlyRate: "1000.00",
      phoneNumber: '123456789',
      address: 'Calle Falsa 123',
      city: 'Ciudad',
      province: 'Provincia',
      postalCode: '0000',
      isVerified: false,
      isActive: true,
      rating: "4.50",
      totalReviews: 10,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log('Proveedor creado:', createdProvider);
  } catch (error) {
    console.error('Error en inserción test:', error);
  }
}

