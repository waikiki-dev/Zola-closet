// =====================================================
// ZOLA'S CLOSET - FIREBASE CONFIG
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1SI1SKGfWKCHpKo7pTelBpwMe4kF7QSQ",
  authDomain: "zola-closet.firebaseapp.com",
  projectId: "zola-closet",
  storageBucket: "zola-closet.firebasestorage.app",
  messagingSenderId: "639479599220",
  appId: "1:639479599220:web:1f805b0eb81e0581138121",
  measurementId: "G-P98X01S36Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);

// Firestore Database
const db = getFirestore(app);

export {
  app,
  auth,
  db
};
