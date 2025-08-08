# ServiciosHogar.com.ar - Complete Installation Guide

## 🚀 Quick Start Commands

### For serviciosHogar.com.ar deployment on Hostinger

```bash
# 1. Clone the repository
git clone https://github.com/ProfGuille/ServiciosHogarAr.git
cd ServiciosHogarAr

# 2. Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# 3. Build frontend for production
cd ../frontend
npm run build

# 4. Deploy to Hostinger (automated script)
cd ..
./deploy-hostinger.sh

# 5. Verify deployment
./verify-deployment.sh
```

## 📋 Platform-Specific Installation Instructions

### 1. Hostinger (Frontend Hosting)

#### Prerequisites
- Hostinger hosting account
- Access to hPanel
- Domain serviciosHogar.com.ar configured

#### Installation Steps
```bash
# Build frontend
cd frontend
npm run build

# Manual upload via hPanel:
# 1. Access Hostinger hPanel
# 2. Go to File Manager → public_html/
# 3. Delete existing content
# 4. Upload all files from frontend/dist/
# 5. Upload frontend/.htaccess to root
```

#### Configuration Files
- **DNS**: Point serviciosHogar.com.ar to Hostinger servers
- **SSL**: Enable Let's Encrypt SSL certificate
- **Apache**: `.htaccess` file handles SPA routing and API proxy

### 2. Render (Backend Hosting)

#### Prerequisites
- Render account
- GitHub repository access

#### Deployment Steps
```bash
# Backend is automatically deployed via Render
# Service URL: https://servicioshogar-backend.onrender.com
# Configuration file: backend/render.yaml
```

#### Environment Variables on Render
```env
DATABASE_URL=postgresql://user:password@host/database
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://servicioshogar.com.ar
```

### 3. Neon (Database Hosting)

#### Prerequisites
- Neon account
- PostgreSQL database created

#### Setup Steps
```bash
# Database is already configured
# Connection string in backend environment variables
# Schema managed via Drizzle ORM

# To run migrations:
cd backend
npm run db:migrate

# To seed database:
npm run db:seed
```

## 🔧 Complete Platform Setup

### Local Development Environment

```bash
# 1. Install Node.js (v18+)
# 2. Clone repository
git clone https://github.com/ProfGuille/ServiciosHogarAr.git
cd ServiciosHogarAr

# 3. Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# 4. Set up environment variables
cd backend
cp .env.example .env
# Edit .env with your database credentials

cd ../frontend
cp .env.development.example .env.development
# Edit .env.development with local backend URL

# 5. Start development servers
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Environment

#### Step 1: Database Setup (Neon)
```bash
# 1. Create Neon project
# 2. Copy connection string
# 3. Set DATABASE_URL in backend environment
```

#### Step 2: Backend Deployment (Render)
```bash
# 1. Connect GitHub repository to Render
# 2. Configure environment variables
# 3. Deploy from main branch
# Service will be available at: https://servicioshogar-backend.onrender.com
```

#### Step 3: Frontend Deployment (Hostinger)
```bash
# 1. Build production frontend
cd frontend
npm run build

# 2. Configure production environment
# Edit .env.production with production API URL

# 3. Upload to Hostinger
# Upload contents of dist/ to public_html/
# Upload .htaccess to handle routing
```

## 🧪 Testing and Verification

### Verification Commands
```bash
# Test backend connectivity
curl https://servicioshogar-backend.onrender.com/api/health

# Test frontend build
cd frontend
npm run build
npm run preview

# Test database connection
cd backend
npm run db:check

# Run full test suite
npm run test
```

### Health Check URLs
- Frontend: https://servicioshogar.com.ar
- Backend: https://servicioshogar-backend.onrender.com/api/health
- Database: Accessible via backend connection

## 🛠️ Configuration Files

### Backend Configuration
- `backend/package.json` - Dependencies and scripts
- `backend/render.yaml` - Render deployment config
- `backend/drizzle.config.ts` - Database configuration
- `backend/src/config/database.ts` - Database connection

### Frontend Configuration
- `frontend/package.json` - Dependencies and scripts
- `frontend/vite.config.ts` - Build configuration
- `frontend/.htaccess` - Apache configuration
- `frontend/.env.production` - Production environment

### Database Configuration
- `database/schema/` - Database schemas
- `backend/migrations/` - Database migrations
- `backend/src/lib/db.ts` - Database client

## 🔒 Security Configuration

### Environment Variables
```env
# Backend (.env)
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-jwt-secret
NODE_ENV=production
FRONTEND_URL=https://servicioshogar.com.ar

# Frontend (.env.production)
VITE_API_URL=https://servicioshogar-backend.onrender.com
VITE_APP_ENV=production
```

### SSL and HTTPS
- Hostinger: Let's Encrypt SSL enabled
- Render: Automatic HTTPS
- Database: SSL required for connections

## 📞 Support and Troubleshooting

### Common Issues

#### Frontend not loading
```bash
# Check .htaccess configuration
# Verify SSL certificate
# Check DNS propagation
```

#### API calls failing
```bash
# Verify backend is running on Render
# Check CORS configuration
# Verify environment variables
```

#### Database connection issues
```bash
# Check Neon database status
# Verify connection string
# Run migration: npm run db:migrate
```

### Contact Information
- **Frontend URL**: https://servicioshogar.com.ar
- **Backend URL**: https://servicioshogar-backend.onrender.com
- **Repository**: https://github.com/ProfGuille/ServiciosHogarAr

---

## ✅ Installation Checklist

- [ ] Node.js v18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (root, frontend, backend)
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Frontend built successfully
- [ ] Backend deployed to Render
- [ ] Frontend uploaded to Hostinger
- [ ] SSL certificate active
- [ ] DNS configured correctly
- [ ] Health checks passing
- [ ] User authentication working
- [ ] Payment system tested

**Your ServiciosHogar.com.ar platform is ready for production!**