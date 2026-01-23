import fs from 'fs';

const indexPath = './src/index.ts';
let content = fs.readFileSync(indexPath, 'utf8');

// Buscar la configuración de CORS y agregar después un middleware adicional
const corsConfig = `app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://servicioshogar.com.ar",
            "https://www.servicioshogar.com.ar",
          ]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);`;

const newCorsConfig = `app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://servicioshogar.com.ar",
            "https://www.servicioshogar.com.ar",
          ]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Fix adicional para CORS preflight
app.options('*', cors());`;

content = content.replace(corsConfig, newCorsConfig);

fs.writeFileSync(indexPath, content);
console.log('✅ CORS fix aplicado');
