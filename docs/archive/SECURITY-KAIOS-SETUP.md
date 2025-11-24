# Secure KaiOS Development Setup

## Security Concern: Serving from Root Directory ⚠️

**Problem:** Serving directly from the project root exposes sensitive files:
- ❌ `.git/` directory (source code history)
- ❌ `node_modules/` (dependencies)
- ❌ `.env` files (environment variables)
- ❌ Source code in `src/`
- ❌ Build scripts and configuration
- ❌ Package files with dependency versions

## Solution: Public Directory Structure ✅

We now use a dedicated `public/` directory that contains ONLY the files needed to run the app.

### Directory Structure

```
BlueKai-1/
├── public/                    ← ONLY this is served
│   ├── manifest.webapp        ← App manifest
│   ├── index.html             ← Entry point
│   ├── favicon.ico            ← Favicon
│   ├── icons/                 ← App icons
│   │   ├── icon-56.png
│   │   └── icon-112.png
│   └── dist/                  ← Built bundle
│       └── bundle.js
│
├── src/                       ← NOT served (source code)
├── node_modules/              ← NOT served (dependencies)
├── .git/                      ← NOT served (version control)
├── .env                       ← NOT served (secrets)
└── ...                        ← NOT served (everything else)
```

## Secure Workflow

### 1. Build for KaiOS
```bash
./build-kaios.sh
```

This script:
- ✅ Cleans the `public/` directory
- ✅ Builds the app (`npm run build`)
- ✅ Copies ONLY necessary files to `public/`
- ✅ Leaves sensitive files in root

### 2. Serve Securely
```bash
./serve-kaios.sh
```

This script:
- ✅ Runs `build-kaios.sh` first
- ✅ Changes to `public/` directory
- ✅ Serves ONLY from `public/`
- ✅ Never exposes root directory

### 3. Test in Emulator
```
http://localhost:8080/manifest.webapp
```

## What Gets Served

### ✅ Safe to Serve (in public/)
- `manifest.webapp` - App configuration
- `index.html` - Entry point
- `favicon.ico` - Browser icon
- `icons/*.png` - App icons
- `dist/bundle.js` - Compiled, minified code

### ❌ Never Served (stays in root)
- `src/` - Source code
- `node_modules/` - Dependencies
- `.git/` - Version control
- `.env` - Environment variables
- `package.json` - Dependency list
- `webpack.config.js` - Build configuration
- `*.sh` - Build scripts
- `*.md` - Documentation
- Test files
- Configuration files

## Security Benefits

### 1. No Source Code Exposure
- Source code stays in `src/`
- Only compiled bundle is served
- No access to original implementation

### 2. No Dependency Exposure
- `node_modules/` not accessible
- Can't see what packages you use
- Can't exploit known vulnerabilities

### 3. No Configuration Exposure
- Build configs not accessible
- Environment variables protected
- API keys stay secret

### 4. No Version Control Exposure
- `.git/` directory not accessible
- Can't see commit history
- Can't see contributor information

## Production Deployment

For production, you would:

### 1. Build the App
```bash
npm run build
./build-kaios.sh
```

### 2. Deploy Only public/
```bash
# Upload only the public/ directory to your server
rsync -av public/ user@server:/var/www/bluekai/

# Or create a package
cd public && zip -r ../bluekai-app.zip .
```

### 3. Server Configuration

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name bluekai.example.com;
    
    # Serve only from public directory
    root /var/www/bluekai;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
    
    # Serve manifest with correct MIME type
    location = /manifest.webapp {
        add_header Content-Type application/x-web-app-manifest+json;
    }
}
```

**Apache Example:**
```apache
<VirtualHost *:80>
    ServerName bluekai.example.com
    
    # Serve only from public directory
    DocumentRoot /var/www/bluekai
    
    <Directory /var/www/bluekai>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>
    
    # Deny access to hidden files
    <FilesMatch "^\.">
        Require all denied
    </FilesMatch>
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

## Development vs Production

### Development (Local Testing)
```bash
# Serve from public/ directory
./serve-kaios.sh

# Access at:
http://localhost:8080
```

- ✅ Only public/ is served
- ✅ Safe for local testing
- ✅ No sensitive files exposed

### Production (Deployed)
```bash
# Build and package
./build-kaios.sh
cd public && zip -r ../bluekai.zip .

# Deploy only the zip contents
```

- ✅ Only compiled code deployed
- ✅ No source code on server
- ✅ No build tools on server

## Verification

### Check What's Being Served
```bash
# List public directory
ls -la public/

# Should only see:
# - manifest.webapp
# - index.html
# - favicon.ico
# - icons/
# - dist/
```

### Test Access
```bash
# Start server
./serve-kaios.sh

# In another terminal, test access
curl http://localhost:8080/manifest.webapp  # ✅ Should work
curl http://localhost:8080/package.json     # ❌ Should fail (404)
curl http://localhost:8080/src/             # ❌ Should fail (404)
curl http://localhost:8080/.env             # ❌ Should fail (404)
```

## Security Checklist

- [x] Source code not in public/
- [x] node_modules/ not in public/
- [x] .git/ not in public/
- [x] .env files not in public/
- [x] Configuration files not in public/
- [x] Build scripts not in public/
- [x] Test files not in public/
- [x] Documentation not in public/
- [x] Only compiled bundle in public/
- [x] Server serves only from public/
- [x] .gitignore includes public/

## Additional Security Measures

### 1. Environment Variables
Never commit sensitive data:
```bash
# .env (never commit this!)
BLUESKY_API_KEY=secret123
DATABASE_URL=postgres://...
```

### 2. API Keys
Store API keys securely:
- Use environment variables
- Use secret management services
- Never hardcode in source

### 3. HTTPS in Production
Always use HTTPS:
```bash
# Let's Encrypt example
certbot --nginx -d bluekai.example.com
```

### 4. Content Security Policy
Add CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
```

## Summary

**Old Way (Insecure):**
```bash
# Served from root - exposes everything!
python3 -m http.server 8080
```

**New Way (Secure):**
```bash
# Build to public/ directory
./build-kaios.sh

# Serve only from public/
./serve-kaios.sh
```

The new approach ensures that only the necessary files are exposed, keeping your source code, dependencies, and configuration secure.

## Questions?

- **Q: Why not just use .htaccess to block files?**
  A: Better to not serve them at all. Defense in depth.

- **Q: Is this necessary for local development?**
  A: Yes! Good security practices should be used everywhere.

- **Q: What about the webpack dev server?**
  A: Use it for development with hot reload, but use `serve-kaios.sh` for KaiOS testing.

- **Q: Can I deploy the whole project?**
  A: No! Only deploy the `public/` directory contents.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/Security)
- [KaiOS Security Guidelines](https://developer.kaiostech.com/docs/security)

Stay secure! 🔒
