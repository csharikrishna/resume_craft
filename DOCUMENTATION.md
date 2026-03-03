# ResumeCraft — Complete Documentation

This document contains detailed setup, architecture, and troubleshooting information for ResumeCraft.

---

## 🔐 API Key Setup

### 1. Firebase Setup

Set up Firebase Auth + Firestore and add these values to `backend/.env`:
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_WEB_API_KEY=your_firebase_web_api_key
FIREBASE_DATABASE_URL=https://<project-id>.firebaseio.com
```

### 2. Hugging Face AI Setup

1. Go to https://huggingface.co/settings/tokens
2. Create a token with inference access
3. Add to `backend/.env`:
   ```
   HF_TOKEN=hf_xxx
   HF_MODEL=meta-llama/Llama-3.3-70B-Instruct
   ```

### 3. Razorpay (Optional - Only for Payments)

1. Go to https://razorpay.com → Sign up free
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy **Key ID** and **Key Secret**
4. For webhook: **Settings → Webhooks → Add Webhook**
   - URL: `https://your-backend.onrender.com/api/payments/webhook`
   - Copy the webhook secret shown
5. Add to `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=xxx
   RAZORPAY_WEBHOOK_SECRET=xxx
   ```

---

## 🚀 Deployment Guide

### Deploy Backend to Render (Free)

1. Go to https://render.com → Sign up free
2. Click **New → Web Service**
3. Connect your GitHub repo or upload the `backend` folder
4. Settings:
   - **Name**: resumecraft-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add all **Environment Variables**:
   ```
   FIREBASE_PROJECT_ID=[firebase project id]
   FIREBASE_CLIENT_EMAIL=[service account client email]
   FIREBASE_PRIVATE_KEY=[service account private key with \n escapes]
   FIREBASE_WEB_API_KEY=[firebase web api key]
   FIREBASE_DATABASE_URL=[optional, if needed]
   HF_TOKEN=[hugging face token]
   HF_MODEL=meta-llama/Llama-3.3-70B-Instruct
   RAZORPAY_KEY_ID=[optional]
   RAZORPAY_KEY_SECRET=[optional]
   RAZORPAY_WEBHOOK_SECRET=[optional]
   FRONTEND_URL=https://resumecraft.vercel.app
   NODE_ENV=production
   ```
6. Click **Create Web Service** → wait 3-5 minutes
7. Copy your backend URL: `https://resumecraft-backend.onrender.com`

### Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com → Sign up free
2. Click **New Project** → import your repo or upload `frontend` folder
3. **Root Directory**: frontend
4. Add **Environment Variables**:
   ```
   VITE_API_URL=https://resumecraft-backend.onrender.com
   ```
5. Click **Deploy** → wait 2 minutes
6. Copy your frontend URL: `https://resumecraft.vercel.app`

**Update Render backend:**
- Go back to Render → **Environment**
- Update `FRONTEND_URL=https://resumecraft.vercel.app`
- Save → it will redeploy

---

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  passwordHash    String
  name            String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // AI Feature
  aiMessages      Int       @default(5)
  lastAiReset     DateTime?
  
  // Relations
  resumes         Resume[]
  payments        Payment[]
  aiLogs          AILog[]
}
```

### Resume Model
```prisma
model Resume {
  id              String    @id @default(cuid())
  userId          String
  jobRole         String?
  resumeData      Json      @default("{}")
  templateId      String    @default("ats-classic")
  atsScore        Float?
  status          String    @default("draft")
  versionNumber   Int       @default(1)
  parentResumeId  String?
  isPublic        Boolean   @default(false)
  publicSlug      String?   @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  versions        ResumeVersion[]
}
```

### Payment Model
```prisma
model Payment {
  id                  String    @id @default(cuid())
  userId              String
  amount              Float
  razorpayOrderId     String    @unique
  razorpayPaymentId   String?
  status              String    @default("pending")
  createdAt           DateTime  @default(now())
  
  // Relations
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 🏗️ Project Architecture

### Backend Structure
```
backend/
├── src/
│   ├── index.js           ← Main server file
│   ├── middleware/
│   │   ├── auth.js        ← JWT authentication
│   │   └── rateLimit.js   ← Rate limiting
│   ├── routes/
│   │   ├── auth.js        ← Login, register, JWT endpoints
│   │   ├── resumes.js     ← Resume CRUD operations
│   │   ├── ai.js          ← Chat & AI analysis
│   │   ├── templates.js   ← Resume templates
│   │   ├── export.js      ← PDF/DOC export
│   │   └── payments.js    ← Razorpay integration
│   ├── services/
│   │   └── openai.js      ← Hugging Face inference calls
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx       ← Landing page
│   │   ├── Login.jsx      ← Login/Register
│   │   ├── Dashboard.jsx  ← Resume list
│   │   ├── Builder.jsx    ← Resume editor
│   │   ├── Preview.jsx    ← Resume preview
│   │   ├── Templates.jsx  ← Template gallery
│   │   └── Editor.jsx     ← Main editor
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ResumePreview.jsx
│   │   ├── ChatAssistant/
│   │   └── ATSScore/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ResumeContext.jsx
│   ├── hooks/
│   │   └── usePayment.js
│   └── utils/
│       └── api.js         ← API calls to backend
└── package.json
```

---

## 🔧 Key Features Overview

### 1. Resume Upload & Parsing
- Supports PDF and DOCX files
- Uses Hugging Face AI to extract structured data
- Handles edge cases: markdown code blocks, malformed JSON responses
- Validates extracted text length (minimum 30 characters)

### 2. ATS Score Analysis
- Analyzes resume content against job description
- Checks keyword matching
- Returns actionable improvement suggestions
- Real-time scoring with visual feedback

### 3. AI Chat Assistant
- 3 free AI messages per day (resets at midnight)
- Unlimited AI features for premium users
- No chat history stored (keeps costs minimal)
- Uses Hugging Face AI for responses

### 4. Payment System
- Razorpay integration for payments
- Test mode by default
- Webhook handling for payment confirmation
- Premium feature unlocking after payment

### 5. Resume Templates
- Multiple professional templates
- SVG-based previews (no placeholder images)
- Customizable styling
- Preview before selection

---

## 🐛 Bug Fixes Applied

### Critical Issues Resolved
1. **Prisma Schema Mismatch** - password vs passwordHash field
2. **Missing Models** - Added Payment, ResumeVersion, AILog models
3. **Resume Fields** - Added jobRole, resumeData, templateId, atsScore, etc.
4. **OpenAI Service** - Fixed null initialization
5. **AI Function** - Fixed malformed chatAssistant function
6. **Payment Routes** - Added missing route mounting in index.js
7. **PDF Upload** - Improved JSON extraction and error handling
8. **Database Relations** - Added cascade delete relationships

---

## 🎨 UI/UX Improvements

### Color Palette
- **Primary**: Slate-700 (professional dark gray)
- **Accent**: Amber-600 (natural warm gold)
- **Success**: Emerald-600 (natural green)
- **Background**: Slate-50, Slate-100 (neutral grays)

### Animations & Effects
- Blob animations for background elements
- Subtle hover transitions (shadow, scale)
- Smooth transitions between states
- Professional animations (no excessive motion)

### Component Enhancements
- Better modal designs with gradient headers
- Color-coded template cards (green=free, purple=premium)
- Improved form inputs with better focus states
- Enhanced button styles with hover effects
- Better notification designs

---

## 🧪 Testing

### Test Resume Upload
1. Start backend: `npm start` (from backend folder)
2. Start frontend: `npm run dev` (from frontend folder)
3. Navigate to Builder → Upload Resume tab
4. Select any PDF or DOCX file
5. Should parse successfully (no 500 error)

### Test Payment Flow (Sandbox)
- Use Razorpay test card: `4111 1111 1111 1111`
- Any future date for expiry
- Any CVV (e.g., 123)

### Test AI Chat
- Open chat assistant
- Send a message
- Should receive AI response
- Free users limited to 3/day (check reset at midnight)

---

## 🚨 Troubleshooting

### Database Connection Issues
**Error:** `Error: P1000 Connection refused`
- Check DATABASE_URL is correct
- Verify database is running
- Test connection with: `npx prisma db execute --stdin < test.sql`

### Hugging Face API Issues
**Error:** `401 Unauthorized` or `Forbidden`
- Verify HF_TOKEN is correct
- Ensure token has inference access
- Check model name in HF_MODEL

### PDF Upload Fails
**Error:** `500 error when uploading`
- Check file is valid PDF/DOCX
- Verify HF token works
- Check backend logs for detailed error
- Ensure extracted text is at least 30 characters

### Payment Webhooks Not Working
**Error:** Payments not being recorded
- Verify webhook URL in Razorpay settings
- Check webhook secret matches in .env
- Verify endpoint is publicly accessible (not localhost)
- Check backend is running and accessible

---

## 📊 Cost Estimate

For 100 active users/month:
- **Hugging Face AI**: depends on model and usage
- **Database**: Firestore free tier for low usage
- **Render Backend**: Free (with limitations)
- **Vercel Frontend**: Free (unlimited)
- **Razorpay**: 2% transaction fee only
- **Total**: ~₹500-1500/month

---

## 📝 Environment Variables Reference

```bash
# Required
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_WEB_API_KEY=your_firebase_web_api_key
HF_TOKEN=hf_xxx

# Optional
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Configuration
HF_MODEL=meta-llama/Llama-3.3-70B-Instruct
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

---

## 📖 Additional Resources

- [Hugging Face Inference Docs](https://huggingface.co/docs/api-inference/index)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Razorpay Integration](https://razorpay.com/docs/)

---

## ✅ Production Checklist

Before deploying to production:
- [ ] Change NODE_ENV to "production"
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS on all endpoints
- [ ] Set up error logging and monitoring
- [ ] Configure CORS properly (frontend URL only)
- [ ] Set up database backups
- [ ] Test all payment flows
- [ ] Configure rate limiting properly
- [ ] Test AI features with production keys
- [ ] Set up monitoring and alerts