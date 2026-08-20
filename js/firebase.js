/* =====================================================
   ZOLA'S CLOSET
   FIREBASE CONFIGURATION
   FIREBASE AUTH + REALTIME DATABASE
===================================================== */


/* =====================================================
   FIREBASE APP
===================================================== */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


/* =====================================================
   FIREBASE ANALYTICS
===================================================== */

import {
  getAnalytics
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";


/* =====================================================
   FIREBASE AUTHENTICATION
===================================================== */

import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* =====================================================
   FIREBASE REALTIME DATABASE
===================================================== */

import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* =====================================================
   FIREBASE CONFIGURATION
===================================================== */

const firebaseConfig = {

  apiKey:
    "AIzaSyC1SI1SKgFwkCHpKo7pTelBpwMe4kF7QSQ",

  authDomain:
    "zola-closet.firebaseapp.com",

  databaseURL:
    "https://zola-closet-default-rtdb.asia-southeast1.firebasedatabase.app",

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
   ANALYTICS
===================================================== */

let analytics = null;

try {

  analytics =
    getAnalytics(app);

} catch (error) {

  console.warn(
    "Firebase Analytics unavailable:",
    error
  );

}


/* =====================================================
   AUTH
===================================================== */

const auth =
  getAuth(app);


/* =====================================================
   GOOGLE AUTH PROVIDER
===================================================== */

const googleProvider =
  new GoogleAuthProvider();


/*
  Optional:
  Force Google account selection
  instead of automatically using
  a previously signed-in account.
*/

googleProvider.setCustomParameters({
  prompt: "select_account"
});


/* =====================================================
   REALTIME DATABASE
===================================================== */

const database =
  getDatabase(app);


/* =====================================================
   EXPORT
===================================================== */

export {

  /* Firebase Core */
  app,

  /* Analytics */
  analytics,

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


/* =====================================================
   FIREBASE READY MESSAGE
===================================================== */

console.log(
  "🔥 Zola's Closet Firebase initialized successfully."
);

console.log(
  "🔥 Firebase Auth: Ready"
);

console.log(
  "🔥 Realtime Database: Ready"
);
