import { eq } from "drizzle-orm";
import { db } from "./db";
import { serviceProviders } from "./shared/schema/serviceProviders";
import { users } from "./shared/schema/users";

// Limpieza por ID numérico
await db.delete(serviceProviders).where(eq(serviceProviders.userId, 123));
await db.delete(serviceProviders).where(eq(serviceProviders.userId, 8211));

await db.delete(users).where(eq(users.id, 123));
await db.delete(users).where(eq(users.id, 8211));