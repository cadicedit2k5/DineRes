import { initializeApp } from "firebase/app";
import {getDatabase} from 'firebase/database'
import {FIREBASE_API_KEY, FIREBASE_DATABASE_URL } from "@env"

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "dinereschat-4c3b0.firebaseapp.com",
  projectId: "dinereschat-4c3b0",
  storageBucket: "dinereschat-4c3b0.firebasestorage.app",
  messagingSenderId: "233916944230",
  appId: "1:233916944230:web:d1e8da1c22f563e01242a7",
  databaseURL: FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
