import { db } from "./db";
import { languages, translations } from "./shared/schema";

export async function seedLanguages() {
  console.log("🌍 Seeding languages and translations...");

  try {
    // Insert default languages
    const defaultLanguages = [
      {
        code: 'es',
        name: 'Español',
        nativeName: 'Español',
        flag: '🇦🇷',
        isActive: true,
        isDefault: true,
        sortOrder: 1
      },
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        isActive: true,
        isDefault: false,
        sortOrder: 2
      }
    ];

    for (const lang of defaultLanguages) {
      await db.insert(languages)
        .values(lang)
        .onConflictDoNothing();
    }

    console.log("✅ Languages seeded successfully");

    // Add some basic translations
    const basicTranslations = [
      // Spanish translations
      { key: 'nav.home', languageCode: 'es', value: 'Inicio' },
      { key: 'nav.services', languageCode: 'es', value: 'Servicios' },
      { key: 'nav.about', languageCode: 'es', value: 'Nosotros' },
      { key: 'nav.contact', languageCode: 'es', value: 'Contacto' },
      { key: 'nav.login', languageCode: 'es', value: 'Iniciar Sesión' },
      { key: 'nav.register', languageCode: 'es', value: 'Registrarse' },
      { key: 'nav.profile', languageCode: 'es', value: 'Perfil' },
      { key: 'nav.dashboard', languageCode: 'es', value: 'Panel' },
      { key: 'nav.logout', languageCode: 'es', value: 'Cerrar Sesión' },
      { key: 'nav.admin', languageCode: 'es', value: 'Administración' },
      { key: 'nav.analytics', languageCode: 'es', value: 'Analytics' },
      { key: 'nav.requests', languageCode: 'es', value: 'Mis Solicitudes' },

      // English translations
      { key: 'nav.home', languageCode: 'en', value: 'Home' },
      { key: 'nav.services', languageCode: 'en', value: 'Services' },
      { key: 'nav.about', languageCode: 'en', value: 'About' },
      { key: 'nav.contact', languageCode: 'en', value: 'Contact' },
      { key: 'nav.login', languageCode: 'en', value: 'Sign In' },
      { key: 'nav.register', languageCode: 'en', value: 'Sign Up' },
      { key: 'nav.profile', languageCode: 'en', value: 'Profile' },
      { key: 'nav.dashboard', languageCode: 'en', value: 'Dashboard' },
      { key: 'nav.logout', languageCode: 'en', value: 'Sign Out' },
      { key: 'nav.admin', languageCode: 'en', value: 'Admin' },
      { key: 'nav.analytics', languageCode: 'en', value: 'Analytics' },
      { key: 'nav.requests', languageCode: 'en', value: 'My Requests' },

      // Landing page - Spanish
      { key: 'landing.hero.title', languageCode: 'es', value: 'Encuentra Profesionales de Confianza para tu Hogar' },
      { key: 'landing.hero.subtitle', languageCode: 'es', value: 'Conectamos a personas con los mejores profesionales del hogar en Argentina. Rápido, seguro y confiable.' },
      { key: 'landing.hero.cta', languageCode: 'es', value: 'Buscar Servicios' },
      { key: 'landing.hero.ctaSecondary', languageCode: 'es', value: 'Únete como Profesional' },

      // Landing page - English
      { key: 'landing.hero.title', languageCode: 'en', value: 'Find Trusted Home Service Professionals' },
      { key: 'landing.hero.subtitle', languageCode: 'en', value: 'We connect people with the best home service professionals in Argentina. Fast, secure and reliable.' },
      { key: 'landing.hero.cta', languageCode: 'en', value: 'Find Services' },
      { key: 'landing.hero.ctaSecondary', languageCode: 'en', value: 'Join as Professional' },

      // Common terms - Spanish
      { key: 'common.loading', languageCode: 'es', value: 'Cargando...' },
      { key: 'common.error', languageCode: 'es', value: 'Error' },
      { key: 'common.success', languageCode: 'es', value: 'Éxito' },
      { key: 'common.save', languageCode: 'es', value: 'Guardar' },
      { key: 'common.cancel', languageCode: 'es', value: 'Cancelar' },
      { key: 'common.search', languageCode: 'es', value: 'Buscar' },

      // Common terms - English
      { key: 'common.loading', languageCode: 'en', value: 'Loading...' },
      { key: 'common.error', languageCode: 'en', value: 'Error' },
      { key: 'common.success', languageCode: 'en', value: 'Success' },
      { key: 'common.save', languageCode: 'en', value: 'Save' },
      { key: 'common.cancel', languageCode: 'en', value: 'Cancel' },
      { key: 'common.search', languageCode: 'en', value: 'Search' },
    ];

    for (const translation of basicTranslations) {
      await db.insert(translations)
        .values(translation)
        .onConflictDoNothing();
    }

    console.log("✅ Basic translations seeded successfully");
    
  } catch (error) {
    console.error("❌ Error seeding languages:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.main) {
  seedLanguages()
    .then(() => {
      console.log("🌍 Language seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Language seeding failed:", error);
      process.exit(1);
    });
}