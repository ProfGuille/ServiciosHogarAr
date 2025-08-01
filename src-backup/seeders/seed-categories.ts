import { db } from "./db";
import { serviceCategories } from "./shared/schema";

const newCategories = [
  { name: "Gasista", description: "Instalación y reparación de gas, calefones, termotanques, estufas", icon: "flame" },
  { name: "Albañil", description: "Construcción, reparación de paredes, pisos, revoques, cerámicos", icon: "hard-hat" },
  { name: "Técnico de Aire", description: "Instalación y mantenimiento de aire acondicionado", icon: "wind" },
  { name: "Techista", description: "Reparación e impermeabilización de techos, colocación de tejas", icon: "home" },
  { name: "Herrero", description: "Rejas, portones, estructuras metálicas, carpintería de aluminio", icon: "wrench" },
  { name: "Jardinería", description: "Diseño y mantenimiento de jardines, podas, paisajismo", icon: "trees" },
  { name: "Mudanzas", description: "Mudanzas y fletes locales e interprovinciales", icon: "truck" },
  { name: "Técnico PC", description: "Reparación de computadoras, instalación de redes", icon: "laptop" },
  { name: "Fumigador", description: "Control de plagas, desinfección, desratización", icon: "bug" },
  { name: "Pequeños Arreglos", description: "Arreglos generales del hogar, armado de muebles", icon: "hammer" },
  { name: "Tapicero", description: "Tapizado y retapizado de muebles, cortinas", icon: "sofa" },
  { name: "Cerrajero", description: "Apertura de cerraduras, duplicado de llaves, instalación de cerraduras", icon: "key" },
  { name: "Vidriero", description: "Instalación y reparación de vidrios, espejos, mamparas", icon: "square" },
  { name: "Instalador Solar", description: "Paneles solares, termotanques solares, energía renovable", icon: "sun" },
];

async function seedCategories() {
  console.log("Starting category seeding...");
  
  try {
    for (const category of newCategories) {
      await db.insert(serviceCategories).values(category).onConflictDoNothing();
      console.log(`Added category: ${category.name}`);
    }
    
    console.log("Category seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();