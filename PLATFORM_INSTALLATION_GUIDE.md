# Platform Installation Guide (Multi-Platform) - ServiciosHogar.com.ar

## 🌐 Cross-Platform Deployment Guide

### Overview
This guide provides comprehensive installation instructions for deploying ServiciosHogar.com.ar across different hosting platforms and environments, including alternatives to the current Hostinger/Render/Neon stack.

## 🎯 Current Production Stack (Recommended)

### Quick Deployment Commands
```bash
# Complete installation for serviciosHogar.com.ar
git clone https://github.com/ProfGuille/ServiciosHogarAr.git
cd ServiciosHogarAr

# Install all dependencies
npm install && cd frontend && npm install && cd ../backend && npm install && cd ..

# Build and deploy
cd frontend && npm run build && cd ..
./deploy-hostinger.sh
./verify-deployment.sh
```

**Current Stack:**
- **Frontend**: Hostinger (Apache hosting)
- **Backend**: Render (Node.js hosting)  
- **Database**: Neon (PostgreSQL)

## 🏗️ Alternative Platform Deployments

### 1. Vercel + PlanetScale + Supabase

#### Prerequisites
- Vercel account
- PlanetScale account
- Supabase account (optional, for auth)

#### Installation Steps
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy Frontend to Vercel
cd frontend
vercel login
vercel --prod

# 3. Set up PlanetScale Database
npm install -g @planetscale/cli
pscale auth login
pscale database create servicioshogar
pscale branch create servicioshogar main

# 4. Update database connection
cd ../backend
# Update DATABASE_URL to PlanetScale connection string

# 5. Deploy Backend to Vercel
cd backend
vercel --prod
```

#### Configuration Files
```json
// vercel.json (Frontend)
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://servicioshogar-backend.vercel.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

```json
// vercel.json (Backend)
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

### 2. Netlify + Railway + Supabase

#### Prerequisites
- Netlify account
- Railway account
- Supabase account

#### Installation Steps
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy Frontend to Netlify
cd frontend
npm run build
netlify deploy --prod --dir=dist

# 3. Deploy Backend to Railway
cd ../backend
# Push to GitHub repository
# Connect repository to Railway
# Railway will auto-deploy

# 4. Set up Supabase Database
# Create project in Supabase dashboard
# Copy connection string
# Update backend environment variables
```

#### Configuration Files
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://servicioshogar-backend.railway.app/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. AWS Full Stack (S3 + Lambda + RDS)

#### Prerequisites
- AWS Account
- AWS CLI configured
- Docker installed

#### Installation Steps
```bash
# 1. Install AWS CDK
npm install -g aws-cdk

# 2. Deploy Frontend to S3 + CloudFront
cd frontend
npm run build
aws s3 sync dist/ s3://servicioshogar-frontend
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

# 3. Deploy Backend to Lambda
cd ../backend
# Package application
npm run build
zip -r function.zip dist/ node_modules/

# Upload to Lambda
aws lambda create-function \
  --function-name servicioshogar-backend \
  --runtime nodejs18.x \
  --zip-file fileb://function.zip \
  --handler dist/lambda.handler

# 4. Set up RDS Database
aws rds create-db-instance \
  --db-instance-identifier servicioshogar-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20
```

#### Lambda Handler
```typescript
// backend/src/lambda.ts
import serverless from 'serverless-http';
import { app } from './index';

export const handler = serverless(app);
```

### 4. Google Cloud Platform (Firebase + Cloud Run + Cloud SQL)

#### Prerequisites
- Google Cloud account
- Firebase CLI
- Google Cloud CLI

#### Installation Steps
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Deploy Frontend to Firebase Hosting
cd frontend
npm run build
firebase login
firebase init hosting
firebase deploy

# 3. Deploy Backend to Cloud Run
cd ../backend
# Create Dockerfile
gcloud run deploy servicioshogar-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# 4. Set up Cloud SQL
gcloud sql instances create servicioshogar-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1
```

#### Dockerfile for Cloud Run
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]
```

### 5. DigitalOcean (App Platform + Managed Database)

#### Prerequisites
- DigitalOcean account
- doctl CLI

#### Installation Steps
```bash
# 1. Install doctl
# Download from DigitalOcean website

# 2. Create App Platform spec
# Create app.yaml configuration

# 3. Deploy via CLI
doctl apps create --spec app.yaml

# 4. Set up Managed Database
doctl databases create servicioshogar-db \
  --engine postgres \
  --region nyc1 \
  --size db-s-1vcpu-1gb
```

#### App Platform Configuration
```yaml
# app.yaml
name: servicioshogar
services:
- name: backend
  source_dir: /backend
  github:
    repo: ProfGuille/ServiciosHogarAr
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  
- name: frontend
  source_dir: /frontend
  github:
    repo: ProfGuille/ServiciosHogarAr
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

## 🐳 Docker Deployment

### Docker Compose Setup

#### Prerequisites
- Docker and Docker Compose installed

#### Installation Steps
```bash
# 1. Clone repository
git clone https://github.com/ProfGuille/ServiciosHogarAr.git
cd ServiciosHogarAr

# 2. Start with Docker Compose
docker-compose up -d

# 3. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:5000

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    depends_on:
      - database
    environment:
      - DATABASE_URL=postgresql://postgres:password@database:5432/servicioshogar
      - NODE_ENV=production

  database:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=servicioshogar
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Dockerfiles
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

## 🖥️ Self-Hosted VPS Deployment

### Ubuntu/Debian VPS Setup

#### Prerequisites
- VPS with Ubuntu 20.04+ or Debian 11+
- Root or sudo access
- Domain name pointed to VPS

#### Installation Steps
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# 4. Install Nginx
sudo apt install nginx

# 5. Install PM2 for process management
sudo npm install -g pm2

# 6. Clone and setup application
git clone https://github.com/ProfGuille/ServiciosHogarAr.git
cd ServiciosHogarAr

# 7. Install dependencies
npm install
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run build

# 8. Set up database
sudo -u postgres createdb servicioshogar
sudo -u postgres psql -c "CREATE USER appuser WITH PASSWORD 'strongpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE servicioshogar TO appuser;"

# 9. Run migrations
cd backend
npm run db:migrate

# 10. Start backend with PM2
pm2 start dist/index.js --name servicioshogar-backend
pm2 save
pm2 startup

# 11. Configure Nginx
sudo cp /path/to/nginx.conf /etc/nginx/sites-available/servicioshogar
sudo ln -s /etc/nginx/sites-available/servicioshogar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 12. Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d servicioshogar.com.ar
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/servicioshogar
server {
    listen 80;
    server_name servicioshogar.com.ar www.servicioshogar.com.ar;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name servicioshogar.com.ar www.servicioshogar.com.ar;

    ssl_certificate /etc/letsencrypt/live/servicioshogar.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/servicioshogar.com.ar/privkey.pem;

    # Serve frontend
    location / {
        root /path/to/ServiciosHogarAr/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Development Environment Setups

### Visual Studio Code Setup

#### Recommended Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

#### Workspace Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### GitHub Codespaces Setup

#### Codespaces Configuration
```json
// .devcontainer/devcontainer.json
{
  "name": "ServiciosHogar Development",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "forwardPorts": [3000, 5000, 5432],
  "postCreateCommand": "npm install && cd frontend && npm install && cd ../backend && npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint"
      ]
    }
  }
}
```

## 📊 Platform Comparison Matrix

| Platform | Frontend | Backend | Database | Cost | Complexity | Scalability |
|----------|----------|---------|----------|------|------------|-------------|
| **Current (Hostinger/Render/Neon)** | Hostinger | Render | Neon | Low | Low | Medium |
| **Vercel/PlanetScale** | Vercel | Vercel | PlanetScale | Medium | Low | High |
| **Netlify/Railway** | Netlify | Railway | Supabase | Medium | Low | Medium |
| **AWS Full Stack** | S3+CloudFront | Lambda/EC2 | RDS | High | High | Very High |
| **Google Cloud** | Firebase | Cloud Run | Cloud SQL | Medium | Medium | High |
| **DigitalOcean** | App Platform | App Platform | Managed DB | Low | Low | Medium |
| **Self-Hosted VPS** | Nginx | PM2 | PostgreSQL | Very Low | High | Medium |
| **Docker** | Container | Container | Container | Very Low | Medium | Medium |

## 🎯 Platform Selection Guide

### Choose Hostinger/Render/Neon (Current) If:
- ✅ Budget-conscious deployment
- ✅ Simple setup and maintenance
- ✅ Good performance for small-medium scale
- ✅ Existing setup working well

### Choose Vercel/PlanetScale If:
- ✅ Want best developer experience
- ✅ Need excellent performance globally
- ✅ Plan to scale significantly
- ✅ Budget allows higher costs

### Choose AWS If:
- ✅ Need enterprise-level scalability
- ✅ Have DevOps expertise
- ✅ Want full control over infrastructure
- ✅ Budget allows complex setup

### Choose Self-Hosted VPS If:
- ✅ Want maximum cost savings
- ✅ Have system administration skills
- ✅ Need complete control
- ✅ Compliance requires self-hosting

## 🔍 Migration Between Platforms

### Data Export/Import
```bash
# Export from current database (Neon)
pg_dump $CURRENT_DATABASE_URL > export.sql

# Import to new database
psql $NEW_DATABASE_URL < export.sql

# Update environment variables
# Update DNS/CDN configurations
# Test thoroughly before switching
```

### Gradual Migration Strategy
1. **Phase 1**: Set up new environment in parallel
2. **Phase 2**: Test with subset of traffic
3. **Phase 3**: Migrate database during maintenance window
4. **Phase 4**: Switch DNS to new environment
5. **Phase 5**: Monitor and optimize

## 📞 Platform Support Resources

### Current Stack Support
- **Hostinger**: 24/7 chat support
- **Render**: Email and community support
- **Neon**: Email support and documentation

### Alternative Platform Support
- **Vercel**: Community and pro support
- **AWS**: Extensive documentation and support plans
- **DigitalOcean**: Community and ticket support
- **Self-hosted**: Community forums and documentation

---

**This multi-platform guide should be updated as new hosting options become available and platform features evolve.**