import express from 'express';
import usersRoutes from './users.js';
import authRoutes from './auth.js';
import clientsRoutes from './clients.js';
import conversationsRoutes from './conversations.js';
import messagesRoutes from './messages.js';
import searchRoutes from './search.js';
import geolocationRoutes from './geolocation.js';
import searchSuggestionsRoutes from './search-suggestions.js';

export function registerRoutes(app: express.Express) {
  console.log('Registrando rutas de la API...');
  
  // Authentication routes
  app.use('/api/auth', authRoutes);
  
  // Core routes
  app.use('/api/users', usersRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/conversations', conversationsRoutes);
  app.use('/api/messages', messagesRoutes);
  
  // MVP3 Phase 3: Search and Geolocation routes
  app.use('/api/search', searchRoutes);
  app.use('/api/search-suggestions', searchSuggestionsRoutes);
  app.use('/api/geolocation', geolocationRoutes);
  
  // Service-related routes
  try {
    // Dynamically import optional routes
    import('./serviceRequests.js').then(module => {
      app.use('/api/service-requests', module.default);
    }).catch(() => {
      console.log('⚠️ serviceRequests routes not available yet');
    });
    
    import('./services.js').then(module => {
      app.use('/api/services', module.default);
    }).catch(() => {
      console.log('⚠️ services routes not available yet');
    });
    
    import('./serviceProviders.js').then(module => {
      app.use('/api/providers', module.default);
    }).catch(() => {
      console.log('⚠️ serviceProviders routes not available yet');
    });
    
    import('./payments.js').then(module => {
      app.use('/api/payments', module.default);
    }).catch(() => {
      console.log('⚠️ payments routes not available yet');
    });
    
    import('./categories.js').then(module => {
      app.use('/api/categories', module.default);
    }).catch(() => {
      console.log('⚠️ categories routes not available yet');
    });

  } catch (error) {
    console.log('⚠️ Some optional routes not loaded:', (error as Error).message);
  }

  console.log('✅ Rutas registradas exitosamente');
}

