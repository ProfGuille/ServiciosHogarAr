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
  
  // MVP3 Phase 5: Enhanced Provider Dashboard routes
  try {
    import('./provider-services.js').then(module => {
      app.use('/api/provider/services', module.default);
    }).catch(() => {
      console.log('⚠️ provider-services routes not available yet');
    });
    
    import('./provider-availability.js').then(module => {
      app.use('/api/provider/availability', module.default);
    }).catch(() => {
      console.log('⚠️ provider-availability routes not available yet');
    });
    
    import('./provider-analytics.js').then(module => {
      app.use('/api/provider/analytics', module.default);
    }).catch(() => {
      console.log('⚠️ provider-analytics routes not available yet');
    });
    
    import('./provider-clients.js').then(module => {
      app.use('/api/provider/clients', module.default);
    }).catch(() => {
      console.log('⚠️ provider-clients routes not available yet');
    });
  } catch (error) {
    console.log('⚠️ Provider dashboard routes not loaded:', (error as Error).message);
  }
  
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

