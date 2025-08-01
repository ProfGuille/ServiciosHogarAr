import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: any;
}

interface SEOHeadProps {
  pageType?: string;
  identifier?: string;
  customSEO?: Partial<SEOData>;
}

export function SEOHead({ pageType, identifier, customSEO }: SEOHeadProps) {
  const [location] = useLocation();
  const [seoData, setSeoData] = useState<SEOData | null>(null);

  useEffect(() => {
    const fetchSEOData = async () => {
      if (customSEO) {
        // Use custom SEO data if provided
        setSeoData({
          title: "ServiciosHogar.com.ar - Servicios Profesionales",
          description: "Encuentra profesionales verificados para servicios del hogar en Argentina.",
          ...customSEO
        });
        return;
      }

      if (pageType) {
        try {
          const endpoint = identifier 
            ? `/api/seo/${pageType}/${identifier}`
            : `/api/seo/${pageType}`;
          
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            setSeoData(data);
          }
        } catch (error) {
          console.error("Error fetching SEO data:", error);
        }
      }

      // Fallback to default SEO
      if (!seoData) {
        setSeoData({
          title: "ServiciosHogar.com.ar - Servicios Profesionales para el Hogar",
          description: "Encuentra profesionales verificados para servicios del hogar en Argentina. Plomería, electricidad, limpieza y más.",
          keywords: "servicios hogar, profesionales, argentina, plomería, electricidad",
          canonicalUrl: `https://servicioshogar.com.ar${location}`
        });
      }
    };

    fetchSEOData();
  }, [pageType, identifier, location, customSEO]);

  useEffect(() => {
    if (!seoData) return;

    // Update document title
    document.title = seoData.title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string | undefined, property?: string) => {
      if (!content) return;

      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update or create link tags
    const updateLinkTag = (rel: string, href: string | undefined) => {
      if (!href) return;

      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
    };

    // Basic meta tags
    updateMetaTag('description', seoData.description);
    updateMetaTag('keywords', seoData.keywords);

    // Open Graph tags
    updateMetaTag('og:title', seoData.ogTitle || seoData.title, 'property');
    updateMetaTag('og:description', seoData.ogDescription || seoData.description, 'property');
    updateMetaTag('og:image', seoData.ogImage, 'property');
    updateMetaTag('og:url', seoData.canonicalUrl || `https://servicioshogar.com.ar${location}`, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:site_name', 'ServiciosHogar.com.ar', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoData.ogTitle || seoData.title);
    updateMetaTag('twitter:description', seoData.ogDescription || seoData.description);
    updateMetaTag('twitter:image', seoData.ogImage);

    // Canonical URL
    updateLinkTag('canonical', seoData.canonicalUrl || `https://servicioshogar.com.ar${location}`);

    // Structured data (JSON-LD)
    if (seoData.structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      
      script.textContent = JSON.stringify(seoData.structuredData);
    }

    // Additional SEO meta tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'ServiciosHogar.com.ar');
    updateMetaTag('language', 'Spanish');
    updateMetaTag('revisit-after', '7 days');

  }, [seoData, location]);

  return null; // This component doesn't render anything visible
}

// Hook for easy SEO management in pages
export function useSEO(pageType: string, identifier?: string, customSEO?: Partial<SEOData>) {
  return { pageType, identifier, customSEO };
}

// Predefined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    pageType: "home",
    customSEO: {
      title: "ServiciosHogar.com.ar - Servicios Profesionales para el Hogar en Argentina",
      description: "Encuentra profesionales verificados para servicios del hogar en Argentina. Plomería, electricidad, limpieza, carpintería y más. Cotizaciones gratuitas.",
      keywords: "servicios hogar, profesionales argentina, plomería, electricidad, limpieza, carpintería, cotización gratis",
      canonicalUrl: "https://servicioshogar.com.ar",
      ogTitle: "ServiciosHogar.com.ar - Tu Plataforma de Servicios de Confianza",
      ogDescription: "Conecta con más de 1000 profesionales verificados en Argentina. Servicios de calidad garantizada.",
    }
  },
  
  services: {
    pageType: "services",
    customSEO: {
      title: "Servicios para el Hogar - Profesionales Verificados | ServiciosHogar.com.ar",
      description: "Explora todos nuestros servicios: plomería, electricidad, limpieza, carpintería, jardinería y más. Profesionales verificados en toda Argentina.",
      keywords: "servicios hogar, profesionales, plomería, electricidad, limpieza, carpintería, jardinería, argentina",
      canonicalUrl: "https://servicioshogar.com.ar/servicios",
    }
  },
  
  about: {
    pageType: "page",
    identifier: "about",
    customSEO: {
      title: "Acerca de ServiciosHogar.com.ar - Nuestra Historia y Misión",
      description: "Conoce más sobre ServiciosHogar.com.ar, la plataforma líder en servicios profesionales para el hogar en Argentina. Nuestra misión es conectar clientes con profesionales de confianza.",
      keywords: "sobre nosotros, servicioshogar, historia, misión, argentina",
    }
  },

  contact: {
    pageType: "page",
    identifier: "contact",
    customSEO: {
      title: "Contacto - ServiciosHogar.com.ar | Atención al Cliente",
      description: "¿Necesitas ayuda? Contáctanos. Nuestro equipo de atención al cliente está disponible para ayudarte con cualquier consulta sobre nuestros servicios.",
      keywords: "contacto, atención cliente, ayuda, soporte, servicioshogar",
    }
  }
};