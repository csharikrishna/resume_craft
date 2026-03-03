# ResumeCraft

Production-ready AI resume builder with ATS scoring, parsing, optimization, exports, and payment-gated premium actions.

## Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Auth / Database: Firebase Auth + Firestore
- AI: Hugging Face Inference API (`meta-llama/Llama-3.3-70B-Instruct`)
- Payments: Razorpay

## Monorepo Structure

```
resumecraft/
├── backend/
│   ├── src/
│   └── package.json
└── frontend/
    ├── src/
    └── package.json
```

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase project configured (Auth + Firestore)

### Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Environment Variables

#### Backend (`backend/.env`)

Required:

```env
NODE_ENV=development
PORT=5000

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_WEB_API_KEY=your_firebase_web_api_key
FIREBASE_DATABASE_URL=https://<project-id>-default-rtdb.firebaseio.com

HF_TOKEN=your_huggingface_token
HF_MODEL=meta-llama/Llama-3.3-70B-Instruct

# Comma-separated origins supported
CORS_ORIGIN=http://localhost:5173
```

Optional:

```env
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

#### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxx

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Run

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Health checks:

- `GET /health`
- `GET /api/health`

## Production Deployment

Recommended free setup:

- Backend: Render
- Frontend: Vercel

### Backend (Render)

Service configuration:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

Set backend env vars from above and ensure:

```env
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

If you support multiple frontend domains:

```env
CORS_ORIGIN=https://app1.vercel.app,https://app2.vercel.app
```

### Frontend (Vercel)

Project configuration:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Set:

```env
VITE_API_URL=https://your-backend.onrender.com
```

## Security and Reliability Notes

- `helmet` and `compression` are enabled in backend.
- CORS supports normalized origins and preflight handling.
- Error responses hide stack traces in production.
- API routes are behind auth middleware where required.
- Payment verification validates Razorpay signature server-side.

## Build and Validation

Backend syntax check:

```bash
cd backend
node -c src/index.js
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Operational Checklist

Before going live:

- Set all required env vars in Render and Vercel
- Confirm Firebase authorized domains include your frontend domain
- Verify backend health endpoint returns `200`
- Test auth, resume CRUD, AI endpoints, and payments
- Confirm CORS origin exactly matches deployed frontend domain

## License

Private project. Add a license if you plan to open source it.
