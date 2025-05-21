import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBm_iy4WJtYhTZTER1ec6RHI92L_A-pwKE",
    authDomain: "twilight-luxe-creations-1ae7b.firebaseapp.com",
    projectId: "twilight-luxe-creations-1ae7b",
    storageBucket: "twilight-luxe-creations-1ae7b.firebasestorage.app",
    messagingSenderId: "494405508025",
    appId: "1:494405508025:web:a44d2fc9fdf0dbabcdb468",
    measurementId: "G-9K96BWL534"
  };
  
  // Initialize Firebase
  let app: FirebaseApp;
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  const auth: Auth = getAuth(app);
  const db: Firestore = getFirestore(app);
  const storage: FirebaseStorage = getStorage(app);
  
  export { app, auth, db, storage };