import { db } from "../db.js";
import { 
  seoMetadata, 
  serviceCategories, 
  serviceProviders, 
  users 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";


export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: any;
}

export interface StructuredDataService {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  provider: {
    "@type": string;
    name: string;
    address?: {
      "@type": string;
      addressLocality: string;
      addressRegion: string;
      addressCountry: string;
    };
  };
  areaServed: string[];
  availableChannel: {
    "@type": string;
    serviceUrl: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    reviewCount: number;
  };
}

export class SEOService {
  
  // Generate SEO metadata for service category pages
  static async getServiceCategorySEO(categoryId: string, categoryName?: string): Promise<SEOData> {
    try {
      // Try to get custom SEO metadata first
      const [customSEO] = await db
        .select()
        .from(seoMetadata)
        .where(and(
          eq(seoMetadata.pageType, "category"),
          eq(seoMetadata.identifier, categoryId),
          eq(seoMetadata.isActive, true)
        ));

      if (customSEO) {
        return {
          title: customSEO.title,
          description: customSEO.description,
          keywords: customSEO.keywords || undefined,
          canonicalUrl: customSEO.canonicalUrl || undefined,
          ogTitle: customSEO.ogTitle || undefined,
          ogDescription: customSEO.ogDescription || undefined,
          ogImage: customSEO.ogImage || undefined,
          structuredData: customSEO.structuredData || undefined,
        };
      }

      // Generate default SEO if no custom metadata
      const categorySlug = categoryName ? categoryName.toLowerCase().replace(/\s+/g, '-') : 'servicio';
      
      return {
        title: `${categoryName || 'Servicios'} en Argentina | ServiciosHogar.com.ar`,
        description: `Encuentra profesionales verificados de ${categoryName?.toLowerCase() || 'servicios'} en Argentina. Cotizaciones gratuitas, profesionales confiables y atención 24/7.`,
        keywords: `${categoryName?.toLowerCase()}, profesionales, argentina, servicios hogar, cotización gratis`,
        canonicalUrl: `https://servicioshogar.com.ar/servicios/${categorySlug}`,
        ogTitle: `${categoryName || 'Servicios'} Profesionales en Argentina`,
        ogDescription: `Conecta con profesionales verificados de ${categoryName?.toLowerCase() || 'servicios'}. Cotizaciones sin costo y atención inmediata.`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": `Servicios de ${categoryName || 'Hogar'}`,
          "description": `Servicios profesionales de ${categoryName?.toLowerCase() || 'hogar'} en Argentina`,
          "provider": {
            "@type": "Organization",
            "name": "ServiciosHogar.com.ar",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "AR"
            }
          },
          "areaServed": "Argentina"
        }
      };
    } catch (error) {
      console.error("Error generating category SEO:", error);
      return this.getDefaultSEO();
    }
  }

  // Generate SEO metadata for provider profile pages
  static async getProviderSEO(providerId: string): Promise<SEOData> {
    try {
      // Try to get custom SEO metadata first
      const [customSEO] = await db
        .select()
        .from(seoMetadata)
        .where(and(
          eq(seoMetadata.pageType, "provider_profile"),
          eq(seoMetadata.identifier, providerId),
          eq(seoMetadata.isActive, true)
        ));

      if (customSEO) {
        return {
          title: customSEO.title,
          description: customSEO.description,
          keywords: customSEO.keywords || undefined,
          canonicalUrl: customSEO.canonicalUrl || undefined,
          ogTitle: customSEO.ogTitle || undefined,
          ogDescription: customSEO.ogDescription || undefined,
          ogImage: customSEO.ogImage || undefined,
          structuredData: customSEO.structuredData || undefined,
        };
      }

      // Get provider data for dynamic SEO
      const [provider] = await db
        .select()
        .from(serviceProviders)
        .where(eq(serviceProviders.id, parseInt(providerId)));

      if (!provider) {
        return this.getDefaultSEO();
      }

      const businessName = provider.businessName || "Profesional";
      const location = provider.city ? `en ${provider.city}` : "en Argentina";
      const rating = provider.rating ? `★${Number(provider.rating).toFixed(1)}` : "";

      return {
        title: `${businessName} ${location} ${rating} | ServiciosHogar.com.ar`,
        description: `${businessName} - Profesional verificado ${location}. ${provider.description || 'Servicios de calidad con experiencia comprobada'}. Cotización gratuita.`,
        keywords: `${businessName.toLowerCase()}, profesional, ${provider.city?.toLowerCase()}, servicios hogar`,
        canonicalUrl: `https://servicioshogar.com.ar/profesional/${providerId}`,
        ogTitle: `${businessName} - Profesional Verificado`,
        ogDescription: `Contrata a ${businessName}, profesional verificado ${location}. ${rating ? `Calificación: ${rating}` : 'Excelente reputación'}.`,
        ogImage: provider.profileImageUrl || undefined,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": businessName,
          "description": provider.description || "Servicios profesionales para el hogar",
          "address": provider.city ? {
            "@type": "PostalAddress",
            "addressLocality": provider.city,
            "addressRegion": provider.province || "",
            "addressCountry": "AR"
          } : undefined,
          "aggregateRating": provider.rating && provider.totalReviews ? {
            "@type": "AggregateRating",
            "ratingValue": Number(provider.rating),
            "reviewCount": provider.totalReviews
          } : undefined,
          "priceRange": provider.hourlyRate ? `$${provider.hourlyRate}+` : undefined
        }
      };
    } catch (error) {
      console.error("Error generating provider SEO:", error);
      return this.getDefaultSEO();
    }
  }

  // Generate SEO metadata for service detail pages
  static async getServiceDetailSEO(serviceSlug: string): Promise<SEOData> {
    try {
      // Try to get custom SEO metadata first
      const [customSEO] = await db
        .select()
        .from(seoMetadata)
        .where(and(
          eq(seoMetadata.pageType, "service_detail"),
          eq(seoMetadata.identifier, serviceSlug),
          eq(seoMetadata.isActive, true)
        ));

      if (customSEO) {
        return {
          title: customSEO.title,
          description: customSEO.description,
          keywords: customSEO.keywords || undefined,
          canonicalUrl: customSEO.canonicalUrl || undefined,
          ogTitle: customSEO.ogTitle || undefined,
          ogDescription: customSEO.ogDescription || undefined,
          ogImage: customSEO.ogImage || undefined,
          structuredData: customSEO.structuredData || undefined,
        };
      }

      // Generate default SEO based on service slug
      const serviceName = serviceSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      return {
        title: `${serviceName} - Profesionales Verificados | ServiciosHogar.com.ar`,
        description: `Encuentra profesionales de ${serviceName.toLowerCase()} verificados en Argentina. Cotizaciones gratuitas, atención inmediata y garantía de calidad.`,
        keywords: `${serviceName.toLowerCase()}, profesionales, argentina, cotización gratis, verificados`,
        canonicalUrl: `https://servicioshogar.com.ar/servicios/${serviceSlug}`,
        ogTitle: `${serviceName} - Profesionales en Argentina`,
        ogDescription: `Conecta con profesionales verificados de ${serviceName.toLowerCase()}. Proceso rápido y seguro.`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": serviceName,
          "description": `Servicios profesionales de ${serviceName.toLowerCase()} en Argentina`,
          "provider": {
            "@type": "Organization",
            "name": "ServiciosHogar.com.ar"
          },
          "areaServed": "Argentina"
        }
      };
    } catch (error) {
      console.error("Error generating service detail SEO:", error);
      return this.getDefaultSEO();
    }
  }

  // Get default SEO metadata
  static getDefaultSEO(): SEOData {
    return {
      title: "ServiciosHogar.com.ar - Servicios Profesionales para el Hogar en Argentina",
      description: "Encuentra profesionales verificados para servicios del hogar en Argentina. Plomería, electricidad, limpieza, carpintería y más. Cotizaciones gratuitas y atención inmediata.",
      keywords: "servicios hogar, profesionales, argentina, plomería, electricidad, limpieza, carpintería, cotización gratis",
      canonicalUrl: "https://servicioshogar.com.ar",
      ogTitle: "ServiciosHogar.com.ar - Tu Plataforma de Servicios de Confianza",
      ogDescription: "Conecta con profesionales verificados en Argentina. Más de 1000 servicios disponibles con garantía de calidad.",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ServiciosHogar.com.ar",
        "description": "Plataforma líder de servicios profesionales para el hogar en Argentina",
        "url": "https://servicioshogar.com.ar",
        "sameAs": [
          "https://www.facebook.com/servicioshogar",
          "https://www.instagram.com/servicioshogar"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "AR"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "Spanish"
        }
      }
    };
  }

  // Generate sitemap data for WordPress
  static async generateSitemapData() {
    try {
      const urls = [];

      // Add main pages
      urls.push({
        url: "/",
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: 1.0
      });

      urls.push({
        url: "/servicios",
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
        priority: 0.9
      });

      // Add service categories
      const categories = await db
        .select({
          id: serviceCategories.id,
          name: serviceCategories.name,
          updatedAt: serviceCategories.createdAt
        })
        .from(serviceCategories)
        .where(eq(serviceCategories.isActive, true));

      for (const category of categories) {
        const slug = category.name.toLowerCase().replace(/\s+/g, '-');
        urls.push({
          url: `/servicios/${slug}`,
          lastmod: category.updatedAt?.toISOString() || new Date().toISOString(),
          changefreq: "weekly",
          priority: 0.8
        });
      }

      // Add top provider profiles
      const providers = await db
        .select({
          id: serviceProviders.id,
          businessName: serviceProviders.businessName,
          updatedAt: serviceProviders.updatedAt
        })
        .from(serviceProviders)
        .where(and(
          eq(serviceProviders.isActive, true),
          eq(serviceProviders.isVerified, true)
        ))
        .limit(100); // Top 100 providers

      for (const provider of providers) {
        urls.push({
          url: `/profesional/${provider.id}`,
          lastmod: provider.updatedAt?.toISOString() || new Date().toISOString(),
          changefreq: "monthly",
          priority: 0.6
        });
      }

      return urls;
    } catch (error) {
      console.error("Error generating sitemap data:", error);
      return [];
    }
  }
}
