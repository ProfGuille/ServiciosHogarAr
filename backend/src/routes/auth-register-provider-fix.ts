// REEMPLAZAR en auth.ts el endpoint register-provider por esto:

router.post("/register-provider", async (req: Request, res: Response) => {
  try {
    const { name, email, password, businessName, city, phone, serviceCategories } = req.body;
    
    // Generar ID único para user
    const userId = nanoid();
    
    // 1. Crear user básico (sin password - users no tiene esa columna)
    const [user] = await db.insert(users).values({
      id: userId,
      email,
      first_name: name.split(' ')[0] || name,
      last_name: name.split(' ').slice(1).join(' ') || '',
      user_type: 'provider'
    }).returning();
    
    // 2. Crear service_provider (aquí va la info del negocio)
    await db.insert(service_providers).values({
      user_id: user.id,
      business_name: businessName,
      city,
      phone_number: phone,
      is_verified: false,
      is_active: true
    });
    
    // 3. Dar créditos iniciales
    await db.insert(provider_credits).values({
      user_id: user.id,
      balance: 10  // Créditos de bienvenida
    });
    
    // TODO: Guardar password en tabla separada o usar auth externa
    
    res.status(201).json({ 
      message: 'Proveedor registrado exitosamente',
      user: { id: user.id, email: user.email }
    });
    
  } catch (error: any) {
    console.error('Error register-provider:', error);
    res.status(500).json({ error: error.message });
  }
});
