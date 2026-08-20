/* =====================================================
   ZOLA'S CLOSET
   FIREBASE CONFIGURATION
   Firebase Auth + Realtime Database
===================================================== */


/* =====================================================
   FIREBASE CORE
===================================================== */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";


/* =====================================================
   FIREBASE AUTHENTICATION
===================================================== */

import {
  getAuth,
  GoogleAuthProvider,

  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";


/* =====================================================
   FIREBASE REALTIME DATABASE
===================================================== */

import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-database.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {

  apiKey:
    "AIzaSyC1SI1SKfGwkCHpKo7pTelBpwMe4kF7QSQ",

  authDomain:
    "zola-closet.firebaseapp.com",

  databaseURL:
    "https://zola-closet-default-rtdb.asia-southeast1.firebasedatabase.app/",

  projectId:
    "zola-closet",

  storageBucket:
    "zola-closet.firebasestorage.app",

  messagingSenderId:
    "639479599220",

  appId:
    "1:639479599220:web:1f805b0eb81e0581138121",

  measurementId:
    "G-P98X01S36Q"

};


/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app =
  initializeApp(firebaseConfig);


/* =====================================================
   INITIALIZE AUTH
===================================================== */

const auth =
  getAuth(app);


/* =====================================================
   GOOGLE PROVIDER
===================================================== */

const googleProvider =
  new GoogleAuthProvider();


/* =====================================================
   INITIALIZE REALTIME DATABASE
===================================================== */

const database =
  getDatabase(app);


/* =====================================================
   EXPORT EVERYTHING NEEDED BY script.js
===================================================== */

export {

  /* Firebase */

  app,
  auth,
  database,

  /* Google */

  googleProvider,

  /* Realtime Database */

  ref,
  set,
  get,

  /* Email / Password Auth */

  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,

  /* Google Auth */

  signInWithPopup,

  /* Account */

  signOut,
  updateProfile,

  /* Auth State */

  onAuthStateChanged

};
