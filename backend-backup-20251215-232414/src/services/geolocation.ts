// Solución: instala axios o usa fetch. Aquí con fetch (nativo Node 18+ / puedes instalar node-fetch si usas Node <18)
export async function getLocation(ip: string) {
  const response = await fetch(`https://ip-api.com/json/${ip}`);
  return response.json();
}