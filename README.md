# ResumeCraft — AI Resume Builder

An AI-powered resume builder that helps you land interviews. Deploy in 20 minutes. Everything free.

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

Create `backend/.env` and add your API keys:
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_WEB_API_KEY=your_firebase_web_api_key
HF_TOKEN=your_huggingface_token
HF_MODEL=meta-llama/Llama-3.3-70B-Instruct
RAZORPAY_KEY_ID=your_razorpay_key (optional)
RAZORPAY_KEY_SECRET=your_razorpay_secret (optional)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret (optional)
```

See [DOCUMENTATION.md](DOCUMENTATION.md) for how to get these keys.

### 3. Start Development

**Backend (from backend/ folder):**
```bash
npm start
```

**Frontend (from frontend/ folder in new terminal):**
```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 📁 Project Structure

```
resumecraft/
├── backend/          ← Node.js + Express API
│   ├── src/
│   └── package.json
│
└── frontend/         ← React + Vite UI
    ├── src/
    └── package.json
```

---

## 🔑 Key Features

- 🤖 **AI Resume Analysis** - Get real-time ATS score
- 📄 **PDF Upload** - Smart resume parsing with Hugging Face AI
- 🎨 **Professional Templates** - Multiple resume designs
- 💬 **Chat Assistant** - AI-powered coaching
- 💳 **Payment System** - Razorpay integration
- 🔐 **Secure Auth** - Firebase Authentication
- 📦 **Export Options** - Download as PDF

---

## 📚 Full Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for:
- API key setup (Hugging Face, Firebase, Razorpay)
- Deployment guides (Render + Vercel)
- Database schema
- Architecture overview
- Troubleshooting

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express, Firebase Auth, Firestore, Hugging Face Inference API, Razorpay

**Frontend:** React, Vite, TailwindCSS, Context API

---

## ❓ Support

Check [DOCUMENTATION.md](DOCUMENTATION.md) for detailed guides.
