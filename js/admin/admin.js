/* =====================================================
   ZOLA'S CLOSET
   ADMIN DASHBOARD JAVASCRIPT
===================================================== */


/* =====================================================
   FIREBASE
===================================================== */

import {
  auth,
  onAuthStateChanged,
  signOut
} from "../../js/firebase.js";


/* =====================================================
   ELEMENTS
===================================================== */

const sidebar =
  document.getElementById("sidebar");

const menuBtn =
  document.getElementById("menuBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const pageTitle =
  document.getElementById("pageTitle");

const adminName =
  document.getElementById("adminName");

const adminEmail =
  document.getElementById("adminEmail");

const profileAvatar =
  document.getElementById("profileAvatar");

const settingsEmail =
  document.getElementById("settingsEmail");

const adminToast =
  document.getElementById("adminToast");


/* =====================================================
   SECTIONS
===================================================== */

const sections = {

  dashboard:
    document.getElementById("dashboardSection"),

  products:
    document.getElementById("productsSection"),

  orders:
    document.getElementById("ordersSection"),

  users:
    document.getElementById("usersSection"),

  settings:
    document.getElementById("settingsSection")

};


/* =====================================================
   PAGE TITLES
===================================================== */

const pageTitles = {

  dashboard: "Dashboard",

  products: "Products",

  orders: "Orders",

  users: "Users",

  settings: "Settings"

};


/* =====================================================
   SHOW SECTION
===================================================== */

function showSection(sectionName) {

  if (!sections[sectionName]) {
    return;
  }


  Object.values(sections).forEach(section => {

    section.classList.remove("active");

  });


  sections[sectionName]
    .classList.add("active");


  document
    .querySelectorAll(".nav-item")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.section === sectionName
      );

    });


  pageTitle.textContent =
    pageTitles[sectionName] || "Dashboard";


  sidebar.classList.remove("open");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   NAVIGATION
===================================================== */

document
  .querySelectorAll("[data-section]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        showSection(
          button.dataset.section
        );

      }
    );

  });


/* =====================================================
   MOBILE MENU
===================================================== */

if (menuBtn) {

  menuBtn.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle("open");

    }
  );

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer = null;

function showToast(
  message,
  duration = 3000
) {

  if (!adminToast) {
    return;
  }


  adminToast.textContent =
    message;


  adminToast.classList.add(
    "show"
  );


  clearTimeout(toastTimer);


  toastTimer = setTimeout(
    () => {

      adminToast.classList.remove(
        "show"
      );

    },
    duration
  );

}


/* =====================================================
   ADMIN USER UI
===================================================== */

function updateAdminUI(user) {

  if (!user) {
    return;
  }


  const name =
    user.displayName ||
    "Admin";


  const email =
    user.email ||
    "";


  adminName.textContent =
    name;


  adminEmail.textContent =
    email;


  settingsEmail.textContent =
    email;


  const firstLetter =
    name
      .trim()
      .charAt(0)
      .toUpperCase();


  profileAvatar.textContent =
    firstLetter || "A";

}


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
  auth,
  user => {

    if (!user) {

      /*
        No authenticated user.

        For now we return to the
        store homepage.

        Later we can create a
        dedicated admin login page.
      */

      window.location.href =
        "../../index.html";

      return;

    }


    updateAdminUI(user);


    console.log(
      "Admin dashboard user:",
      user.email
    );

  }
);


/* =====================================================
   LOGOUT
===================================================== */

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);


        showToast(
          "Signed out successfully."
        );


        setTimeout(
          () => {

            window.location.href =
              "../../index.html";

          },
          700
        );

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );


        showToast(
          "Unable to sign out."
        );

      }

    }
  );

}


/* =====================================================
   PRODUCT MODAL
===================================================== */

const productModal =
  document.getElementById(
    "productModal"
  );

const addProductBtn =
  document.getElementById(
    "addProductBtn"
  );

const closeProductModal =
  document.getElementById(
    "closeProductModal"
  );

const cancelProductBtn =
  document.getElementById(
    "cancelProductBtn"
  );

const productForm =
  document.getElementById(
    "productForm"
  );

const productModalTitle =
  document.getElementById(
    "productModalTitle"
  );


/* =====================================================
   OPEN PRODUCT MODAL
===================================================== */

function openProductModal() {

  productModal
    .classList.add("active");


  productModalTitle.textContent =
    "Add Product";


  productForm.reset();


  const productId =
    document.getElementById(
      "productId"
    );


  if (productId) {
    productId.value = "";
  }

}


/* =====================================================
   CLOSE PRODUCT MODAL
===================================================== */

function closeProductModalHandler() {

  productModal
    .classList.remove("active");

}


/* =====================================================
   OPEN
===================================================== */

if (addProductBtn) {

  addProductBtn.addEventListener(
    "click",
    openProductModal
  );

}


/* =====================================================
   CLOSE
===================================================== */

if (closeProductModal) {

  closeProductModal.addEventListener(
    "click",
    closeProductModalHandler
  );

}


if (cancelProductBtn) {

  cancelProductBtn.addEventListener(
    "click",
    closeProductModalHandler
  );

}


/* =====================================================
   CLICK OUTSIDE MODAL
===================================================== */

if (productModal) {

  productModal.addEventListener(
    "click",
    event => {

      if (
        event.target === productModal
      ) {

        closeProductModalHandler();

      }

    }
  );

}


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      productModal.classList.contains(
        "active"
      )
    ) {

      closeProductModalHandler();

    }

  }
);


/* =====================================================
   PRODUCT FORM
===================================================== */

if (productForm) {

  productForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      /*
        CRUD will be connected
        to Firebase Realtime Database
        in the next step.
      */


      showToast(
        "Product form is ready."
      );


      console.log(
        "Product form submitted."
      );

    }
  );

}


/* =====================================================
   INITIALIZE
===================================================== */

console.log(
  "🛍 Zola's Closet Admin Dashboard loaded."
);

console.log(
  "🔥 Firebase Admin Authentication ready."
);
