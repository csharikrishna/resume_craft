# 🚀 Deployment Guide

Your code is ready for production! Follow these steps to deploy your ResumeCraft application.

---

## 📋 Pre-Deployment Checklist

✅ Code pushed to GitHub: https://github.com/csharikrishna/resume_craft.git  
✅ Firebase config secured with environment variables  
✅ `.env` files are in `.gitignore`  

---

## 🎯 Deployment Overview

- **Backend**: Render (Free tier)
- **Frontend**: Vercel (Free tier)
- **Database**: Firebase Firestore (Already configured)
- **Auth**: Firebase Authentication (Already configured)

---

## 1️⃣ Deploy Backend to Render

### Step 1: Sign Up & Create Web Service

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: `csharikrishna/resume_craft`
5. Configure the service:
   - **Name**: `resumecraft-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 2: Set Environment Variables

In the Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=5000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=resumecraft-1f232
FIREBASE_CLIENT_EMAIL=your_service_account_email@resumecraft-1f232.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_WEB_API_KEY=AIzaSyCidYaI9wAx-yBYtEYGg71hghv2wC8dYvE
FIREBASE_DATABASE_URL=https://resumecraft-1f232-default-rtdb.firebaseio.com

# Hugging Face API
HF_TOKEN=your_hugging_face_token
HF_MODEL=meta-llama/Llama-3.3-70B-Instruct

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# CORS (will be updated after frontend deployment)
CORS_ORIGIN=*
```

### Step 3: Get Your Backend URL

After deployment completes, you'll get a URL like:
```
https://resumecraft-backend.onrender.com
```

**Important**: Copy this URL - you'll need it for frontend deployment!

### Step 4: Test Your Backend

Visit: `https://your-backend-url.onrender.com/health`

You should see:
```json
{"status":"OK","timestamp":"..."}
```

---

## 2️⃣ Deploy Frontend to Vercel

### Step 1: Sign Up & Import Project

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `csharikrishna/resume_craft`
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Set Environment Variables

In Vercel's project settings → Environment Variables, add:

```env
# Backend API URL (use your Render backend URL)
VITE_API_URL=https://resumecraft-backend.onrender.com

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_xxx

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCidYaI9wAx-yBYtEYGg71hghv2wC8dYvE
VITE_FIREBASE_AUTH_DOMAIN=resumecraft-1f232.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://resumecraft-1f232-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=resumecraft-1f232
VITE_FIREBASE_STORAGE_BUCKET=resumecraft-1f232.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=708066868241
VITE_FIREBASE_APP_ID=1:708066868241:web:97b76d2acfcf3e352f05b0
VITE_FIREBASE_MEASUREMENT_ID=G-PT0BVGFYSS
```

### Step 3: Deploy

Click **"Deploy"** and wait for the build to complete.

Your frontend will be live at:
```
https://your-project.vercel.app
```

---

## 3️⃣ Update CORS Settings

### After Frontend Deploys

1. Go back to your Render dashboard (backend)
2. Update the `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://your-project.vercel.app
   ```
3. This ensures your backend only accepts requests from your frontend

---

## 4️⃣ Firebase Configuration

### Set Up Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `resumecraft-1f232`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `your-project.vercel.app` (your Vercel domain)
   - `resumecraft-backend.onrender.com` (your Render domain)

---

## 🔐 Security Notes

### Backend Secrets to Obtain:

1. **Firebase Private Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy the private key from the JSON file
   - Format: Keep it exactly as `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

2. **Hugging Face Token**:
   - Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Create a new token with "Read" permissions
   - Copy the token (starts with `hf_...`)

3. **Razorpay Keys** (if using payments):
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
   - Get your Key ID and Secret from API Keys section

---

## 🧪 Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://your-backend.onrender.com/health
```

### 2. Test Frontend
Visit `https://your-project.vercel.app` and:
- ✅ Sign up / Login
- ✅ Create a resume
- ✅ Use AI assistant
- ✅ Export to PDF
- ✅ Test payment flow (if configured)

---

## 🎉 You're Live!

Your ResumeCraft application is now deployed and accessible worldwide!

**Frontend**: https://your-project.vercel.app  
**Backend**: https://your-backend.onrender.com

---

## 📝 Important Notes

### Free Tier Limitations

**Render Free Tier**:
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month (enough for 1 service)

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments
- No spin-down delays

**Firebase Free Tier**:
- 50K reads/day
- 20K writes/day
- 1GB storage

### Future Upgrades

If you exceed free tier limits:
- **Render**: $7/month for Premium
- **Vercel**: $20/month for Pro
- **Firebase**: Pay-as-you-go (Blaze plan)

---

## 🔧 Troubleshooting

### Backend won't start on Render
- Check environment variables are set correctly
- Verify Firebase credentials format (especially private key)
- Check Render logs for errors

### Frontend can't connect to backend
- Verify `VITE_API_URL` points to correct Render URL
- Check CORS settings on backend
- Ensure backend is running (visit /health endpoint)

### Firebase auth not working
- Verify authorized domains in Firebase Console
- Check Firebase config environment variables
- Ensure API key is correct

---

## 📞 Need Help?

Check the logs:
- **Render**: Dashboard → Your Service → Logs
- **Vercel**: Dashboard → Your Project → Deployments → Click deployment → View Logs

---

Good luck with your deployment! 🚀
