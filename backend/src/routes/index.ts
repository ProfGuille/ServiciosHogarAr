import express from 'express';
import usersRoutes from './users.js';
import authRoutes from './auth.js';
import clientsRoutes from './clients.js';
import conversationsRoutes from './conversations.js';
import messagesRoutes from './messages.js';
import searchRoutes from './search.js';
import geolocationRoutes from './geolocation.js';
import searchSuggestionsRoutes from './search-suggestions.js';
import categoriesRoutes from './categories.js';

export function registerRoutes(app: express.Express) {
  console.log('Registrando rutas de la API...');
  
  // Authentication
  app.use('/api/auth', authRoutes);

  // Core
  app.use('/api/users', usersRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/conversations', conversationsRoutes);
  app.use('/api/messages', messagesRoutes);

  // Categories
  app.use('/api/categories', categoriesRoutes);

  // Search & Geolocation
  app.use('/api/search', searchRoutes);
  app.use('/api/search-suggestions', searchSuggestionsRoutes);
  app.use('/api/geolocation', geolocationRoutes);

  // Provider Dashboard (dynamic imports)
  try {
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

  // Notifications
  try {
    import('./mvp3/notifications.js').then(module => {
      app.use('/api/notifications', module.default);
    }).catch(() => {
      console.log('⚠️ notifications routes not available yet');
    });
  } catch (error) {
    console.log('⚠️ Notifications routes not loaded:', (error as Error).message);
  }

  // Analytics
  try {
    import('./analytics.js').then(module => {
      app.use('/api/analytics', module.default);
    }).catch(() => {
      console.log('⚠️ analytics routes not available yet');
    });
  } catch (error) {
    console.log('⚠️ Analytics routes not loaded:', (error as Error).message);
  }

  // Upload
  try {
    import('./upload.js').then(module => {
      app.use('/api/upload', module.default);
    }).catch(() => {
      console.log('⚠️ upload routes not available yet');
    });
  } catch (error) {
    console.log('⚠️ Upload routes not loaded:', (error as Error).message);
  }

  // Services & Providers
  try {
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

  } catch (error) {
    console.log('⚠️ Some optional routes not loaded:', (error as Error).message);
  }

  console.log('✅ Rutas registradas exitosamente');
}

