import express from 'express';
import { db } from '../db';
import { serviceProviders } from '../shared/schema';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// GET /api/provider/clients - Get all clients for the provider (mock)
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { search, status } = req.query;

    // Mock clients data
    const mockClients = [
      {
        id: 1,
        name: "María González",
        email: "maria@email.com",
        phone: "+54911234567",
        city: "Buenos Aires",
        totalBookings: 3,
        totalSpent: 15000,
        averageRating: 4.8,
        lastBooking: "2024-01-10",
        firstBooking: "2023-11-15",
        isVip: true,
        notes: "Cliente muy puntual y responsable",
        preferredServices: ["Plomería"],
        loyaltyPoints: 150,
        status: "vip" as const
      },
      {
        id: 2,
        name: "Carlos Rodríguez",
        email: "carlos@email.com",
        phone: "+54911234568",
        city: "Córdoba",
        totalBookings: 2,
        totalSpent: 8000,
        averageRating: 4.5,
        lastBooking: "2024-01-05",
        firstBooking: "2023-12-01",
        isVip: false,
        notes: "",
        preferredServices: ["Electricidad"],
        loyaltyPoints: 80,
        status: "active" as const
      },
      {
        id: 3,
        name: "Ana Martínez",
        email: "ana@email.com",
        phone: "+54911234569",
        city: "Rosario",
        totalBookings: 1,
        totalSpent: 3500,
        averageRating: 5.0,
        lastBooking: "2023-12-20",
        firstBooking: "2023-12-20",
        isVip: false,
        notes: "",
        preferredServices: ["Limpieza"],
        loyaltyPoints: 35,
        status: "inactive" as const
      }
    ];

    // Apply basic filters
    let filteredClients = mockClients;

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredClients = filteredClients.filter(client =>
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm)
      );
    }

    if (status && status !== 'all') {
      filteredClients = filteredClients.filter(client => client.status === status);
    }

    res.json(filteredClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/provider/clients/:id - Get detailed client information (mock)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    // Mock detailed client data
    const mockClientDetails = {
      client: {
        id: clientId,
        name: "María González",
        email: "maria@email.com",
        phone: "+54911234567",
        city: "Buenos Aires",
        totalBookings: 3,
        totalSpent: 15000,
        averageRating: 4.8,
        lastBooking: "2024-01-10",
        firstBooking: "2023-11-15",
        isVip: true,
        notes: "Cliente muy puntual y responsable",
        preferredServices: ["Plomería"],
        loyaltyPoints: 150,
        status: "vip" as const
      },
      bookingHistory: [
        {
          id: 1,
          date: "2024-01-10",
          serviceName: "Reparación de grifo",
          price: 5000,
          status: "completed" as const,
          rating: 5,
          review: "Excelente trabajo, muy profesional"
        },
        {
          id: 2,
          date: "2023-12-15",
          serviceName: "Instalación de cañería",
          price: 8000,
          status: "completed" as const,
          rating: 4.5,
          review: "Muy buen trabajo"
        },
        {
          id: 3,
          date: "2023-11-15",
          serviceName: "Revisión general",
          price: 2000,
          status: "completed" as const,
          rating: 5,
          review: "Perfecto"
        }
      ],
      totalRevenue: 15000,
      averageBookingValue: 5000,
      bookingFrequency: "1 por mes"
    };

    res.json(mockClientDetails);
  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/provider/clients/:id - Update client notes and VIP status (mock)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const clientId = parseInt(req.params.id);
    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const { notes, isVip } = req.body;

    // Mock response
    const result = {
      id: Date.now(),
      providerId: 1,
      clientId,
      notes: notes || '',
      isVip: isVip || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json(result);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/provider/clients/stats - Get client statistics (mock)
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Mock stats
    const mockStats = {
      total: 25,
      vip: 5,
      recent: 12,
      frequent: 8
    };

    res.json(mockStats);
  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;