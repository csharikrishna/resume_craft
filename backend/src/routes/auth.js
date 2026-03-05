const express = require('express');
const fetch = require('node-fetch');
const { authRateLimit } = require('../middleware/rateLimit');
const authMiddleware = require('../middleware/auth');
const { auth } = require('../services/firebase');
const { db, createDoc, getById, updateDoc, deleteDoc } = require('../services/firestore');

const router = express.Router();

const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY;

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

async function callIdentityToolkit(endpoint, payload) {
  if (!firebaseApiKey) {
    throw new Error('Missing FIREBASE_WEB_API_KEY');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${firebaseApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );

  const body = await response.json();
  if (!response.ok) {
    const code = body?.error?.message || 'AUTH_ERROR';
    if (code.includes('EMAIL_EXISTS')) throw new Error('Email already registered');
    if (code.includes('INVALID_LOGIN_CREDENTIALS') || code.includes('INVALID_PASSWORD') || code.includes('EMAIL_NOT_FOUND')) {
      throw new Error('Invalid credentials');
    }
    throw new Error('Authentication failed');
  }

  return body;
}

// Register
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const signup = await callIdentityToolkit('signUp', {
      email,
      password,
      returnSecureToken: true
    });

    const now = new Date().toISOString();
    await createDoc('users', {
      email,
      name,
      aiMessages: 5,
      lastAiReset: now,
      createdAt: now,
      updatedAt: now
    }, signup.localId);

    res.status(201).json({
      token: signup.idToken,
      user: { id: signup.localId, email, name, aiMessages: 5 }
    });
  } catch (err) {
    const status = err.message === 'Email already registered' ? 400 : 500;
    res.status(status).json({ error: err.message || 'Registration failed' });
  }
});

// Login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const login = await callIdentityToolkit('signInWithPassword', {
      email,
      password,
      returnSecureToken: true
    });

    let user = await getById('users', login.localId);
    const now = new Date();

    if (!user) {
      const createdAt = now.toISOString();
      await createDoc('users', {
        email: login.email,
        name: login.displayName || '',
        aiMessages: 5,
        lastAiReset: createdAt,
        createdAt,
        updatedAt: createdAt
      }, login.localId);
      user = await getById('users', login.localId);
    }

    // Reset AI messages daily
    const lastReset = new Date(user.lastAiReset || now.toISOString());
    if (!isSameDay(lastReset, now) && (user.aiMessages || 0) < 5) {
      user = await updateDoc('users', login.localId, {
        aiMessages: 5,
        lastAiReset: now.toISOString(),
        updatedAt: now.toISOString()
      });
    }

    res.json({
      token: login.idToken,
      user: { id: user.id, email: user.email, name: user.name, aiMessages: user.aiMessages ?? 5 }
    });
  } catch (err) {
    const status = err.message === 'Invalid credentials' ? 401 : 500;
    res.status(status).json({ error: err.message || 'Login failed' });
  }
});

// Google OAuth Sign-In
router.post('/google', authRateLimit, async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'ID token required' });

    // Verify the Google ID token using Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) return res.status(400).json({ error: 'Email required from Google account' });

    let user = await getById('users', uid);
    const now = new Date();

    if (!user) {
      // Create new user if doesn't exist
      const createdAt = now.toISOString();
      await createDoc('users', {
        email,
        name: name || email.split('@')[0],
        photoURL: picture || null,
        aiMessages: 5,
        lastAiReset: createdAt,
        createdAt,
        updatedAt: createdAt
      }, uid);
      user = await getById('users', uid);
    } else {
      // Update existing user's last login
      const lastReset = new Date(user.lastAiReset || now.toISOString());
      if (!isSameDay(lastReset, now) && (user.aiMessages || 0) < 5) {
        user = await updateDoc('users', uid, {
          aiMessages: 5,
          lastAiReset: now.toISOString(),
          updatedAt: now.toISOString()
        });
      }
    }

    res.json({
      token: idToken,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        photoURL: user.photoURL,
        aiMessages: user.aiMessages ?? 5 
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Invalid Google authentication' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  const user = req.user;
  res.json({ id: user.id, email: user.email, name: user.name, aiMessages: user.aiMessages });
});

// Delete account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const collections = ['resumes', 'resumeVersions', 'payments', 'aiLogs'];
    for (const collection of collections) {
      const snapshot = await db.collection(collection).where('userId', '==', userId).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      if (!snapshot.empty) await batch.commit();
    }

    await deleteDoc('users', userId);
    await auth.deleteUser(userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
