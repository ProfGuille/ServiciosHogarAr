# Script cleanup.ts - Limpieza de datos de prueba

## Objetivo  
Eliminar datos de prueba específicos en las tablas `serviceProviders` y `users` para mantener limpia la base de datos durante el desarrollo.

## Ubicación del archivo  
`backend/src/cleanup.ts`

## Uso  

Ejecutar siempre desde la raíz del proyecto:

```bash
npx tsx backend/src/cleanup.ts
```

> **Importante:** Ejecutar con la ruta `backend/src/cleanup.ts` desde la raíz para evitar errores de módulo no encontrado.

## Configuración  

Editar en el archivo `cleanup.ts` el arreglo `userIdsToDelete` con los IDs de usuarios/proveedores que quieras borrar.  
Ejemplo:

```ts
const userIdsToDelete: string[] = [
  '8211c5f8-e115-473d-9080-cbaa4019a0ba',
  '123',
];
```

## Precauciones

- Usar solo en ambientes de desarrollo o pruebas.
- Eliminar datos irreversiblemente.

Recomendaciones
Asegurate de no ejecutar este script en entornos de producción, ya que elimina datos directamente de la base.

Usá este script únicamente para entornos de desarrollo y controlados.

Siempre verificá los IDs que estás por eliminar para evitar pérdida de información importante

Mensajes esperados
Al ejecutar el script correctamente desde la raíz del proyecto con:

bash
Copiar
Editar
npx tsx backend/src/cleanup.ts
Deberías ver un mensaje similar a:

csharp
Copiar
Editar
[dotenv@17.2.0] injecting env (2) from backend/.env (tip: ⚙️  override existing env vars with { override: true })
Datos de prueba eliminados.
Este mensaje indica que los datos fueron eliminados correctamente usando la configuración .env del backend.
