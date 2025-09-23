# Kokend Deployment Guide

## Option 1: Vercel (Frontend) + Render (Backend) - Recommended ✨

### 🚀 Deploy Backend to Render (Free)

1. Go to [render.com](https://render.com) and create a free account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `kokend-backend`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   OPENAI_API_KEY=your_openai_api_key
   PORT=10000
   ```

6. Click "Create Web Service"

### 🌐 Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and create a free account
2. Click "Import Project"
3. Connect your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
   ```

6. Click "Deploy"

---

## Option 2: Railway (Full Stack) - Alternative

### 🚂 Deploy to Railway (Free tier available)

1. Go to [railway.app](https://railway.app) and create account
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will detect both backend and frontend and deploy them

Add Environment Variables in Railway dashboard:
```
MONGODB_URI=your_mongodb_atlas_connection_string
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_API_URL=https://your-backend-railway-url.railway.app
```

---

## Option 3: Netlify (Frontend) + Render (Backend)

### 🔶 Deploy Frontend to Netlify

1. Go to [netlify.com](https://netlify.com) and create account
2. Drag and drop your `frontend` build folder or connect GitHub
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
4. Add environment variables

---

## Prerequisites ✅

### MongoDB Atlas (Free)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster (M0 Sandbox)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string

### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add billing method (required even for free tier)

---

## Domain Setup (Optional)

### Free Domains
- Vercel: `your-app.vercel.app`
- Render: `your-app.onrender.com`
- Netlify: `your-app.netlify.app`

### Custom Domain
- Buy domain from Namecheap, GoDaddy, etc.
- Configure DNS in deployment platform

---

## Environment Variables Summary

### Backend (.env)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kokend
OPENAI_API_KEY=sk-...
PORT=10000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

---

## Tips for Free Hosting 💡

1. **Render Free Tier**: 750 hours/month, goes to sleep after 15min inactivity
2. **Vercel Free Tier**: 100GB bandwidth/month, unlimited deployments
3. **MongoDB Atlas Free**: 512MB storage, perfect for small apps
4. **Railway Free**: $5 credit/month, good for small apps

## Monitoring & Updates

- Set up GitHub Actions for auto-deployment
- Monitor usage in platform dashboards
- Keep dependencies updated for security

---

Ready to deploy! 🚀