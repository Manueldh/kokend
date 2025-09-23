# 🚀 Quick Deployment Checklist

## Before You Start ✅

- [ ] MongoDB Atlas account created with free cluster
- [ ] OpenAI API account with API key
- [ ] GitHub repository with your code

## Backend Deployment (Render) 🔧

1. **Go to [render.com](https://render.com)**
   - [ ] Sign up with GitHub account
   
2. **Create Web Service**
   - [ ] Click "New +" → "Web Service"
   - [ ] Connect GitHub repo: `kokend`
   - [ ] Settings:
     - Name: `kokend-backend`
     - Branch: `main`
     - Root Directory: `backend`
     - Runtime: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Instance Type: **Free**

3. **Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kokend
   OPENAI_API_KEY=sk-your-api-key-here
   PORT=10000
   ```

4. **Deploy**
   - [ ] Click "Create Web Service"
   - [ ] Wait for deployment (5-10 minutes)
   - [ ] Copy the service URL (e.g., `https://kokend-backend.onrender.com`)

## Frontend Deployment (Vercel) 🌐

1. **Go to [vercel.com](https://vercel.com)**
   - [ ] Sign up with GitHub account

2. **Import Project**
   - [ ] Click "New Project"
   - [ ] Import GitHub repo: `kokend`
   - [ ] Settings:
     - Framework Preset: `Next.js`
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```
   (Replace with your actual Render backend URL from step above)

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for deployment (3-5 minutes)
   - [ ] Visit your live site!

## Test Your Deployment 🧪

- [ ] Visit your Vercel URL
- [ ] Try logging in with a username
- [ ] Generate a recipe
- [ ] Check if recipes save properly
- [ ] Test kitchen equipment management

## If Something Goes Wrong 🔧

### Backend Issues:
- Check Render logs: Dashboard → Your Service → Logs
- Common issues:
  - MongoDB connection string format
  - Environment variables not set
  - Port configuration

### Frontend Issues:
- Check Vercel function logs
- Common issues:
  - API URL not pointing to backend
  - CORS errors
  - Build errors

## Free Tier Limits 📊

**Render Free:**
- 750 hours/month
- Sleeps after 15 min inactivity
- 0.1 CPU, 512MB RAM

**Vercel Free:**
- 100GB bandwidth/month
- 1000 deployments/month
- Unlimited static hosting

**MongoDB Atlas Free:**
- 512MB storage
- Shared cluster
- Perfect for small apps

---

## 🎉 You're Live!

Your cooking app is now deployed and accessible worldwide! Share the Vercel URL with friends and family.

### Optional Next Steps:
- [ ] Custom domain setup
- [ ] Set up monitoring
- [ ] Configure auto-deployments
- [ ] Add analytics