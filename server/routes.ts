import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

// Initialize Mercado Pago
let mercadopagoClient: any = null;
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  mercadopagoClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: {
      timeout: 5000,
    }
  });
}
import { 
  insertServiceCategorySchema,
  insertServiceProviderSchema,
  insertProviderServiceSchema,
  insertServiceRequestSchema,
  insertReviewSchema,
  insertMessageSchema,
  insertPaymentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Service Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      // Only admin can create categories
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const categoryData = insertServiceCategorySchema.parse(req.body);
      const category = await storage.createServiceCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Service Providers
  app.get('/api/providers', async (req, res) => {
    try {
      const { city, categoryId, isVerified, limit = "20", offset = "0" } = req.query;
      
      const filters = {
        city: city as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        isVerified: isVerified ? isVerified === 'true' : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const providers = await storage.getServiceProviders(filters);
      res.json(providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  app.get('/api/providers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid provider ID" });
      }
      
      const provider = await storage.getServiceProviderById(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      console.error("Error fetching provider:", error);
      res.status(500).json({ message: "Failed to fetch provider" });
    }
  });

  app.post('/api/providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user already has a provider profile
      const existingProvider = await storage.getServiceProviderByUserId(userId);
      if (existingProvider) {
        return res.status(400).json({ message: "Provider profile already exists" });
      }

      const providerData = insertServiceProviderSchema.parse({
        ...req.body,
        userId,
      });
      
      const provider = await storage.createServiceProvider(providerData);
      
      // Update user type to provider
      await storage.upsertUser({ id: userId, userType: 'provider' });
      
      res.status(201).json(provider);
    } catch (error) {
      console.error("Error creating provider:", error);
      res.status(500).json({ message: "Failed to create provider" });
    }
  });

  app.put('/api/providers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns this provider profile
      const provider = await storage.getServiceProviderById(id);
      if (!provider || provider.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = insertServiceProviderSchema.partial().parse(req.body);
      const updatedProvider = await storage.updateServiceProvider(id, updates);
      
      res.json(updatedProvider);
    } catch (error) {
      console.error("Error updating provider:", error);
      res.status(500).json({ message: "Failed to update provider" });
    }
  });

  // Get current provider profile
  app.get('/api/providers/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const provider = await storage.getServiceProviderByUserId(userId);
      
      if (!provider) {
        return res.status(404).json({ message: "Provider profile not found" });
      }

      res.json(provider);
    } catch (error) {
      console.error("Error fetching provider profile:", error);
      res.status(500).json({ message: "Failed to fetch provider profile" });
    }
  });

  // Get provider stats
  app.get('/api/providers/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns this provider profile or is admin
      const provider = await storage.getServiceProviderById(providerId);
      const user = await storage.getUser(userId);
      
      if (!provider || (provider.userId !== userId && user?.userType !== 'admin')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getProviderStats(providerId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching provider stats:", error);
      res.status(500).json({ message: "Failed to fetch provider stats" });
    }
  });

  // Provider Services
  app.get('/api/providers/:id/services', async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const services = await storage.getProviderServices(providerId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching provider services:", error);
      res.status(500).json({ message: "Failed to fetch provider services" });
    }
  });

  app.post('/api/providers/:id/services', isAuthenticated, async (req: any, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns this provider profile
      const provider = await storage.getServiceProviderById(providerId);
      if (!provider || provider.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const serviceData = insertProviderServiceSchema.parse({
        ...req.body,
        providerId,
      });
      
      const service = await storage.createProviderService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating provider service:", error);
      res.status(500).json({ message: "Failed to create provider service" });
    }
  });

  // Service Requests
  app.get('/api/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { status, city, limit = "20", offset = "0" } = req.query;
      
      let filters: any = {
        status: status as string,
        city: city as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      // If user is a customer, only show their requests
      if (user?.userType === 'customer') {
        filters.customerId = userId;
      }
      // If user is a provider, show requests assigned to them or available requests
      else if (user?.userType === 'provider') {
        const provider = await storage.getServiceProviderByUserId(userId);
        if (provider) {
          filters.providerId = provider.id;
        }
      }
      // Admin can see all requests (no additional filters)

      const requests = await storage.getServiceRequests(filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.get('/api/requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const request = await storage.getServiceRequestById(id);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      // Check access permissions
      if (user?.userType === 'customer' && request.customerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (user?.userType === 'provider') {
        const provider = await storage.getServiceProviderByUserId(userId);
        if (provider && request.providerId !== provider.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching service request:", error);
      res.status(500).json({ message: "Failed to fetch service request" });
    }
  });

  app.post('/api/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const requestData = insertServiceRequestSchema.parse({
        ...req.body,
        customerId: userId,
      });
      
      const request = await storage.createServiceRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating service request:", error);
      res.status(500).json({ message: "Failed to create service request" });
    }
  });

  app.put('/api/requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const request = await storage.getServiceRequestById(id);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      // Check permissions
      let canUpdate = false;
      
      if (user?.userType === 'customer' && request.customerId === userId) {
        canUpdate = true;
      } else if (user?.userType === 'provider') {
        const provider = await storage.getServiceProviderByUserId(userId);
        if (provider && request.providerId === provider.id) {
          canUpdate = true;
        }
      } else if (user?.userType === 'admin') {
        canUpdate = true;
      }
      
      if (!canUpdate) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = insertServiceRequestSchema.partial().parse(req.body);
      const updatedRequest = await storage.updateServiceRequest(id, updates);
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(500).json({ message: "Failed to update service request" });
    }
  });

  // Reviews
  app.get('/api/providers/:id/reviews', async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const reviews = await storage.getReviewsForProvider(providerId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Messages
  app.get('/api/requests/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const serviceRequestId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user has access to this service request
      const request = await storage.getServiceRequestById(serviceRequestId);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      const user = await storage.getUser(userId);
      let hasAccess = false;
      
      if (request.customerId === userId) {
        hasAccess = true;
      } else if (user?.userType === 'provider') {
        const provider = await storage.getServiceProviderByUserId(userId);
        if (provider && request.providerId === provider.id) {
          hasAccess = true;
        }
      } else if (user?.userType === 'admin') {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getMessagesForServiceRequest(serviceRequestId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Analytics
  app.get('/api/providers/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check permissions
      if (user?.userType === 'provider') {
        const provider = await storage.getServiceProviderByUserId(userId);
        if (!provider || provider.id !== providerId) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getProviderStats(providerId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching provider stats:", error);
      res.status(500).json({ message: "Failed to fetch provider stats" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  // Admin Routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get all users (this would need to be implemented in storage)
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const providers = await storage.getServiceProviders({ limit: 100, offset: 0 });
      res.json(providers);
    } catch (error) {
      console.error("Error fetching providers for admin:", error);
      res.status(500).json({ message: "Failed to fetch providers" });
    }
  });

  app.get('/api/admin/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const requests = await storage.getServiceRequests({ limit: 100, offset: 0 });
      res.json(requests);
    } catch (error) {
      console.error("Error fetching requests for admin:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.put('/api/admin/providers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const id = parseInt(req.params.id);
      const { isVerified, isActive } = req.body;

      const updatedProvider = await storage.updateServiceProvider(id, {
        isVerified,
        isActive,
      });

      res.json(updatedProvider);
    } catch (error) {
      console.error("Error updating provider:", error);
      res.status(500).json({ message: "Failed to update provider" });
    }
  });

  // Test payment methods (no auth for testing)
  app.post('/api/test-payments', async (req, res) => {
    try {
      const { method, serviceRequestId } = req.body;
      
      if (method === 'bank_transfer') {
        const paymentData = {
          serviceRequestId: parseInt(serviceRequestId),
          customerId: "test-customer",
          providerId: 4,
          amount: "150000",
          platformFee: "15000",
          providerAmount: "135000",
          paymentMethod: "bank_transfer",
          transferReference: "TRF123456789",
          bankAccountNumber: "0110599520000001234567",
          bankName: "Banco Galicia",
          accountHolderName: "ServiciosHogar.com.ar",
        };
        
        const payment = await storage.createPayment(paymentData);
        res.json({ success: true, payment, message: "Bank transfer payment created successfully" });
        
      } else if (method === 'cash') {
        const paymentData = {
          serviceRequestId: parseInt(serviceRequestId),
          customerId: "test-customer",
          providerId: 4,
          amount: "150000",
          platformFee: "15000",
          providerAmount: "135000",
          paymentMethod: "cash",
          cashLocation: "En mi domicilio al finalizar el trabajo",
          cashInstructions: "Coordinar con el profesional para el pago en efectivo al finalizar el servicio.",
        };
        
        const payment = await storage.createPayment(paymentData);
        res.json({ success: true, payment, message: "Cash payment registered successfully" });
        
      } else if (method === 'mercadopago') {
        if (!mercadopagoClient) {
          return res.json({ 
            success: false, 
            message: "Mercado Pago not configured. Credentials needed.",
            needsCredentials: true
          });
        }
        
        const preference = new Preference(mercadopagoClient);
        const preferenceData = {
          items: [{
            id: `service-${serviceRequestId}`,
            title: "Test - Instalación de tomas adicionales",
            description: "Test payment for service",
            quantity: 1,
            currency_id: "ARS",
            unit_price: 150000
          }],
          payer: {
            email: "test@servicioshogar.com.ar"
          },
          back_urls: {
            success: `http://localhost:5000/payment-success/${serviceRequestId}`,
            failure: `http://localhost:5000/payment-failure/${serviceRequestId}`,
            pending: `http://localhost:5000/payment-pending/${serviceRequestId}`
          },
          auto_return: "approved",
          external_reference: serviceRequestId.toString(),
        };

        const response = await preference.create({ body: preferenceData });
        
        const paymentData = {
          serviceRequestId: parseInt(serviceRequestId),
          customerId: "test-customer",
          providerId: 4,
          amount: "150000",
          platformFee: "15000",
          providerAmount: "135000",
          paymentMethod: "mercadopago",
          mercadopagoPreferenceId: response.id,
        };
        
        const payment = await storage.createPayment(paymentData);
        
        res.json({ 
          success: true, 
          payment, 
          preferenceId: response.id,
          initPoint: response.init_point,
          message: "Mercado Pago preference created successfully" 
        });
        
      } else {
        res.status(400).json({ success: false, message: "Invalid payment method" });
      }
    } catch (error: any) {
      console.error("Test payment error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Test endpoint for payment scenario
  app.post('/api/admin/create-payment-test', async (req, res) => {
    try {
      // First check if we have any requests at all
      const allRequests = await storage.getServiceRequests({});
      console.log(`Found ${allRequests.length} total requests`);
      
      // Look for quoted requests first
      let testRequest = allRequests.find(r => r.quotedPrice && r.status === 'quoted');
      
      if (!testRequest) {
        // If no quoted requests, create one
        console.log("No quoted requests found, creating one...");
        
        // Get a pending request to convert
        const pendingRequest = allRequests.find(r => r.status === 'pending');
        if (pendingRequest) {
          testRequest = await storage.updateServiceRequest(pendingRequest.id, {
            status: 'quoted',
            quotedPrice: '150000', // 150,000 ARS
            providerResponse: 'Precio cotizado para el servicio solicitado. Incluye materiales y mano de obra.',
            quotedAt: new Date(),
          });
          console.log(`Updated request ${pendingRequest.id} to quoted status`);
        }
      }
      
      if (testRequest) {
        // Now update to accepted status for payment
        const acceptedRequest = await storage.updateServiceRequest(testRequest.id, {
          status: 'accepted',
          paymentStatus: 'pending',
          acceptedAt: new Date(),
        });
        
        res.json({ 
          message: "Payment test scenario created successfully", 
          requestId: testRequest.id,
          amount: testRequest.quotedPrice,
          paymentUrl: `/payment/${testRequest.id}`,
          details: acceptedRequest
        });
      } else {
        // Create a test request with quote if none exist
        if (allRequests.length === 0) {
          console.log("Creating test service request...");
          const testRequestData = {
            customerId: "test-customer-123",
            serviceType: "Plomería",
            title: "Reparación de tubería de baño",
            description: "Necesito reparar una tubería que gotea en el baño principal. Es urgente.",
            address: "Av. Corrientes 1234",
            city: "Buenos Aires",
            contactPhone: "+54 9 11 1234-5678",
            preferredDateTime: new Date(),
            estimatedBudget: "100000",
            urgencyLevel: "high" as const,
            status: "quoted" as const,
            quotedPrice: "150000",
            providerResponse: "Precio cotizado para reparación de tubería. Incluye materiales y mano de obra.",
            quotedAt: new Date(),
            providerId: 1,
          };
          
          const newRequest = await storage.createServiceRequest(testRequestData);
          
          // Now update to accepted for payment testing
          const acceptedRequest = await storage.updateServiceRequest(newRequest.id, {
            status: 'accepted',
            paymentStatus: 'pending',
            acceptedAt: new Date(),
          });
          
          res.json({ 
            message: "Created new test request and prepared for payment", 
            requestId: newRequest.id,
            amount: newRequest.quotedPrice,
            paymentUrl: `/payment/${newRequest.id}`,
            details: acceptedRequest
          });
        } else {
          res.json({ 
            message: "No requests available - please create test data first",
            totalRequests: allRequests.length
          });
        }
      }
    } catch (error) {
      console.error("Error creating payment test:", error);
      res.status(500).json({ message: "Failed to create payment test scenario" });
    }
  });

  // Payment Routes
  app.post('/api/payments/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { serviceRequestId, amount } = req.body;

      // Validate service request and user permissions
      const serviceRequest = await storage.getServiceRequestById(serviceRequestId);
      if (!serviceRequest || serviceRequest.customerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (serviceRequest.status !== 'accepted') {
        return res.status(400).json({ message: "Payment can only be made for accepted services" });
      }

      // Calculate platform fee (10% of total)
      const totalAmount = Math.round(parseFloat(amount) * 100); // Convert to cents
      const platformFee = Math.round(totalAmount * 0.10);
      const providerAmount = totalAmount - platformFee;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'ars',
        metadata: {
          serviceRequestId: serviceRequestId.toString(),
          customerId: userId,
          providerId: serviceRequest.providerId?.toString() || '',
          platformFee: platformFee.toString(),
          providerAmount: providerAmount.toString(),
        },
      });

      // Update service request with payment intent
      await storage.updateServiceRequest(serviceRequestId, {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: 'processing',
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/payments/confirm', isAuthenticated, async (req: any, res) => {
    try {
      const { paymentIntentId } = req.body;
      const userId = req.user.claims.sub;

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const serviceRequestId = parseInt(paymentIntent.metadata.serviceRequestId);
        const serviceRequest = await storage.getServiceRequestById(serviceRequestId);

        if (!serviceRequest || serviceRequest.customerId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }

        // Create payment record
        const paymentData = {
          serviceRequestId,
          customerId: userId,
          providerId: serviceRequest.providerId!,
          amount: (paymentIntent.amount / 100).toString(),
          platformFee: (parseInt(paymentIntent.metadata.platformFee) / 100).toString(),
          providerAmount: (parseInt(paymentIntent.metadata.providerAmount) / 100).toString(),
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: paymentIntent.latest_charge?.toString(),
          status: 'succeeded' as const,
          currency: 'ars',
          paidAt: new Date(),
        };

        await storage.createPayment(paymentData);

        // Update service request status
        await storage.updateServiceRequest(serviceRequestId, {
          paymentStatus: 'paid',
          status: 'in_progress',
        });

        res.json({ success: true, message: "Payment confirmed successfully" });
      } else {
        res.status(400).json({ message: "Payment not succeeded" });
      }
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  app.get('/api/payments/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let payments;
      if (user?.userType === 'customer') {
        payments = await storage.getPaymentsByCustomer(userId);
      } else if (user?.userType === 'provider') {
        const provider = await storage.getServiceProviderByUserId(userId);
        if (provider) {
          payments = await storage.getPaymentsByProvider(provider.id);
        }
      } else if (user?.userType === 'admin') {
        payments = await storage.getAllPayments();
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(payments || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  // Mercado Pago preference creation
  app.post("/api/create-mercadopago-preference", isAuthenticated, async (req: any, res) => {
    try {
      if (!mercadopagoClient) {
        return res.status(400).json({ message: "Mercado Pago not configured. Please contact support." });
      }

      const { serviceRequestId, amount, title, description } = req.body;
      
      if (!serviceRequestId || !amount) {
        return res.status(400).json({ message: "Service request ID and amount are required" });
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Platform fee (10%)
      const platformFee = numericAmount * 0.10;
      const providerAmount = numericAmount - platformFee;

      const preference = new Preference(mercadopagoClient);

      const preferenceData = {
        items: [
          {
            id: `service-${serviceRequestId}`,
            title: title || "Servicio de hogar",
            description: description || "Pago por servicio profesional",
            quantity: 1,
            currency_id: "ARS",
            unit_price: numericAmount
          }
        ],
        payer: {
          email: req.user.claims.email || "customer@servicioshogar.com.ar"
        },
        back_urls: {
          success: `${req.protocol}://${req.hostname}/payment-success/${serviceRequestId}`,
          failure: `${req.protocol}://${req.hostname}/payment-failure/${serviceRequestId}`,
          pending: `${req.protocol}://${req.hostname}/payment-pending/${serviceRequestId}`
        },
        auto_return: "approved",
        external_reference: serviceRequestId.toString(),
        metadata: {
          serviceRequestId: serviceRequestId.toString(),
          platformFee: platformFee.toString(),
          providerAmount: providerAmount.toString(),
          customerId: req.user.claims.sub,
        },
        notification_url: `${req.protocol}://${req.hostname}/api/mercadopago-webhook`
      };

      const response = await preference.create({ body: preferenceData });

      res.json({
        preferenceId: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
        platformFee: platformFee,
        providerAmount: providerAmount,
      });
    } catch (error: any) {
      console.error("Error creating Mercado Pago preference:", error);
      res.status(500).json({ message: "Error creating Mercado Pago preference: " + error.message });
    }
  });

  // Mercado Pago webhook
  app.post("/api/mercadopago-webhook", async (req, res) => {
    try {
      const { id, topic } = req.body;
      
      if (topic === 'payment') {
        if (!mercadopagoClient) {
          return res.status(400).send('Mercado Pago not configured');
        }

        const payment = new Payment(mercadopagoClient);
        const paymentInfo = await payment.get({ id });

        // Update payment in database
        if (paymentInfo.external_reference) {
          const serviceRequestId = parseInt(paymentInfo.external_reference);
          
          let status = 'pending';
          if (paymentInfo.status === 'approved') status = 'succeeded';
          else if (paymentInfo.status === 'rejected') status = 'failed';
          else if (paymentInfo.status === 'cancelled') status = 'cancelled';

          // Find existing payment record
          const existingPayment = await storage.getPaymentByServiceRequest(serviceRequestId);
          
          if (existingPayment && existingPayment.paymentMethod === 'mercadopago') {
            console.log(`Updating Mercado Pago payment ${existingPayment.id} status to ${status}`);
            
            if (status === 'succeeded') {
              await storage.updateServiceRequest(serviceRequestId, {
                paymentStatus: 'paid'
              });
            }
          }
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Mercado Pago webhook error:', error);
      res.status(500).send('Error');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
