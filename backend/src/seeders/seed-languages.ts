import { languages, InsertLanguage } from "@shared/schema/languages";
import { db } from "../db";

export async function seedLanguages() {
  const data: InsertLanguage[] = [
    // Ejemplo: { name: "Español", code: "es" }
  ];
  await db.insert(languages).values(data);
}