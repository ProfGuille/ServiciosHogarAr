# Cloudflare DNS Configuration for servicioshogar.com.ar

## DNS Records
```
A    @              [Vercel IP Address from Vercel dashboard]
A    www            [Vercel IP Address from Vercel dashboard]
CNAME api          servicioshogar-backend-uje1.onrender.com
```

## Cloudflare Page Rules
1. **Always Use HTTPS**: `servicioshogar.com.ar/*` → Always Use HTTPS
2. **Cache Everything**: `servicioshogar.com.ar/assets/*` → Cache Level: Cache Everything
3. **API Proxying**: `servicioshogar.com.ar/api/*` → Disable Cache, Flexible SSL

## Security Settings
- SSL/TLS Encryption Mode: **Full (Strict)**
- Always Use HTTPS: **On**
- Authenticated Origin Pulls: **On**
- TLS 1.3: **On**
- Automatic HTTPS Rewrites: **On**
- Opportunistic Encryption: **On**

## Performance Settings
- Auto Minify: **CSS, JavaScript, HTML** all enabled
- Brotli Compression: **On**
- Early Hints: **On**
- HTTP/3 (with QUIC): **On**

## Page Rules Priority Order
1. `servicioshogar.com.ar/api/*` - Disable Cache, Flexible SSL
2. `servicioshogar.com.ar/assets/*` - Cache Everything, Edge Cache TTL: 1 month
3. `servicioshogar.com.ar/*` - Always Use HTTPS

## Firewall Rules
- Block common attack patterns
- Rate limiting: 100 requests per minute per IP
- Bot Fight Mode: **On**
- Security Level: **Medium**

## Analytics
- Web Analytics: **Enabled**
- Core Web Vitals: **Enabled**