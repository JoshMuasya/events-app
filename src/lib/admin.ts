import * as admin from 'firebase-admin';

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  return admin;
}

export const firebaseAdmin = getFirebaseAdmin();
export const adminAuth = firebaseAdmin.auth()
export const adminFirestore = firebaseAdmin.firestore()