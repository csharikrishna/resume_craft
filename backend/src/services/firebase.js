const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function parseServiceAccount() {
  // Try file path first
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const filePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.warn(`⚠ Could not load service account file (${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}):`, err.message);
    }
  }

  // Try JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (err) {
      console.warn('⚠ Could not parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
    }
  }

  // Try individual env vars
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  }

  return null;
}

if (!admin.apps.length) {
  const serviceAccount = parseServiceAccount();
  
  if (serviceAccount) {
    // Use service account credential
    const credential = admin.credential.cert(serviceAccount);
    admin.initializeApp({
      credential,
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    // Fall back to Application Default Credentials (uses firebase login session or GOOGLE_APPLICATION_CREDENTIALS)
    console.log('ℹ Using Application Default Credentials (firebase login session)');
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'resumecraft-1f232',
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  }
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = {
  admin,
  db,
  auth: admin.auth()
};
