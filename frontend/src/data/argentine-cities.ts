// Todas las ciudades argentinas
const allArgentineCities = [
  "Buenos Aires", "La Plata", "Mar del Plata", "Córdoba", "Rosario", 
  "Mendoza", "San Miguel de Tucumán", "Salta", "Santa Fe", "San Juan",
  "Resistencia", "Neuquén", "Santiago del Estero", "Corrientes", "Posadas"
];

export const argentineCities = [...new Set(allArgentineCities)].sort();

export const popularCities = [
  "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "San Miguel de Tucumán",
  "La Plata", "Mar del Plata", "Salta", "Santa Fe", "San Juan"
];
