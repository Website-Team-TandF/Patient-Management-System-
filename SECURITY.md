# Security Best Practices & Configuration

## Overview
This document outlines the security measures implemented in the Ayurvishwa FullStack application and guidelines for maintaining security in production.

---

## 🔒 Critical Security Fixes

### 1. **Removed Hardcoded API URLs** ✅
- **Issue**: Production API URL was hardcoded in `src/services/api.ts`
- **Fix**: Now requires `VITE_API_URL` environment variable in production
- **Status**: Production builds will fail if not properly configured (intentional safeguard)

### 2. **JWT Secret Protection** ✅
- **Issue**: Default JWT_SECRET was easily guessable
- **Fix**: Application now throws an error in production if `JWT_SECRET` is not explicitly set
- **Status**: Development uses safe default, production requires secure value

### 3. **Database Connection Security** ✅
- **Issue**: Missing MongoDB URI validation
- **Fix**: Application throws error in production if `MONGODB_URI` is not set
- **Status**: Prevents accidental use of local dev database in production

### 4. **Environment File Protection** ✅
- **Added**: Enhanced `.gitignore` rules to prevent accidental env file commits
- **Covers**: `.env`, `.env.local`, `.env.*.local`, `.env.production.local`

---

## 📋 Environment Variables Checklist

### Frontend (`VITE_API_URL`)
```bash
# Development
VITE_API_URL=http://localhost:3000/api

# Production (REQUIRED)
VITE_API_URL=https://your-production-api.com/api
```

### Backend (in `.env` file)
```bash
# CRITICAL: All must be set in production
NODE_ENV=production
PORT=3000 (or your port)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=<generate-strong-random-secret>
```

---

## 🚨 Security Warnings

### What NOT to do:
- ❌ Never commit `.env` files to git
- ❌ Never share JWT_SECRET via chat, email, or version control
- ❌ Never use weak/default passwords for database credentials
- ❌ Never hardcode API URLs in production code
- ❌ Never commit actual environment files (only `.env.example` is safe)
- ❌ Never expose database credentials in frontend code

### What TO do:
- ✅ Use strong, randomly generated JWT_SECRET (32+ characters)
- ✅ Rotate JWT_SECRET periodically
- ✅ Use separate credentials for dev/prod environments
- ✅ Keep database credentials secure and unique per environment
- ✅ Use environment-specific deployment configurations
- ✅ Monitor env variable usage in logs (never log secrets)
- ✅ Review `.env.example` files to document required variables

---

## 🔑 How to Generate Secure Secrets

### JWT Secret (Backend)
```bash
# Using OpenSSL
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Database Password (MongoDB)
Use MongoDB Atlas's auto-generated credentials or:
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] **Frontend**
  - [ ] `VITE_API_URL` is set to your production API endpoint
  - [ ] No `.env` files are committed to git
  - [ ] `.env.example` is kept updated with all required variables

- [ ] **Backend**
  - [ ] `NODE_ENV=production` is set
  - [ ] `JWT_SECRET` is a strong random value (not default)
  - [ ] `MONGODB_URI` points to production database
  - [ ] Database credentials are strong and unique
  - [ ] `.env` file is NOT committed to git
  - [ ] Platform-specific env setup done (Render, Heroku, AWS, etc.)

- [ ] **General**
  - [ ] HTTPS is enforced (no HTTP in production)
  - [ ] CORS is properly configured for your domain only
  - [ ] Sensitive logs are disabled or redacted
  - [ ] Database backups are configured
  - [ ] Error messages don't expose system details

---

## 🛡️ How to Deploy with Environment Variables

### Option 1: Render.com
1. Go to Dashboard → Your Service → Settings → Environment
2. Add each variable from `.env.example`
3. Deploy - variables will be injected at runtime

### Option 2: Heroku
```bash
# Using Heroku CLI
heroku config:set JWT_SECRET=<your-secret> --app your-app-name
heroku config:set MONGODB_URI=<your-uri> --app your-app-name
heroku config:set NODE_ENV=production --app your-app-name
```

### Option 3: AWS / EB / EC2
1. Store secrets in AWS Secrets Manager or Systems Manager Parameter Store
2. Application reads from these services at startup
3. Never keep secrets in source code or deployment scripts

### Option 4: Docker
```dockerfile
# Dockerfile
FROM node:18
WORKDIR /app
COPY . .
# Variables passed at runtime via -e or docker-compose
ENV NODE_ENV=production
CMD ["node", "dist/app.js"]
```

---

## 📝 Implementation Details

### Frontend Security
- API URL validation in production
- Auth token stored in localStorage (consider using secure cookies for enhanced security)
- CORS credentials enabled (withCredentials: true)

### Backend Security
- Environment variable validation on startup
- Throws errors instead of using insecure defaults in production
- JWT secret protected from accidental exposure
- Database URI validation

---

## 🔍 Verification

To verify environment variables are properly secured:

```bash
# Frontend - Check that VITE_API_URL is used
grep -r "VITE_API_URL" src/

# Backend - Check that env variables are validated
grep -r "JWT_SECRET\|MONGODB_URI" backend/src/config/

# Verify .gitignore covers all env files
cat .gitignore | grep -E "\.env"

# Ensure no .env files are committed
git status --porcelain | grep "\.env"
```

---

## 📚 Additional Resources

- [OWASP Environment Variables Security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [12 Factor App - Configuration](https://12factor.net/config)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)

---

## 📞 Support

If you encounter issues with environment variables:
1. Check `.env.example` for required variables
2. Verify all variables are set in your deployment platform
3. Check application logs for validation errors
4. Never log or share actual secret values when debugging

