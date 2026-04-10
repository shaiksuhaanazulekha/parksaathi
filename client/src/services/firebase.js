import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// The user must provide a configuration object via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy_api_key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "123",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "123"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
