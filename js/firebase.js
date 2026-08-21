/* =====================================================
   ZOLA'S CLOSET
   FIREBASE CONFIGURATION
   AUTH + REALTIME DATABASE
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
  get,
  push,
  update,
  remove
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
   INITIALIZE FIREBASE APP
===================================================== */

const app =
  initializeApp(firebaseConfig);


/* =====================================================
   FIREBASE ANALYTICS
===================================================== */

let analytics = null;

try {

  analytics =
    getAnalytics(app);

  console.log(
    "📊 Firebase Analytics: Ready"
  );

} catch (error) {

  console.warn(
    "⚠️ Firebase Analytics unavailable:",
    error
  );

}


/* =====================================================
   FIREBASE AUTH
===================================================== */

const auth =
  getAuth(app);


console.log(
  "🔐 Firebase Authentication: Ready"
);


/* =====================================================
   GOOGLE AUTH PROVIDER
===================================================== */

const googleProvider =
  new GoogleAuthProvider();


googleProvider.setCustomParameters({
  prompt: "select_account"
});


/* =====================================================
   FIREBASE REALTIME DATABASE
===================================================== */

const database =
  getDatabase(app);


console.log(
  "🔥 Firebase Realtime Database: Ready"
);


/* =====================================================
   DATABASE REFERENCE HELPER
===================================================== */

/*
   This helper creates a reference to any
   Realtime Database path.

   Example:

   databaseRef("products")

   databaseRef("products/abc123")
*/

function databaseRef(path = "") {

  return ref(
    database,
    path
  );

}


/* =====================================================
   FIREBASE PRODUCT HELPERS
===================================================== */

/*
   These helpers are optional, but keeping them here
   makes the Firebase database connection reusable.

   Product data itself is still created by admin.js.
*/


async function getProducts() {

  const productsRef =
    databaseRef("products");

  return await get(
    productsRef
  );

}


async function createProduct(
  productData
) {

  const productsRef =
    databaseRef("products");

  const newProductRef =
    push(productsRef);

  await set(
    newProductRef,
    productData
  );

  return newProductRef.key;

}


async function updateProduct(
  productId,
  productData
) {

  const productRef =
    databaseRef(
      `products/${productId}`
    );

  await update(
    productRef,
    productData
  );

}


async function deleteProduct(
  productId
) {

  const productRef =
    databaseRef(
      `products/${productId}`
    );

  await remove(
    productRef
  );

}


/* =====================================================
   FIREBASE CONNECTION TEST
===================================================== */

/*
   This function checks whether the application
   can actually reach the /products path.

   It does NOT write anything.
*/

async function testDatabaseConnection() {

  try {

    const productsRef =
      databaseRef("products");

    await get(
      productsRef
    );

    console.log(
      "✅ Realtime Database connection test passed."
    );

    return true;

  } catch (error) {

    console.error(
      "❌ Realtime Database connection test failed:",
      error
    );

    console.error(
      "Firebase error code:",
      error.code
    );

    console.error(
      "Firebase error message:",
      error.message
    );

    return false;

  }

}


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
  get,
  push,
  update,
  remove,

  /* Database Helper */
  databaseRef,

  /* Product Helpers */
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,

  /* Diagnostics */
  testDatabaseConnection

};


/* =====================================================
   FIREBASE READY
===================================================== */

console.log(
  "=============================================="
);

console.log(
  "🔥 ZOLA'S CLOSET FIREBASE"
);

console.log(
  "=============================================="
);

console.log(
  "🔥 Firebase App: Ready"
);

console.log(
  "🔐 Firebase Auth: Ready"
);

console.log(
  "🗄️ Realtime Database: Ready"
);

console.log(
  "🛍️ Product CRUD: Ready"
);

console.log(
  "📍 Database:",
  firebaseConfig.databaseURL
);

console.log(
  "=============================================="
);
