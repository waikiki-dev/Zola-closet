/* =====================================================
   ZOLA'S CLOSET
   FIREBASE CONFIGURATION
   FIREBASE AUTH + REALTIME DATABASE
===================================================== */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  get
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

/*
  PALITAN ANG VALUES SA IBABA
  GAMITIN ANG CONFIG MULA SA FIREBASE CONSOLE
*/

const firebaseConfig = {

  apiKey:
    "YOUR_FIREBASE_API_KEY",

  authDomain:
    "YOUR_PROJECT_ID.firebaseapp.com",

  databaseURL:
    "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",

  projectId:
    "YOUR_PROJECT_ID",

  storageBucket:
    "YOUR_PROJECT_ID.firebasestorage.app",

  messagingSenderId:
    "YOUR_MESSAGING_SENDER_ID",

  appId:
    "YOUR_FIREBASE_APP_ID"

};


/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app =
  initializeApp(firebaseConfig);


/* =====================================================
   FIREBASE AUTH
===================================================== */

const auth =
  getAuth(app);


/* =====================================================
   GOOGLE AUTH PROVIDER
===================================================== */

const googleProvider =
  new GoogleAuthProvider();


/* =====================================================
   REALTIME DATABASE
===================================================== */

const database =
  getDatabase(app);


/* =====================================================
   EXPORT FIREBASE SERVICES
===================================================== */

export {

  /* Firebase Core */
  app,

  /* Authentication */
  auth,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,

  /* Realtime Database */
  database,
  ref,
  set,
  get

};
