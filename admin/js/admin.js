/* =====================================================
   ZOLA'S CLOSET
   ADMIN DASHBOARD
   PRODUCT MANAGEMENT
===================================================== */

import {
  auth,
  database,
  ref,
  get,
  push,
  set,
  update,
  remove,
  onAuthStateChanged,
  signOut
} from "../../js/firebase.js";


/* =====================================================
   ADMIN STATE
===================================================== */

let currentAdmin = null;

let products = [];

let editingProductId = null;


/* =====================================================
   DOM HELPER
===================================================== */

const $ = id =>
  document.getElementById(id);


/* =====================================================
   ADMIN ELEMENTS
===================================================== */

const adminLogin =
  $("adminLogin");

const adminDashboard =
  $("adminDashboard");

const adminLoginForm =
  $("adminLoginForm");

const adminEmail =
  $("adminEmail");

const adminPassword =
  $("adminPassword");

const adminLogout =
  $("adminLogout");

const productForm =
  $("productForm");

const productsTable =
  $("productsTable");

const productModal =
  $("productModal");

const productModalTitle =
  $("productModalTitle");

const addProductBtn =
  $("addProductBtn");

const closeProductModal =
  $("closeProductModal");

const cancelProductBtn =
  $("cancelProductBtn");


/* =====================================================
   ADMIN AUTH STATE
===================================================== */

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {

      currentAdmin = null;

      showAdminLogin();

      return;

    }


    currentAdmin = user;


    console.log(
      "👤 Admin authenticated:",
      user.email
    );


    /*
      For now, authenticated users
      can enter the dashboard.

      We will add strict admin UID
      protection in the Firebase Rules
      after the dashboard is working.
    */

    showAdminDashboard();

    await loadProducts();

  }
);


/* =====================================================
   SHOW LOGIN
===================================================== */

function showAdminLogin() {

  if (adminLogin) {

    adminLogin.classList.remove(
      "hidden"
    );

  }


  if (adminDashboard) {

    adminDashboard.classList.add(
      "hidden"
    );

  }

}


/* =====================================================
   SHOW DASHBOARD
===================================================== */

function showAdminDashboard() {

  if (adminLogin) {

    adminLogin.classList.add(
      "hidden"
    );

  }


  if (adminDashboard) {

    adminDashboard.classList.remove(
      "hidden"
    );

  }


  updateAdminInfo();

}


/* =====================================================
   ADMIN INFO
===================================================== */

function updateAdminInfo() {

  const name =
    $("adminName");

  const email =
    $("adminEmailDisplay");


  if (name) {

    name.textContent =
      currentAdmin?.displayName ||
      "Admin";

  }


  if (email) {

    email.textContent =
      currentAdmin?.email ||
      "";

  }

}


/* =====================================================
   ADMIN LOGIN
===================================================== */

if (adminLoginForm) {

  adminLoginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const email =
        adminEmail?.value.trim() || "";

      const password =
        adminPassword?.value || "";


      if (!email || !password) {

        showAdminMessage(
          "Please enter your email and password.",
          "error"
        );

        return;

      }


      const button =
        adminLoginForm.querySelector(
          "button[type='submit']"
        );


      try {

        if (button) {

          button.disabled = true;

          button.textContent =
            "Signing In...";

        }


        /*
          We intentionally use the
          existing Firebase Auth session.

          Your admin account must already
          exist in Firebase Authentication.
        */

        const {
          signInWithEmailAndPassword
        } = await import(
          "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
        );


        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


        adminLoginForm.reset();


        showAdminMessage(
          "Welcome to Zola's Closet Admin! 🎀",
          "success"
        );


      } catch (error) {

        console.error(
          "Admin login error:",
          error
        );


        showAdminMessage(
          getAuthErrorMessage(error),
          "error"
        );


      } finally {

        if (button) {

          button.disabled = false;

          button.textContent =
            "Sign In";

        }

      }

    }
  );

}


/* =====================================================
   LOGOUT
===================================================== */

if (adminLogout) {

  adminLogout.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        showAdminLogin();


      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }

    }
  );

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

  if (!productsTable)
    return;


  productsTable.innerHTML = `

    <tr>

      <td colspan="7">

        <div class="admin-loading">
          Loading products...
        </div>

      </td>

    </tr>

  `;


  try {

    const productsRef =
      ref(
        database,
        "products"
      );


    const snapshot =
      await get(productsRef);


    if (!snapshot.exists()) {

      products = [];

      renderProducts();

      updateProductStats();

      return;

    }


    const data =
      snapshot.val();


    products =
      Object.entries(data)
        .map(
          ([id, product]) => ({

            id,

            ...product

          })
        );


    /*
      Newest products first.
    */

    products.reverse();


    renderProducts();

    updateProductStats();


    console.log(
      `🛍️ ${products.length} admin products loaded.`
    );


  } catch (error) {

    console.error(
      "Load products error:",
      error
    );


    productsTable.innerHTML = `

      <tr>

        <td colspan="7">

          <div class="admin-error">

            Unable to load products.

          </div>

        </td>

      </tr>

    `;

  }

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts() {

  if (!productsTable)
    return;


  if (!products.length) {

    productsTable.innerHTML = `

      <tr>

        <td colspan="7">

          <div class="admin-empty">

            <div class="admin-empty-icon">
              🎀
            </div>

            <h3>
              No products yet
            </h3>

            <p>
              Add your first product to Zola's Closet.
            </p>

          </div>

        </td>

      </tr>

    `;

    return;

  }


  productsTable.innerHTML =
    products
      .map(
        product => {

          const price =
            Number(
              product.price || 0
            );


          const stock =
            Number(
              product.stock ?? 0
            );


          const image =
            product.image ||
            product.imageUrl ||
            "";


          return `

            <tr>

              <td>

                <div class="admin-product">

                  ${
                    image
                      ? `
                        <img
                          src="${escapeHtml(image)}"
                          alt="${escapeHtml(product.name)}"
                          onerror="this.style.display='none'"
                        >
                      `
                      : `
                        <div class="admin-product-placeholder">
                          🎀
                        </div>
                      `
                  }

                </div>

              </td>


              <td>

                <strong>
                  ${escapeHtml(product.name || "Unnamed Product")}
                </strong>

              </td>


              <td>

                <span class="admin-category">

                  ${escapeHtml(product.category || "all")}

                </span>

              </td>


              <td>

                <strong>
                  ₱${price.toLocaleString()}
                </strong>

              </td>


              <td>

                <span
                  class="
                    stock-badge
                    ${stock > 0 ? "in-stock" : "out-stock"}
                  ">

                  ${
                    stock > 0
                      ? stock
                      : "Out of stock"
                  }

                </span>

              </td>


              <td>

                ${
                  product.featured === true
                    ? `
                      <span class="featured-badge">
                        Featured
                      </span>
                    `
                    : `
                      <span class="normal-badge">
                        Regular
                      </span>
                    `
                }

              </td>


              <td>

                <div class="admin-actions">

                  <button
                    class="edit-btn"
                    onclick="editProduct('${escapeJs(product.id)}')"
                    type="button">

                    Edit

                  </button>


                  <button
                    class="delete-btn"
                    onclick="deleteProduct('${escapeJs(product.id)}')"
                    type="button">

                    Delete

                  </button>

                </div>

              </td>

            </tr>

          `;

        }
      )
      .join("");

}


/* =====================================================
   PRODUCT STATS
===================================================== */

function updateProductStats() {

  const total =
    $("totalProducts");

  const featured =
    $("featuredProducts");

  const outOfStock =
    $("outOfStock");


  if (total) {

    total.textContent =
      products.length;

  }


  if (featured) {

    featured.textContent =
      products.filter(
        product =>
          product.featured === true
      ).length;

  }


  if (outOfStock) {

    outOfStock.textContent =
      products.filter(
        product =>
          Number(
            product.stock || 0
          ) <= 0
      ).length;

  }

}


/* =====================================================
   OPEN ADD PRODUCT
===================================================== */

function openAddProduct() {

  editingProductId = null;


  if (productForm) {

    productForm.reset();

  }


  if (productModalTitle) {

    productModalTitle.textContent =
      "Add New Product";

  }


  /*
    Default values
  */

  setInputValue(
    "productPrice",
    ""
  );

  setInputValue(
    "productOldPrice",
    ""
  );

  setInputValue(
    "productDiscount",
    "0"
  );

  setInputValue(
    "productRating",
    "5"
  );

  setInputValue(
    "productStock",
    "0"
  );


  const featured =
    $("productFeatured");


  if (featured) {

    featured.checked =
      false;

  }


  showProductModal();

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(id) {

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!product) {

    showAdminMessage(
      "Product not found.",
      "error"
    );

    return;

  }


  editingProductId =
    product.id;


  if (productModalTitle) {

    productModalTitle.textContent =
      "Edit Product";

  }


  setInputValue(
    "productName",
    product.name
  );

  setInputValue(
    "productCategory",
    product.category
  );

  setInputValue(
    "productPrice",
    product.price
  );

  setInputValue(
    "productOldPrice",
    product.oldPrice || ""
  );

  setInputValue(
    "productDiscount",
    product.discount || 0
  );

  setInputValue(
    "productRating",
    product.rating || 5
  );

  setInputValue(
    "productStock",
    product.stock ?? 0
  );

  setInputValue(
    "productColor",
    product.color || ""
  );

  setInputValue(
    "productDescription",
    product.description || ""
  );

  setInputValue(
    "productImage",
    product.image || ""
  );


  const featured =
    $("productFeatured");


  if (featured) {

    featured.checked =
      product.featured === true;

  }


  /*
    Sizes

    Stored as:
    ["2T", "3T", "4T"]
  */

  const sizes =
    $("productSizes");


  if (sizes) {

    sizes.value =
      Array.isArray(product.sizes)
        ? product.sizes.join(", ")
        : "";

  }


  showProductModal();

}


/* =====================================================
   SAVE PRODUCT
===================================================== */

if (productForm) {

  productForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!currentAdmin) {

        showAdminMessage(
          "You must be signed in as admin.",
          "error"
        );

        return;

      }


      const name =
        getInputValue(
          "productName"
        );


      const category =
        getInputValue(
          "productCategory"
        ).toLowerCase();


      const price =
        Number(
          getInputValue(
            "productPrice"
          )
        );


      const oldPrice =
        Number(
          getInputValue(
            "productOldPrice"
          ) || price
        );


      const discountInput =
        Number(
          getInputValue(
            "productDiscount"
          ) || 0
        );


      const rating =
        Number(
          getInputValue(
            "productRating"
          ) || 5
        );


      const stock =
        Number(
          getInputValue(
            "productStock"
          ) || 0
        );


      const color =
        getInputValue(
          "productColor"
        );


      const description =
        getInputValue(
          "productDescription"
        );


      const image =
        getInputValue(
          "productImage"
        );


      const sizesText =
        getInputValue(
          "productSizes"
        );


      const featured =
        $("productFeatured")
          ? $("productFeatured").checked
          : false;


      /* ---------------------------------------------
         VALIDATION
      --------------------------------------------- */

      if (!name) {

        showAdminMessage(
          "Product name is required.",
          "error"
        );

        return;

      }


      if (!category) {

        showAdminMessage(
          "Please select a category.",
          "error"
        );

        return;

      }


      if (
        !Number.isFinite(price) ||
        price < 0
      ) {

        showAdminMessage(
          "Please enter a valid price.",
          "error"
        );

        return;

      }


      if (stock < 0) {

        showAdminMessage(
          "Stock cannot be negative.",
          "error"
        );

        return;

      }


      const sizes =
        sizesText
          .split(",")
          .map(
            size =>
              size.trim()
          )
          .filter(Boolean);


      /*
        Automatically calculate discount
        when old price is greater than
        current price.
      */

      const discount =
        discountInput > 0
          ? discountInput
          : calculateDiscount(
              price,
              oldPrice
            );


      const productData = {

        name,

        category,

        price,

        oldPrice,

        discount,

        rating:

          rating < 0
            ? 0
            : rating > 5
              ? 5
              : rating,

        description,

        image,

        featured,

        stock,

        sizes,

        color,

        updatedAt:
          new Date().toISOString()

      };


      const saveButton =
        productForm.querySelector(
          "button[type='submit']"
        );


      try {

        if (saveButton) {

          saveButton.disabled =
            true;

          saveButton.dataset.originalText =
            saveButton.textContent;

          saveButton.textContent =
            editingProductId
              ? "Updating..."
              : "Adding...";

        }


        /* ---------------------------------------------
           EDIT EXISTING PRODUCT
        --------------------------------------------- */

        if (editingProductId) {

          const productRef =
            ref(
              database,
              `products/${editingProductId}`
            );


          await update(
            productRef,
            productData
          );


          showAdminMessage(
            "Product updated successfully! ✨",
            "success"
          );

        }


        /* ---------------------------------------------
           ADD NEW PRODUCT
        --------------------------------------------- */

        else {

          const productsRef =
            ref(
              database,
              "products"
            );


          const newProductRef =
            push(
              productsRef
            );


          const newProduct = {

            ...productData,

            id:
              newProductRef.key,

            createdAt:
              new Date().toISOString()

          };


          await set(
            newProductRef,
            newProduct
          );


          showAdminMessage(
            "Product added successfully! 🎀",
            "success"
          );

        }


        editingProductId = null;


        closeProductModal();


        await loadProducts();


      } catch (error) {

        console.error(
          "Save product error:",
          error
        );


        showAdminMessage(
          getDatabaseErrorMessage(error),
          "error"
        );


      } finally {

        if (saveButton) {

          saveButton.disabled =
            false;

          saveButton.textContent =
            saveButton.dataset.originalText ||
            "Save Product";

        }

      }

    }
  );

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

async function deleteProduct(id) {

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!product)
    return;


  const confirmed =
    confirm(
      `Delete "${product.name}"?\n\nThis action cannot be undone.`
    );


  if (!confirmed)
    return;


  try {

    const productRef =
      ref(
        database,
        `products/${id}`
      );


    await remove(
      productRef
    );


    showAdminMessage(
      "Product deleted successfully.",
      "success"
    );


    await loadProducts();


  } catch (error) {

    console.error(
      "Delete product error:",
      error
    );


    showAdminMessage(
      getDatabaseErrorMessage(error),
      "error"
    );

  }

}


/* =====================================================
   MODAL
===================================================== */

function showProductModal() {

  if (productModal) {

    productModal.classList.add(
      "show"
    );

  }

}


function closeProductModalFunction() {

  if (productModal) {

    productModal.classList.remove(
      "show"
    );

  }


  editingProductId = null;

}


if (addProductBtn) {

  addProductBtn.addEventListener(
    "click",
    openAddProduct
  );

}


if (closeProductModal) {

  closeProductModal.addEventListener(
    "click",
    closeProductModalFunction
  );

}


if (cancelProductBtn) {

  cancelProductBtn.addEventListener(
    "click",
    closeProductModalFunction
  );

}


if (productModal) {

  productModal.addEventListener(
    "click",
    event => {

      if (
        event.target === productModal
      ) {

        closeProductModalFunction();

      }

    }
  );

}


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeProductModalFunction();

    }

  }
);


/* =====================================================
   CALCULATE DISCOUNT
===================================================== */

function calculateDiscount(
  price,
  oldPrice
) {

  if (
    !oldPrice ||
    oldPrice <= price
  ) {

    return 0;

  }


  return Math.round(
    (
      (oldPrice - price) /
      oldPrice
    ) * 100
  );

}


/* =====================================================
   INPUT HELPERS
===================================================== */

function getInputValue(id) {

  const element =
    $(id);


  return element
    ? element.value.trim()
    : "";

}


function setInputValue(
  id,
  value
) {

  const element =
    $(id);


  if (element) {

    element.value =
      value ?? "";

  }

}


/* =====================================================
   ADMIN MESSAGE
===================================================== */

let adminMessageTimer = null;


function showAdminMessage(
  message,
  type = "success"
) {

  let element =
    $("adminMessage");


  /*
    Create message element
    automatically if it doesn't
    exist in admin HTML.
  */

  if (!element) {

    element =
      document.createElement(
        "div"
      );

    element.id =
      "adminMessage";

    document.body.appendChild(
      element
    );

  }


  element.textContent =
    message;


  element.className =
    `admin-message ${type}`;


  element.classList.add(
    "show"
  );


  clearTimeout(
    adminMessageTimer
  );


  adminMessageTimer =
    setTimeout(
      () => {

        element.classList.remove(
          "show"
        );

      },
      3500
    );

}


/* =====================================================
   AUTH ERROR
===================================================== */

function getAuthErrorMessage(
  error
) {

  switch (
    error?.code
  ) {

    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/user-not-found":
      return "Admin account not found.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/invalid-email":
      return "Invalid email address.";

    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";

    default:
      return (
        error?.message ||
        "Unable to sign in."
      );

  }

}


/* =====================================================
   DATABASE ERROR
===================================================== */

function getDatabaseErrorMessage(
  error
) {

  if (
    error?.code ===
    "PERMISSION_DENIED"
  ) {

    return (
      "Firebase denied this action. " +
      "Check your Realtime Database rules."
    );

  }


  return (
    error?.message ||
    "Unable to save product."
  );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =====================================================
   ESCAPE JS
===================================================== */

function escapeJs(value) {

  return String(
    value ?? ""
  )

    .replace(
      /\\/g,
      "\\\\"
    )

    .replace(
      /'/g,
      "\\'"
    )

    .replace(
      /"/g,
      '\\"'
    );

}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.editProduct =
  editProduct;

window.deleteProduct =
  deleteProduct;

window.openAddProduct =
  openAddProduct;

window.closeAdminProductModal =
  closeProductModalFunction;


/* =====================================================
   READY
===================================================== */

console.log(
  "🎀 Zola's Closet Admin initialized."
);

console.log(
  "🔥 Admin Firebase connection ready."
);

console.log(
  "🛍️ Product management ready."
);
