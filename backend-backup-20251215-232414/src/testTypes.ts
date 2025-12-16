// Elimina imports de tipos que no existan
// import { InsertLanguage } from "./shared/schema/languages.js";

// Si necesitas el tipo para Drizzle:
export type InsertLanguage = {
  name: string;
  code: string;
};
// Ajusta este tipo según el modelo real de tu tabla