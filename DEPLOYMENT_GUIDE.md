# 🔥 PRODUCTION DEPLOYMENT GUIDE

## 🚀 Quick Deploy to Render

### Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- MongoDB Atlas account (for database)

---

## 📋 Step 1: Setup MongoDB Atlas

1. **Create MongoDB Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Database**
   - Click "Build a Database" → "M0 Sandbox" (Free)
   - Choose cloud provider and region nearest to you
   - Create database user with username and password
   - Add your IP address to access list (0.0.0.0/0 for Render)

3. **Get Connection String**
   - Click "Connect" → "Drivers"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/resumeDB`

---

## 📋 Step 2: Deploy Backend on Render

1. **Go to Render Dashboard**
   - Login to [Render](https://render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub repository
   - Select `resume_builder` repository
   - Select `main` branch

3. **Configure Backend Service**
   ```
   Name: resume-builder-backend
   Environment: Node
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables**
   ```
   NODE_ENV = production
   PORT = 5000
   MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/resumeDB
   FRONTEND_URL = https://resume-builder-frontend.onrender.com
   ```

5. **Create Service** and wait for deployment (2-3 minutes)

---

## 📋 Step 3: Deploy Frontend on Render

1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Same repository and branch

2. **Configure Frontend Service**
   ```
   Name: resume-builder-frontend
   Environment: Static Site
   Root Directory: client
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Add Environment Variable**
   ```
   VITE_API_URL = https://resume-builder-backend.onrender.com
   ```

4. **Create Service** and wait for deployment

---

## 📋 Step 4: Update CORS Configuration

After deployment, update your backend CORS:

1. Go to Backend Service → Environment
2. Add `FRONTEND_URL` with your actual frontend URL:
   ```
   FRONTEND_URL = https://resume-builder-frontend.onrender.com
   ```

---

## ✅ Testing Your Deployment

### Test Backend
```bash
curl https://resume-builder-backend.onrender.com/
# Should return: "Resume Builder API is running"
```

### Test Frontend
- Open `https://resume-builder-frontend.onrender.com`
- Try creating a resume
- Verify PDF download works

---

## 🔄 Alternative: Using render.yaml

For automated deployment, use the `render.yaml` file I created:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add render configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to Render → "New +" → "Blueprint"
   - Connect your repository
   - Render will auto-detect `render.yaml`
   - Review and deploy both services

---

## 🐛 Common Issues & Solutions

### ❌ "Database connection failed"
**Fix**: Check MONGO_URI format and IP whitelist in MongoDB Atlas

### ❌ "CORS errors"
**Fix**: Ensure FRONTEND_URL matches your frontend URL exactly

### ❌ "Build failed"
**Fix**: Check package.json has correct build scripts

### ❌ "Timeout errors"
**Fix**: Free tier has 30-second startup limit, may need to optimize

---

## 📊 Cost Breakdown (Free Tier)

- **Backend**: $0/month (Free tier)
- **Frontend**: $0/month (Static site)
- **Database**: $0/month (MongoDB Atlas M0)
- **Domain**: $0/month (Render subdomain)

**Total Cost: $0/month**

---

## 🎯 Post-Deployment Checklist

- [ ] MongoDB Atlas database created
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and loads
- [ ] Resume generation works
- [ ] File downloads work correctly
- [ ] No CORS errors in browser console
- [ ] Test with different resume templates

---

## 🚀 Going Live

Your app will be available at:
- Frontend: `https://resume-builder-frontend.onrender.com`
- Backend: `https://resume-builder-backend.onrender.com`

**🎉 Congratulations! Your Resume Builder is now live!**