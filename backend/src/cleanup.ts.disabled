import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { serviceProviders } from "./shared/schema/serviceProviders.js";
import { users } from "./shared/schema/users.js";

// Limpieza por ID numérico
await db.delete(serviceProviders).where(eq(serviceProviders.userId, 123));
await db.delete(serviceProviders).where(eq(serviceProviders.userId, 8211));

await db.delete(users).where(eq(users.id, 123));
await db.delete(users).where(eq(users.id, 8211));