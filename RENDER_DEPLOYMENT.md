# 🚀 Render Deployment Guide

## Backend Deployment (Already Running: https://resume-builder-backend-0ith.onrender.com)

### ✅ Current Status
- **Backend URL**: https://resume-builder-backend-0ith.onrender.com
- **Status**: Running and configured
- **CORS**: Configured for your frontend

### 🔧 Environment Variables Needed in Render
Add these in your Render Dashboard → Environment Variables:

```bash
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://resume-builder-frontend-6vmo.onrender.com
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/resumeDB
```

### 📋 Render Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Runtime**: Node.js (latest)
- **Branch**: `main` or `master`

## Frontend Deployment

### 🔧 Client Environment Variables
Update `client/.env`:

```bash
VITE_API_URL=https://resume-builder-backend-0ith.onrender.com
```

### 📋 Frontend Render Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview` or use Static Site Hosting
- **Runtime**: Node.js
- **Output Directory**: `dist`

## 🔍 Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://resume-builder-backend-0ith.onrender.com/
```
Should return: "Resume Builder API is running"

### 2. Test Resume Generation
```bash
curl -X POST https://resume-builder-backend-0ith.onrender.com/api/resume/generate \
  -H "Content-Type: application/json" \
  -d '{"personalInfo":{"fullName":"Test User","email":"test@example.com","phone":"123-456-7890"},"summary":"Test","template":"professional"}' \
  --output test.pdf
```

### 3. Test Frontend Connection
- Open your frontend URL
- Fill in the form
- Try generating a resume

## 🐛 Common Issues & Fixes

### Issue 1: CORS Errors
**Fix**: Ensure `FRONTEND_URL` is set correctly in backend environment variables

### Issue 2: Database Connection
**Fix**: Add valid `MONGO_URI` to environment variables

### Issue 3: Build Failures
**Fix**: Check `package.json` has correct start script

### Issue 4: Timeouts
**Fix**: Render may need time to cold start (30-60 seconds)

## 🎯 Quick Deployment Checklist

- [ ] Backend environment variables set in Render
- [ ] Frontend .env updated with Render backend URL
- [ ] MongoDB Atlas database created
- [ ] MONGO_URI added to Render environment
- [ ] Both services deployed and running
- [ ] Test resume generation works end-to-end

## 📞 Support
If you encounter issues:
1. Check Render logs for errors
2. Verify environment variables
3. Test API endpoints directly
4. Ensure CORS is properly configured