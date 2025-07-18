import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  es: {
    translation: {
      // Navigation
      nav: {
        home: "Inicio",
        search: "Buscar",
        services: "Servicios",
        about: "Nosotros",
        howItWorks: "Cómo Funciona",
        contact: "Contacto",
        login: "Iniciar Sesión",
        register: "Registrarse",
        profile: "Perfil",
        dashboard: "Panel",
        logout: "Cerrar Sesión",
        admin: "Administración",
        analytics: "Analytics",
        integrations: "Integraciones",
        wordpress: "WordPress",
        messages: "Mensajes",
        requests: "Mis Solicitudes",
        buyCredits: "Comprar Créditos"
      },
      // Common
      common: {
        loading: "Cargando...",
        error: "Error",
        success: "Éxito",
        save: "Guardar",
        cancel: "Cancelar",
        delete: "Eliminar",
        edit: "Editar",
        view: "Ver",
        create: "Crear",
        update: "Actualizar",
        search: "Buscar",
        filter: "Filtrar",
        clear: "Limpiar",
        submit: "Enviar",
        back: "Volver",
        next: "Siguiente",
        previous: "Anterior",
        close: "Cerrar",
        confirm: "Confirmar",
        yes: "Sí",
        no: "No",
        all: "Todos",
        none: "Ninguno",
        select: "Seleccionar",
        name: "Nombre",
        email: "Email",
        phone: "Teléfono",
        address: "Dirección",
        city: "Ciudad",
        province: "Provincia",
        description: "Descripción",
        price: "Precio",
        date: "Fecha",
        time: "Hora",
        status: "Estado",
        category: "Categoría",
        rating: "Calificación",
        reviews: "Reseñas",
        available: "Disponible",
        unavailable: "No disponible",
        active: "Activo",
        inactive: "Inactivo",
        verified: "Verificado",
        unverified: "No verificado",
        pending: "Pendiente",
        completed: "Completado",
        cancelled: "Cancelado",
        professional: "Profesional",
        customer: "Cliente",
        admin: "Administrador"
      },
      // Landing page
      landing: {
        hero: {
          title: "Encuentra Profesionales de Confianza para tu Hogar",
          subtitle: "Conectamos a personas con los mejores profesionales del hogar en Argentina. Rápido, seguro y confiable.",
          cta: "Buscar Servicios",
          ctaSecondary: "Únete como Profesional"
        },
        features: {
          title: "¿Por qué elegir ServiciosHogar?",
          trust: {
            title: "Profesionales Verificados",
            description: "Todos nuestros profesionales pasan por un proceso de verificación riguroso"
          },
          fast: {
            title: "Respuesta Rápida",
            description: "Recibe cotizaciones en minutos, no en días"
          },
          secure: {
            title: "Pagos Seguros",
            description: "Pago directo al profesional con máxima seguridad"
          },
          support: {
            title: "Soporte 24/7",
            description: "Estamos aquí para ayudarte cuando lo necesites"
          }
        },
        services: {
          title: "Servicios Populares",
          plumbing: "Plomería",
          electrical: "Electricidad",
          cleaning: "Limpieza",
          painting: "Pintura",
          carpentry: "Carpintería",
          viewAll: "Ver Todos los Servicios"
        },
        howItWorks: {
          title: "Cómo Funciona",
          step1: {
            title: "Describe tu Necesidad",
            description: "Cuéntanos qué servicio necesitas y dónde"
          },
          step2: {
            title: "Recibe Cotizaciones",
            description: "Los profesionales te envían sus propuestas"
          },
          step3: {
            title: "Elige y Contrata",
            description: "Selecciona el mejor profesional y agenda el servicio"
          }
        },
        testimonials: {
          title: "Lo que Dicen Nuestros Clientes",
          testimonial1: {
            text: "Encontré un plomero excelente en menos de una hora. Muy recomendado.",
            author: "María González"
          },
          testimonial2: {
            text: "El servicio de limpieza superó mis expectativas. Volveré a usar la plataforma.",
            author: "Carlos Mendoza"
          },
          testimonial3: {
            text: "Como electricista, he conseguido muchos clientes a través de ServiciosHogar.",
            author: "Roberto Silva"
          }
        },
        cta: {
          customer: {
            title: "¿Necesitas un Servicio?",
            description: "Encuentra profesionales de confianza en minutos",
            button: "Buscar Profesionales"
          },
          provider: {
            title: "¿Eres un Profesional?",
            description: "Únete a nuestra red y consigue nuevos clientes",
            button: "Registrarse como Profesional"
          }
        }
      },
      // Services
      services: {
        title: "Servicios Disponibles",
        subtitle: "Encuentra el profesional perfecto para tu proyecto",
        categories: {
          plumbing: {
            name: "Plomería",
            description: "Reparaciones, instalaciones y mantenimiento de plomería"
          },
          electrical: {
            name: "Electricidad",
            description: "Instalaciones eléctricas, reparaciones y mantenimiento"
          },
          cleaning: {
            name: "Limpieza",
            description: "Servicios de limpieza residencial y comercial"
          },
          painting: {
            name: "Pintura",
            description: "Pintura interior, exterior y trabajos especializados"
          },
          carpentry: {
            name: "Carpintería",
            description: "Muebles a medida, reparaciones y trabajos en madera"
          },
          gasFitter: {
            name: "Gasista",
            description: "Instalación y reparación de gas natural y envasado"
          },
          masonry: {
            name: "Albañilería",
            description: "Construcción, reparaciones y trabajos en mampostería"
          },
          airConditioning: {
            name: "Aire Acondicionado",
            description: "Instalación, reparación y mantenimiento de AC"
          },
          gardening: {
            name: "Jardinería",
            description: "Mantenimiento de jardines y espacios verdes"
          },
          locksmith: {
            name: "Cerrajería",
            description: "Cerraduras, llaves y sistemas de seguridad"
          },
          moving: {
            name: "Mudanzas",
            description: "Servicios de mudanza y transporte"
          }
        },
        searchPlaceholder: "Buscar servicios...",
        noResults: "No se encontraron servicios",
        viewDetails: "Ver Detalles",
        requestService: "Solicitar Servicio"
      },
      // Forms
      forms: {
        serviceRequest: {
          title: "Solicitar Servicio",
          serviceType: "Tipo de Servicio",
          title_field: "Título del Trabajo",
          description_field: "Descripción Detallada",
          budget: "Presupuesto Estimado",
          urgency: "Urgencia",
          urgent: "Urgente",
          normal: "Normal",
          flexible: "Flexible",
          scheduledDate: "Fecha Programada",
          location: "Ubicación",
          contact: "Información de Contacto",
          submit: "Enviar Solicitud",
          success: "¡Solicitud enviada exitosamente!",
          error: "Error al enviar la solicitud"
        },
        contact: {
          title: "Contáctanos",
          name: "Nombre Completo",
          email: "Correo Electrónico",
          subject: "Asunto",
          message: "Mensaje",
          send: "Enviar Mensaje",
          success: "Mensaje enviado correctamente",
          error: "Error al enviar el mensaje"
        }
      },
      // Errors
      errors: {
        general: "Ocurrió un error inesperado",
        notFound: "Página no encontrada",
        unauthorized: "No autorizado",
        forbidden: "Acceso denegado",
        serverError: "Error del servidor",
        networkError: "Error de conexión",
        validationError: "Error de validación"
      },
      // Footer
      footer: {
        company: {
          title: "ServiciosHogar",
          description: "La plataforma líder para servicios del hogar en Argentina"
        },
        quickLinks: {
          title: "Enlaces Rápidos",
          home: "Inicio",
          services: "Servicios",
          about: "Nosotros",
          contact: "Contacto",
          blog: "Blog",
          help: "Centro de Ayuda"
        },
        forProfessionals: {
          title: "Para Profesionales",
          join: "Únete como Profesional",
          pricing: "Precios",
          support: "Soporte",
          resources: "Recursos"
        },
        legal: {
          title: "Legal",
          terms: "Términos de Servicio",
          privacy: "Política de Privacidad",
          security: "Seguridad",
          cookies: "Política de Cookies"
        },
        social: {
          title: "Síguenos",
          facebook: "Facebook",
          twitter: "Twitter",
          instagram: "Instagram",
          linkedin: "LinkedIn"
        },
        copyright: "© 2025 ServiciosHogar.com.ar. Todos los derechos reservados."
      }
    }
  },
  en: {
    translation: {
      // Navigation
      nav: {
        home: "Home",
        search: "Search",
        services: "Services",
        about: "About",
        howItWorks: "How It Works",
        contact: "Contact",
        login: "Sign In",
        register: "Sign Up",
        profile: "Profile",
        dashboard: "Dashboard",
        logout: "Sign Out",
        admin: "Admin",
        analytics: "Analytics",
        integrations: "Integrations",
        wordpress: "WordPress",
        messages: "Messages",
        requests: "My Requests",
        buyCredits: "Buy Credits"
      },
      // Common
      common: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        create: "Create",
        update: "Update",
        search: "Search",
        filter: "Filter",
        clear: "Clear",
        submit: "Submit",
        back: "Back",
        next: "Next",
        previous: "Previous",
        close: "Close",
        confirm: "Confirm",
        yes: "Yes",
        no: "No",
        all: "All",
        none: "None",
        select: "Select",
        name: "Name",
        email: "Email",
        phone: "Phone",
        address: "Address",
        city: "City",
        province: "Province",
        description: "Description",
        price: "Price",
        date: "Date",
        time: "Time",
        status: "Status",
        category: "Category",
        rating: "Rating",
        reviews: "Reviews",
        available: "Available",
        unavailable: "Unavailable",
        active: "Active",
        inactive: "Inactive",
        verified: "Verified",
        unverified: "Unverified",
        pending: "Pending",
        completed: "Completed",
        cancelled: "Cancelled",
        professional: "Professional",
        customer: "Customer",
        admin: "Administrator"
      },
      // Landing page
      landing: {
        hero: {
          title: "Find Trusted Home Service Professionals",
          subtitle: "We connect people with the best home service professionals in Argentina. Fast, secure and reliable.",
          cta: "Find Services",
          ctaSecondary: "Join as Professional"
        },
        features: {
          title: "Why Choose ServiciosHogar?",
          trust: {
            title: "Verified Professionals",
            description: "All our professionals go through a rigorous verification process"
          },
          fast: {
            title: "Quick Response",
            description: "Get quotes in minutes, not days"
          },
          secure: {
            title: "Secure Payments",
            description: "Direct payment to professional with maximum security"
          },
          support: {
            title: "24/7 Support",
            description: "We're here to help you when you need it"
          }
        },
        services: {
          title: "Popular Services",
          plumbing: "Plumbing",
          electrical: "Electrical",
          cleaning: "Cleaning",
          painting: "Painting",
          carpentry: "Carpentry",
          viewAll: "View All Services"
        },
        howItWorks: {
          title: "How It Works",
          step1: {
            title: "Describe Your Need",
            description: "Tell us what service you need and where"
          },
          step2: {
            title: "Receive Quotes",
            description: "Professionals send you their proposals"
          },
          step3: {
            title: "Choose and Hire",
            description: "Select the best professional and schedule the service"
          }
        },
        testimonials: {
          title: "What Our Customers Say",
          testimonial1: {
            text: "Found an excellent plumber in less than an hour. Highly recommended.",
            author: "María González"
          },
          testimonial2: {
            text: "The cleaning service exceeded my expectations. Will use the platform again.",
            author: "Carlos Mendoza"
          },
          testimonial3: {
            text: "As an electrician, I've gotten many customers through ServiciosHogar.",
            author: "Roberto Silva"
          }
        },
        cta: {
          customer: {
            title: "Need a Service?",
            description: "Find trusted professionals in minutes",
            button: "Find Professionals"
          },
          provider: {
            title: "Are You a Professional?",
            description: "Join our network and get new customers",
            button: "Register as Professional"
          }
        }
      },
      // Services
      services: {
        title: "Available Services",
        subtitle: "Find the perfect professional for your project",
        categories: {
          plumbing: {
            name: "Plumbing",
            description: "Plumbing repairs, installations and maintenance"
          },
          electrical: {
            name: "Electrical",
            description: "Electrical installations, repairs and maintenance"
          },
          cleaning: {
            name: "Cleaning",
            description: "Residential and commercial cleaning services"
          },
          painting: {
            name: "Painting",
            description: "Interior, exterior and specialized painting work"
          },
          carpentry: {
            name: "Carpentry",
            description: "Custom furniture, repairs and woodwork"
          },
          gasFitter: {
            name: "Gas Fitting",
            description: "Natural and bottled gas installation and repair"
          },
          masonry: {
            name: "Masonry",
            description: "Construction, repairs and masonry work"
          },
          airConditioning: {
            name: "Air Conditioning",
            description: "AC installation, repair and maintenance"
          },
          gardening: {
            name: "Gardening",
            description: "Garden and green space maintenance"
          },
          locksmith: {
            name: "Locksmith",
            description: "Locks, keys and security systems"
          },
          moving: {
            name: "Moving",
            description: "Moving and transportation services"
          }
        },
        searchPlaceholder: "Search services...",
        noResults: "No services found",
        viewDetails: "View Details",
        requestService: "Request Service"
      },
      // Forms
      forms: {
        serviceRequest: {
          title: "Request Service",
          serviceType: "Service Type",
          title_field: "Job Title",
          description_field: "Detailed Description",
          budget: "Estimated Budget",
          urgency: "Urgency",
          urgent: "Urgent",
          normal: "Normal",
          flexible: "Flexible",
          scheduledDate: "Scheduled Date",
          location: "Location",
          contact: "Contact Information",
          submit: "Submit Request",
          success: "Request submitted successfully!",
          error: "Error submitting request"
        },
        contact: {
          title: "Contact Us",
          name: "Full Name",
          email: "Email Address",
          subject: "Subject",
          message: "Message",
          send: "Send Message",
          success: "Message sent successfully",
          error: "Error sending message"
        }
      },
      // Errors
      errors: {
        general: "An unexpected error occurred",
        notFound: "Page not found",
        unauthorized: "Unauthorized",
        forbidden: "Access denied",
        serverError: "Server error",
        networkError: "Connection error",
        validationError: "Validation error"
      },
      // Footer
      footer: {
        company: {
          title: "ServiciosHogar",
          description: "The leading platform for home services in Argentina"
        },
        quickLinks: {
          title: "Quick Links",
          home: "Home",
          services: "Services",
          about: "About",
          contact: "Contact",
          blog: "Blog",
          help: "Help Center"
        },
        forProfessionals: {
          title: "For Professionals",
          join: "Join as Professional",
          pricing: "Pricing",
          support: "Support",
          resources: "Resources"
        },
        legal: {
          title: "Legal",
          terms: "Terms of Service",
          privacy: "Privacy Policy",
          security: "Security",
          cookies: "Cookie Policy"
        },
        social: {
          title: "Follow Us",
          facebook: "Facebook",
          twitter: "Twitter",
          instagram: "Instagram",
          linkedin: "LinkedIn"
        },
        copyright: "© 2025 ServiciosHogar.com.ar. All rights reserved."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;