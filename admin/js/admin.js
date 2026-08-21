/* =====================================================
   ZOLA'S CLOSET
   ADMIN DASHBOARD
   Firebase Realtime Database + Authentication
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
} from "../firebase.js";


/* =====================================================
   ADMIN CONFIG
===================================================== */

const ADMIN_EMAIL =
  "waikiki.mod@gmail.com";


/* =====================================================
   APP STATE
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
   DOM ELEMENTS
===================================================== */

const sidebar =
  $("sidebar");

const menuBtn =
  $("menuBtn");

const pageTitle =
  $("pageTitle");

const navItems =
  document.querySelectorAll(
    ".nav-item"
  );

const adminSections =
  document.querySelectorAll(
    ".admin-section"
  );

const quickActions =
  document.querySelectorAll(
    ".quick-action"
  );


/* =====================================================
   PAGE TITLES
===================================================== */

const sectionTitles = {

  dashboard:
    "Dashboard",

  products:
    "Products",

  orders:
    "Orders",

  users:
    "Users",

  settings:
    "Settings"

};


/* =====================================================
   ADMIN AUTH
===================================================== */

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {

      redirectToLogin();

      return;

    }


    const email =
      String(
        user.email || ""
      )
      .toLowerCase()
      .trim();


    /*
      Only the configured admin
      email can access this dashboard.
    */

    if (
      email !==
      ADMIN_EMAIL.toLowerCase()
    ) {

      console.warn(
        "Unauthorized admin access:",
        user.email
      );


      showToast(
        "You are not authorized to access the admin dashboard.",
        "error"
      );


      await signOut(auth);

      redirectToLogin();

      return;

    }


    currentAdmin =
      user;


    updateAdminProfile();

    initializeDashboard();

  }
);


/* =====================================================
   REDIRECT TO STORE LOGIN
===================================================== */

function redirectToLogin() {

  /*
    We return to the store.

    The customer login system
    is already available there.
  */

  window.location.href =
    "../index.html";

}


/* =====================================================
   UPDATE ADMIN PROFILE
===================================================== */

function updateAdminProfile() {

  if (!currentAdmin)
    return;


  const nameElement =
    $("adminName");

  const emailElement =
    $("adminEmail");

  const avatarElement =
    $("profileAvatar");

  const settingsEmail =
    $("settingsEmail");


  const email =
    currentAdmin.email ||
    ADMIN_EMAIL;


  const displayName =
    currentAdmin.displayName ||
    "Admin";


  if (nameElement) {

    nameElement.textContent =
      displayName;

  }


  if (emailElement) {

    emailElement.textContent =
      email;

  }


  if (settingsEmail) {

    settingsEmail.textContent =
      email;

  }


  if (avatarElement) {

    avatarElement.textContent =
      (
        displayName.charAt(0) ||
        "A"
      ).toUpperCase();

  }

}


/* =====================================================
   INITIALIZE DASHBOARD
===================================================== */

async function initializeDashboard() {

  console.log(
    "🎀 Zola's Closet Admin Dashboard initialized."
  );

  console.log(
    "🔥 Admin:",
    currentAdmin?.email
  );


  setupNavigation();

  setupMobileMenu();

  setupProductModal();

  setupProductSearch();

  setupProductCategoryFilter();

  setupLogout();

  await loadDashboardData();

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

  navItems.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const section =
            button.dataset.section;

          if (!section)
            return;


          switchSection(
            section
          );

        }
      );

    }
  );


  quickActions.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const section =
            button.dataset.section;

          if (!section)
            return;


          switchSection(
            section
          );

        }
      );

    }
  );

}


/* =====================================================
   SWITCH SECTION
===================================================== */

function switchSection(
  section
) {

  navItems.forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.section ===
          section
      );

    }
  );


  adminSections.forEach(
    sectionElement => {

      sectionElement.classList.toggle(
        "active",
        sectionElement.id ===
          `${section}Section`
      );

    }
  );


  if (pageTitle) {

    pageTitle.textContent =
      sectionTitles[section] ||
      "Dashboard";

  }


  /*
    Refresh data when opening
    certain sections.
  */

  if (section === "products") {

    loadProducts();

  }


  if (section === "orders") {

    loadOrders();

  }


  if (section === "users") {

    loadUsers();

  }


  /*
    Close mobile sidebar.
  */

  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }

}


/* =====================================================
   MOBILE MENU
===================================================== */

function setupMobileMenu() {

  if (!menuBtn)
    return;


  menuBtn.addEventListener(
    "click",
    () => {

      if (!sidebar)
        return;


      sidebar.classList.toggle(
        "open"
      );

    }
  );

}


/* =====================================================
   LOGOUT
===================================================== */

function setupLogout() {

  const logoutBtn =
    $("logoutBtn");


  if (!logoutBtn)
    return;


  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        logoutBtn.disabled = true;

        logoutBtn.textContent =
          "Signing Out...";


        await signOut(auth);


      } catch (error) {

        console.error(
          "Admin logout error:",
          error
        );


        showToast(
          "Unable to sign out.",
          "error"
        );


        logoutBtn.disabled = false;

        logoutBtn.textContent =
          "Sign Out";

      }

    }
  );

}


/* =====================================================
   LOAD DASHBOARD DATA
===================================================== */

async function loadDashboardData() {

  await Promise.all([
    loadProducts(),
    loadOrders(),
    loadUsers()
  ]);

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {

  const tableBody =
    $("productsTableBody");


  if (tableBody) {

    tableBody.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="empty-table"
        >
          Loading products...
        </td>

      </tr>

    `;

  }


  try {

    const productsRef =
      ref(
        database,
        "products"
      );


    const snapshot =
      await get(productsRef);


    products = [];


    if (snapshot.exists()) {

      const data =
        snapshot.val();


      if (
        typeof data === "object" &&
        !Array.isArray(data)
      ) {

        products =
          Object.entries(data)
            .map(
              ([firebaseId, product]) => {

                return normalizeAdminProduct(
                  product,
                  firebaseId
                );

              }
            )
            .filter(Boolean);

      } else if (
        Array.isArray(data)
      ) {

        products =
          data
            .map(
              (product, index) =>
                normalizeAdminProduct(
                  product,
                  index
                )
            )
            .filter(Boolean);

      }

    }


    console.log(
      `🛍️ ${products.length} products loaded.`
    );


    renderProductsTable();

    updateProductCount();

    updateRevenueAndOrders();


  } catch (error) {

    console.error(
      "Failed to load products:",
      error
    );


    if (tableBody) {

      tableBody.innerHTML = `

        <tr>

          <td
            colspan="6"
            class="empty-table"
          >

            Unable to load products.

          </td>

        </tr>

      `;

    }


    showToast(
      "Unable to load products from Firebase.",
      "error"
    );

  }

}


/* =====================================================
   NORMALIZE ADMIN PRODUCT
===================================================== */

function normalizeAdminProduct(
  product,
  firebaseId
) {

  if (!product)
    return null;


  const id =
    product.id ??
    firebaseId;


  const price =
    Number(
      product.price || 0
    );


  const oldPrice =
    Number(
      product.oldPrice ??
      product.originalPrice ??
      price
    );


  const discount =
    Number(
      product.discount ||
      calculateDiscount(
        price,
        oldPrice
      )
    );


  return {

    id,

    firebaseId,

    name:
      String(
        product.name ||
        "Unnamed Product"
      ),

    category:
      String(
        product.category ||
        "all"
      ).toLowerCase(),

    price,

    oldPrice,

    discount,

    rating:
      Number(
        product.rating || 5
      ),

    description:
      String(
        product.description ||
        ""
      ),

    image:
      String(
        product.image ||
        product.imageUrl ||
        ""
      ),

    featured:
      product.featured === true,

    stock:
      Number(
        product.stock ?? 0
      ),

    sizes:
      normalizeSizes(
        product.sizes ||
        product.size
      ),

    color:
      String(
        product.color ||
        ""
      ),

    badge:
      String(
        product.badge ||
        ""
      )

  };

}


/* =====================================================
   NORMALIZE SIZES
===================================================== */

function normalizeSizes(
  value
) {

  if (Array.isArray(value)) {

    return value
      .map(
        size =>
          String(size).trim()
      )
      .filter(Boolean);

  }


  if (
    typeof value ===
    "string"
  ) {

    return value
      .split(",")
      .map(
        size =>
          size.trim()
      )
      .filter(Boolean);

  }


  return [];

}


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
   RENDER PRODUCTS TABLE
===================================================== */

function renderProductsTable() {

  const tableBody =
    $("productsTableBody");


  if (!tableBody)
    return;


  const searchInput =
    $("productSearch");

  const categoryFilter =
    $("productCategoryFilter");


  const search =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";


  const category =
    categoryFilter
      ? categoryFilter.value
      : "all";


  const filtered =
    products.filter(
      product => {

        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(search);


        const matchesCategory =
          category === "all" ||
          product.category ===
            category;


        return (
          matchesSearch &&
          matchesCategory
        );

      }
    );


  if (!filtered.length) {

    tableBody.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="empty-table"
        >

          <div class="empty-state">

            <div>
              🛍️
            </div>

            <h3>
              No products found
            </h3>

            <p>
              Add your first product to get started.
            </p>

          </div>

        </td>

      </tr>

    `;

    return;

  }


  tableBody.innerHTML =
    filtered
      .map(
        product =>
          createProductRow(
            product
          )
      )
      .join("");

}


/* =====================================================
   CREATE PRODUCT ROW
===================================================== */

function createProductRow(
  product
) {

  const status =
    getProductStatus(
      product.stock
    );


  const image =
    product.image
      ? `

        <img
          src="${escapeHtml(product.image)}"
          alt="${escapeHtml(product.name)}"
          class="table-product-image"
          onerror="this.style.display='none'"
        >

      `
      : `

        <div class="table-product-placeholder">
          🎀
        </div>

      `;


  return `

    <tr>

      <td>

        <div class="table-product">

          ${image}

          <div>

            <strong>
              ${escapeHtml(product.name)}
            </strong>

            ${
              product.badge
                ? `
                  <small>
                    ${escapeHtml(product.badge)}
                  </small>
                `
                : ""
            }

          </div>

        </div>

      </td>


      <td>
        ${escapeHtml(product.category)}
      </td>


      <td>
        ₱${product.price.toLocaleString()}
      </td>


      <td>
        ${product.stock}
      </td>


      <td>

        <span
          class="product-status ${status.className}"
        >
          ${status.label}
        </span>

      </td>


      <td>

        <div class="table-actions">

          <button
            class="table-action edit"
            type="button"
            data-edit-product="${escapeHtml(product.firebaseId)}"
          >
            Edit
          </button>


          <button
            class="table-action delete"
            type="button"
            data-delete-product="${escapeHtml(product.firebaseId)}"
          >
            Delete
          </button>

        </div>

      </td>

    </tr>

  `;

}


/* =====================================================
   PRODUCT STATUS
===================================================== */

function getProductStatus(
  stock
) {

  const quantity =
    Number(stock || 0);


  if (quantity <= 0) {

    return {

      label:
        "Out of Stock",

      className:
        "status-danger"

    };

  }


  if (quantity <= 5) {

    return {

      label:
        "Low Stock",

      className:
        "status-warning"

    };

  }


  return {

    label:
      "In Stock",

    className:
      "status-success"

  };

}


/* =====================================================
   PRODUCT TABLE ACTIONS
===================================================== */

document.addEventListener(
  "click",
  event => {

    const editButton =
      event.target.closest(
        "[data-edit-product]"
      );


    if (editButton) {

      const firebaseId =
        editButton.dataset.editProduct;


      editProduct(
        firebaseId
      );

      return;

    }


    const deleteButton =
      event.target.closest(
        "[data-delete-product]"
      );


    if (deleteButton) {

      const firebaseId =
        deleteButton.dataset.deleteProduct;


      deleteProduct(
        firebaseId
      );

    }

  }
);


/* =====================================================
   UPDATE PRODUCT COUNT
===================================================== */

function updateProductCount() {

  const element =
    $("productCount");


  if (element) {

    element.textContent =
      products.length;

  }

}


/* =====================================================
   PRODUCT SEARCH
===================================================== */

function setupProductSearch() {

  const search =
    $("productSearch");


  if (!search)
    return;


  search.addEventListener(
    "input",
    renderProductsTable
  );

}


/* =====================================================
   CATEGORY FILTER
===================================================== */

function setupProductCategoryFilter() {

  const filter =
    $("productCategoryFilter");


  if (!filter)
    return;


  filter.addEventListener(
    "change",
    renderProductsTable
  );

}


/* =====================================================
   PRODUCT MODAL
===================================================== */

function setupProductModal() {

  const addButton =
    $("addProductBtn");

  const closeButton =
    $("closeProductModal");

  const cancelButton =
    $("cancelProductBtn");

  const form =
    $("productForm");

  const modal =
    $("productModal");


  if (addButton) {

    addButton.addEventListener(
      "click",
      openAddProductModal
    );

  }


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeProductModal
    );

  }


  if (cancelButton) {

    cancelButton.addEventListener(
      "click",
      closeProductModal
    );

  }


  if (form) {

    form.addEventListener(
      "submit",
      handleProductSubmit
    );

  }


  if (modal) {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          closeProductModal();

        }

      }
    );

  }

}


/* =====================================================
   OPEN ADD PRODUCT
===================================================== */

function openAddProductModal() {

  editingProductId = null;


  const form =
    $("productForm");


  const title =
    $("productModalTitle");


  const message =
    $("productFormMessage");


  if (form) {

    form.reset();

  }


  /*
    Set default discount.
  */

  const discount =
    $("productDiscount");


  if (discount) {

    discount.value = "0";

  }


  if (title) {

    title.textContent =
      "Add Product";

  }


  if (message) {

    message.textContent = "";

    message.className =
      "form-message";

  }


  const modal =
    $("productModal");


  if (modal) {

    modal.classList.add(
      "show"
    );

  }

}


/* =====================================================
   CLOSE PRODUCT MODAL
===================================================== */

function closeProductModal() {

  const modal =
    $("productModal");


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }


  editingProductId = null;


  const form =
    $("productForm");


  if (form) {

    form.reset();

  }

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(
  firebaseId
) {

  const product =
    products.find(
      item =>
        String(item.firebaseId) ===
        String(firebaseId)
    );


  if (!product) {

    showToast(
      "Product not found.",
      "error"
    );

    return;

  }


  editingProductId =
    product.firebaseId;


  setValue(
    "productId",
    product.firebaseId
  );


  setValue(
    "productName",
    product.name
  );


  setValue(
    "productPrice",
    product.price
  );


  setValue(
    "productStock",
    product.stock
  );


  setValue(
    "productCategory",
    product.category
  );


  setValue(
    "productSize",
    product.sizes.join(", ")
  );


  setValue(
    "productImage",
    product.image
  );


  setValue(
    "productDescription",
    product.description
  );


  setValue(
    "productBadge",
    product.badge
  );


  setValue(
    "productDiscount",
    product.discount
  );


  const title =
    $("productModalTitle");


  if (title) {

    title.textContent =
      "Edit Product";

  }


  const message =
    $("productFormMessage");


  if (message) {

    message.textContent = "";

    message.className =
      "form-message";

  }


  const modal =
    $("productModal");


  if (modal) {

    modal.classList.add(
      "show"
    );

  }

}


/* =====================================================
   SET VALUE
===================================================== */

function setValue(
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
   PRODUCT FORM SUBMIT
===================================================== */

async function handleProductSubmit(
  event
) {

  event.preventDefault();


  if (!currentAdmin) {

    showToast(
      "Admin authentication required.",
      "error"
    );

    return;

  }


  const form =
    $("productForm");


  const submitButton =
    form?.querySelector(
      "button[type='submit']"
    );


  const name =
    $("productName")?.value
      .trim() || "";


  const price =
    Number(
      $("productPrice")?.value || 0
    );


  const stock =
    Number(
      $("productStock")?.value || 0
    );


  const category =
    $("productCategory")?.value
      .trim()
      .toLowerCase() || "";


  const sizeInput =
    $("productSize")?.value
      .trim() || "";


  const image =
    $("productImage")?.value
      .trim() || "";


  const description =
    $("productDescription")?.value
      .trim() || "";


  const badge =
    $("productBadge")?.value
      .trim() || "";


  const discount =
    Number(
      $("productDiscount")?.value || 0
    );


  if (!name) {

    showFormMessage(
      "Please enter a product name.",
      "error"
    );

    return;

  }


  if (
    !Number.isFinite(price) ||
    price < 0
  ) {

    showFormMessage(
      "Please enter a valid price.",
      "error"
    );

    return;

  }


  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {

    showFormMessage(
      "Please enter a valid stock quantity.",
      "error"
    );

    return;

  }


  if (!category) {

    showFormMessage(
      "Please select a category.",
      "error"
    );

    return;

  }


  if (!image) {

    showFormMessage(
      "Please enter a product image URL.",
      "error"
    );

    return;

  }


  if (
    discount < 0 ||
    discount > 100
  ) {

    showFormMessage(
      "Discount must be between 0 and 100.",
      "error"
    );

    return;

  }


  const sizes =
    normalizeSizes(
      sizeInput
    );


  /*
    Calculate old price from
    current price + discount.

    Example:

    Price = ₱400
    Discount = 20%

    Old Price ≈ ₱500
  */

  const oldPrice =
    discount > 0
      ? Math.round(
          price /
          (1 - discount / 100)
        )
      : price;


  const productData = {

    name,

    category,

    price,

    oldPrice,

    discount,

    rating:
      5,

    description:
      description ||
      "Cute and comfortable style for little ones.",

    image,

    featured:
      false,

    stock,

    sizes,

    color:
      "",

    badge,

    updatedAt:
      new Date().toISOString(),

    updatedBy:
      currentAdmin.email

  };


  try {

    if (submitButton) {

      submitButton.disabled = true;

      submitButton.dataset.originalText =
        submitButton.textContent;

      submitButton.textContent =
        editingProductId
          ? "Updating..."
          : "Saving...";

    }


    /*
      EDIT EXISTING PRODUCT
    */

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


      showToast(
        "Product updated successfully! ✨"
      );

    }


    /*
      ADD NEW PRODUCT
    */

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


      const firebaseId =
        newProductRef.key;


      const newProductData = {

        ...productData,

        id:
          firebaseId,

        createdAt:
          new Date().toISOString()

      };


      await set(
        newProductRef,
        newProductData
      );


      showToast(
        "Product added successfully! 🎀"
      );

    }


    closeProductModal();

    await loadProducts();


  } catch (error) {

    console.error(
      "Product save error:",
      error
    );


    console.error(
      "Firebase error code:",
      error.code
    );


    showFormMessage(
      getFirebaseDatabaseErrorMessage(
        error
      ),
      "error"
    );


    showToast(
      "Unable to save product.",
      "error"
    );

  } finally {

    if (submitButton) {

      submitButton.disabled = false;

      submitButton.textContent =
        submitButton.dataset.originalText ||
        "Save Product";

    }

  }

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

async function deleteProduct(
  firebaseId
) {

  const product =
    products.find(
      item =>
        String(item.firebaseId) ===
        String(firebaseId)
    );


  if (!product) {

    showToast(
      "Product not found.",
      "error"
    );

    return;

  }


  const confirmed =
    window.confirm(
      `Delete "${product.name}"?\n\nThis action cannot be undone.`
    );


  if (!confirmed)
    return;


  try {

    const productRef =
      ref(
        database,
        `products/${firebaseId}`
      );


    await remove(
      productRef
    );


    showToast(
      "Product deleted successfully."
    );


    await loadProducts();


  } catch (error) {

    console.error(
      "Delete product error:",
      error
    );


    showToast(
      "Unable to delete product.",
      "error"
    );

  }

}


/* =====================================================
   FORM MESSAGE
===================================================== */

function showFormMessage(
  message,
  type = "error"
) {

  const element =
    $("productFormMessage");


  if (!element)
    return;


  element.textContent =
    message;


  element.className =
    `form-message ${type}`;

}


/* =====================================================
   LOAD ORDERS
===================================================== */

async function loadOrders() {

  const container =
    $("ordersContainer");


  if (!container)
    return;


  try {

    const ordersRef =
      ref(
        database,
        "orders"
      );


    const snapshot =
      await get(ordersRef);


    if (!snapshot.exists()) {

      renderEmptyOrders();

      updateOrderCount(0);

      return;

    }


    const data =
      snapshot.val();


    const orders =
      flattenOrders(
        data
      );


    updateOrderCount(
      orders.length
    );


    if (!orders.length) {

      renderEmptyOrders();

      return;

    }


    container.innerHTML =
      orders
        .slice(0, 20)
        .map(
          order =>
            createOrderCard(
              order
            )
        )
        .join("");


  } catch (error) {

    console.error(
      "Load orders error:",
      error
    );


    container.innerHTML = `

      <div class="empty-state">

        <div>
          ⚠️
        </div>

        <h3>
          Unable to load orders
        </h3>

        <p>
          Check your Firebase database rules.
        </p>

      </div>

    `;


    updateOrderCount(0);

  }

}


/* =====================================================
   FLATTEN ORDERS
===================================================== */

function flattenOrders(
  data
) {

  const result = [];


  if (
    !data ||
    typeof data !== "object"
  ) {

    return result;

  }


  /*
    Existing customer orders are stored:

    orders/
      userUid/
        orderNumber/
          ...

  */


  Object.entries(data)
    .forEach(
      ([userId, userOrders]) => {

        if (
          !userOrders ||
          typeof userOrders !==
            "object"
        ) {

          return;

        }


        Object.entries(userOrders)
          .forEach(
            ([orderId, order]) => {

              if (!order)
                return;


              result.push({

                ...order,

                _userId:
                  userId,

                _orderId:
                  orderId

              });

            }
          );

      }
    );


  result.sort(
    (a, b) =>
      String(
        b.createdAt || ""
      ).localeCompare(
        String(
          a.createdAt || ""
        )
      )
  );


  return result;

}


/* =====================================================
   CREATE ORDER CARD
===================================================== */

function createOrderCard(
  order
) {

  const customerName =
    order.customer?.name ||
    "Customer";


  const total =
    Number(
      order.total || 0
    );


  const status =
    order.status ||
    "pending";


  return `

    <div class="order-card">

      <div>

        <strong>
          #${escapeHtml(
            order.orderNumber ||
            order._orderId
          )}
        </strong>

        <p>
          ${escapeHtml(customerName)}
        </p>

      </div>


      <div>

        <strong>
          ₱${total.toLocaleString()}
        </strong>

        <p>
          ${escapeHtml(status)}
        </p>

      </div>

    </div>

  `;

}


/* =====================================================
   EMPTY ORDERS
===================================================== */

function renderEmptyOrders() {

  const container =
    $("ordersContainer");


  if (!container)
    return;


  container.innerHTML = `

    <div class="empty-state">

      <div>
        📦
      </div>

      <h3>
        No orders yet
      </h3>

      <p>
        Customer orders will appear here.
      </p>

    </div>

  `;

}


/* =====================================================
   UPDATE ORDER COUNT
===================================================== */

function updateOrderCount(
  count
) {

  const element =
    $("orderCount");


  if (element) {

    element.textContent =
      count;

  }

}


/* =====================================================
   LOAD USERS
===================================================== */

async function loadUsers() {

  const container =
    $("usersContainer");


  if (!container)
    return;


  try {

    const usersRef =
      ref(
        database,
        "users"
      );


    const snapshot =
      await get(usersRef);


    if (!snapshot.exists()) {

      renderEmptyUsers();

      updateUserCount(0);

      return;

    }


    const data =
      snapshot.val();


    const users =
      Object.entries(data)
        .map(
          ([uid, value]) => {

            const profile =
              value?.profile ||
              value;


            return {

              uid,

              name:
                profile?.name ||
                "Customer",

              email:
                profile?.email ||
                "",

              provider:
                profile?.provider ||
                "unknown"

            };

          }
        );


    updateUserCount(
      users.length
    );


    if (!users.length) {

      renderEmptyUsers();

      return;

    }


    container.innerHTML = `

      <div class="users-list">

        ${users
          .map(
            user => `

              <div class="user-row">

                <div>

                  <strong>
                    ${escapeHtml(user.name)}
                  </strong>

                  <span>
                    ${escapeHtml(user.email)}
                  </span>

                </div>

                <small>
                  ${escapeHtml(user.provider)}
                </small>

              </div>

            `
          )
          .join("")}

      </div>

    `;


  } catch (error) {

    console.error(
      "Load users error:",
      error
    );


    renderEmptyUsers();

    updateUserCount(0);

  }

}


/* =====================================================
   EMPTY USERS
===================================================== */

function renderEmptyUsers() {

  const container =
    $("usersContainer");


  if (!container)
    return;


  container.innerHTML = `

    <div class="empty-state">

      <div>
        👥
      </div>

      <h3>
        No users yet
      </h3>

      <p>
        Registered customers will appear here.
      </p>

    </div>

  `;

}


/* =====================================================
   UPDATE USER COUNT
===================================================== */

function updateUserCount(
  count
) {

  const element =
    $("userCount");


  if (element) {

    element.textContent =
      count;

  }

}


/* =====================================================
   REVENUE
===================================================== */

function updateRevenueAndOrders() {

  /*
    Revenue will be calculated
    from completed orders later.

    For now, dashboard revenue
    remains based on actual orders.
  */

  loadRevenue();

}


/* =====================================================
   LOAD REVENUE
===================================================== */

async function loadRevenue() {

  const revenueElement =
    $("revenueCount");


  if (!revenueElement)
    return;


  try {

    const ordersRef =
      ref(
        database,
        "orders"
      );


    const snapshot =
      await get(ordersRef);


    if (!snapshot.exists()) {

      revenueElement.textContent =
        "₱0";

      return;

    }


    const orders =
      flattenOrders(
        snapshot.val()
      );


    const revenue =
      orders
        .filter(
          order =>
            order.status !==
            "cancelled"
        )
        .reduce(
          (sum, order) =>
            sum +
            Number(
              order.total || 0
            ),
          0
        );


    revenueElement.textContent =
      "₱" +
      revenue.toLocaleString();


  } catch (error) {

    console.error(
      "Revenue error:",
      error
    );


    revenueElement.textContent =
      "₱0";

  }

}


/* =====================================================
   GLOBAL ESCAPE
===================================================== */

function escapeHtml(
  value
) {

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
   FIREBASE ERROR MESSAGE
===================================================== */

function getFirebaseDatabaseErrorMessage(
  error
) {

  if (!error)
    return "Something went wrong.";


  switch (error.code) {

    case "PERMISSION_DENIED":
      return "Firebase denied this action. Check your Realtime Database rules.";

    case "NETWORK_ERROR":
      return "Network error. Please check your internet connection.";

    default:
      return (
        error.message ||
        "Unable to save data."
      );

  }

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer = null;


function showToast(
  message,
  type = "success"
) {

  const toast =
    $("adminToast");


  if (!toast)
    return;


  toast.textContent =
    message;


  toast.classList.remove(
    "show",
    "error"
  );


  if (type === "error") {

    toast.classList.add(
      "error"
    );

  }


  void toast.offsetWidth;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.openAddProductModal =
  openAddProductModal;

window.closeProductModal =
  closeProductModal;

window.editProduct =
  editProduct;

window.deleteProduct =
  deleteProduct;


/* =====================================================
   INITIAL LOG
===================================================== */

console.log(
  "🎀 Zola's Closet Admin JS loaded."
);
