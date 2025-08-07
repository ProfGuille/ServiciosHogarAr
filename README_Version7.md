# Proyecto: Plataforma de Vinculación de Clientes y Proveedores

## IDs y relaciones

- Actualmente, todos los identificadores (`id`, `userId`, etc.) son **numéricos** (`serial`/`integer` en PostgreSQL).
- Esto simplifica la gestión de relaciones y queries.
- La migración a UUID/string está prevista si el proyecto escala a millones de usuarios, pero no es necesaria ahora.

## Migración a UUID

- Si el crecimiento lo requiere, se puede migrar el tipo de los campos de `integer` a `uuid` o `varchar`.
- Los servicios y rutas deben actualizarse para aceptar strings en vez de números en ese caso.

## Buenas prácticas

- Mantener consistencia de tipos en todas las claves primarias y foráneas.
- Documentar los cambios de tipo en migraciones importantes.
