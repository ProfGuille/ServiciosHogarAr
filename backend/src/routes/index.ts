import express from 'express';
import usersRoutes from './users.js';
import clientsRoutes from './clients.js';
import conversationsRoutes from './conversations.js';
import messagesRoutes from './messages.js';
import serviceRequestsRouter from './serviceRequests';



export function registerRoutes(app: express.Express) {
  console.log('Registrando rutas...');
  app.use('/api/users', usersRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/conversations', conversationsRoutes);
  app.use('/api/messages', messagesRoutes);
  app.use('/api/service-requests', serviceRequestsRouter);
}

