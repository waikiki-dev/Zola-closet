/* =====================================================
   ZOLA'S CLOSET
   FIREBASE CONFIGURATION
===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {

  apiKey:
    "AIzaSyC1SI1SKgFwkCHpKo7pTelBpwMe4kF7QSQ",

  authDomain:
    "zola-closet.firebaseapp.com",

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
   AUTH
===================================================== */

const auth =
  getAuth(app);


/* =====================================================
   GOOGLE AUTH
===================================================== */

const googleProvider =
  new GoogleAuthProvider();


/* =====================================================
   REALTIME DATABASE
===================================================== */

const database =
  getDatabase(app);


/* =====================================================
   EXPORT
===================================================== */

export {

  app,

  auth,

  database,

  googleProvider,

  ref,

  set,

  get,

  createUserWithEmailAndPassword,

  signInWithEmailAndPassword,

  signInWithPopup,

  signOut,

  updateProfile,

  onAuthStateChanged

};
