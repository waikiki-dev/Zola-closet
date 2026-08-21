/* =====================================================
   ZOLA'S CLOSET
   ADMIN DASHBOARD
   FIREBASE REALTIME DATABASE
   PRODUCTS MANAGEMENT
===================================================== */

import {
  auth,
  database,
  ref,
  get,
  set,
  signOut,
  onAuthStateChanged
} from "../firebase.js";


/* =====================================================
   ADMIN CONFIGURATION
===================================================== */

/*
  IMPORTANT:

  Ilagay dito ang email/account na gagamitin mo
  bilang administrator.

  Example:

  const ADMIN_EMAILS = [
    "waikiki.mod@gmail.com"
  ];

  Maaari kang maglagay ng higit sa isang admin.
*/

const ADMIN_EMAILS = [
  "waikiki.mod@gmail.com"
];


/* =====================================================
   STATE
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

const adminName =
  $("adminName");

const adminEmail =
  $("adminEmail");

const profileAvatar =
  $("profileAvatar");

const settingsEmail =
  $("settingsEmail");

const logoutBtn =
  $("logoutBtn");


/* =====================================================
   SECTIONS
===================================================== */

const sections = {

  dashboard:
    $("dashboardSection"),

  products:
    $("productsSection"),

  orders:
    $("ordersSection"),

  users:
    $("usersSection"),

  settings:
    $("settingsSection")

};


/* =====================================================
   NAVIGATION
===================================================== */

const navItems =
  document.querySelectorAll(
    ".nav-item"
  );


const quickActions =
  document.querySelectorAll(
    ".quick-action"
  );


/* =====================================================
   SHOW SECTION
===================================================== */

function showSection(
  sectionName
) {

  /*
    Hide all sections.
  */

  Object.values(sections)
    .forEach(section => {

      if (section) {

        section.classList.remove(
          "active"
        );

      }

    });


  /*
    Remove active state
    from navigation.
  */

  navItems.forEach(
    item => {

      item.classList.remove(
        "active"
      );

    }
  );


  /*
    Activate requested section.
  */

  const section =
    sections[sectionName];


  if (section) {

    section.classList.add(
      "active"
    );

  }


  /*
    Activate matching nav item.
  */

  navItems.forEach(
    item => {

      if (
        item.dataset.section ===
        sectionName
      ) {

        item.classList.add(
          "active"
        );

      }

    }
  );


  /*
    Update page title.
  */

  const titles = {

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


  if (pageTitle) {

    pageTitle.textContent =
      titles[sectionName] ||
      "Dashboard";

  }


  /*
    Load section data.
  */

  if (
    sectionName ===
    "products"
  ) {

    loadProducts();

  }


  if (
    sectionName ===
    "orders"
  ) {

    loadOrders();

  }


  if (
    sectionName ===
    "users"
  ) {

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
   NAVIGATION EVENTS
===================================================== */

navItems.forEach(
  item => {

    item.addEventListener(
      "click",
      () => {

        const section =
          item.dataset.section;

        showSection(
          section
        );

      }
    );

  }
);


/* =====================================================
   QUICK ACTIONS
===================================================== */

quickActions.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const section =
          button.dataset.section;

        showSection(
          section
        );

      }
    );

  }
);


/* =====================================================
   MOBILE MENU
===================================================== */

if (menuBtn) {

  menuBtn.addEventListener(
    "click",
    () => {

      if (sidebar) {

        sidebar.classList.toggle(
          "open"
        );

      }

    }
  );

}


/* =====================================================
   ADMIN AUTHORIZATION
===================================================== */

function isAuthorizedAdmin(
  user
) {

  if (!user)
    return false;


  const email =
    String(
      user.email || ""
    )
    .toLowerCase()
    .trim();


  return ADMIN_EMAILS
    .map(
      admin =>
        String(admin)
          .toLowerCase()
          .trim()
    )
    .includes(email);

}


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
  auth,
  async user => {

    /*
      No user.
    */

    if (!user) {

      currentAdmin = null;

      redirectToLogin();

      return;

    }


    /*
      Check administrator email.
    */

    if (
      !isAuthorizedAdmin(
        user
      )
    ) {

      console.warn(
        "Unauthorized admin access:",
        user.email
      );


      showToast(
        "You are not authorized to access the admin dashboard.",
        "error"
      );


      await signOut(
        auth
      );


      redirectToLogin();

      return;

    }


    /*
      Authorized.
    */

    currentAdmin =
      user;


    updateAdminProfile();

    loadDashboard();

  }
);


/* =====================================================
   REDIRECT TO STORE
===================================================== */

function redirectToLogin() {

  /*
    The customer login exists
    on the main store page.

    Redirect there.
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


  const name =
    currentAdmin.displayName ||
    "Admin";


  const email =
    currentAdmin.email ||
    "";


  if (adminName) {

    adminName.textContent =
      name;

  }


  if (adminEmail) {

    adminEmail.textContent =
      email;

  }


  if (settingsEmail) {

    settingsEmail.textContent =
      email;

  }


  if (profileAvatar) {

    profileAvatar.textContent =
      name
        .charAt(0)
        .toUpperCase();

  }

}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(
          auth
        );


        showToast(
          "Signed out successfully."
        );


      } catch (error) {

        console.error(
          "Logout error:",
          error
        );


        showToast(
          "Unable to sign out.",
          "error"
        );

      }

    }
  );

}


/* =====================================================
   LOAD DASHBOARD
===================================================== */

async function loadDashboard() {

  await loadProducts(
    false
  );

  await loadOrderStats();

  await loadUserStats();

}


/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts(
  showLoading = true
) {

  const tableBody =
    $("productsTableBody");


  if (
    showLoading &&
    tableBody
  ) {

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
      await get(
        productsRef
      );


    if (!snapshot.exists()) {

      products = [];

    } else {

      const data =
        snapshot.val();


      if (
        typeof data ===
        "object"
      ) {

        products =
          Object.entries(
            data
          )
          .map(
            ([id, product]) => {

              return normalizeAdminProduct(
                product,
                id
              );

            }
          )
          .filter(Boolean);

      } else {

        products = [];

      }

    }


    console.log(
      `🛍️ Admin: ${products.length} products loaded.`
    );


    renderProductsTable();

    updateProductCount();


  } catch (error) {

    console.error(
      "Load products error:",
      error
    );


    products = [];


    if (tableBody) {

      tableBody.innerHTML = `

        <tr>

          <td
            colspan="6"
            class="empty-table"
          >

            ⚠️ Unable to load products.

            <br>

            <small>
              Check your Firebase Realtime Database rules.
            </small>

          </td>

        </tr>

      `;

    }

  }

}


/* =====================================================
   NORMALIZE ADMIN PRODUCT
===================================================== */

function normalizeAdminProduct(
  product,
  id
) {

  if (!product)
    return null;


  const price =
    Number(
      product.price || 0
    );


  const oldPrice =
    Number(
      product.oldPrice ||
      product.originalPrice ||
      price
    );


  const calculatedDiscount =
    oldPrice > price
      ? Math.round(
          (
            (oldPrice - price) /
            oldPrice
          ) * 100
        )
      : 0;


  return {

    id,

    name:
      String(
        product.name ||
        "Unnamed Product"
      ),

    category:
      String(
        product.category ||
        ""
      ).toLowerCase(),

    price,

    oldPrice,

    stock:
      Number(
        product.stock ?? 0
      ),

    size:
      Array.isArray(
        product.sizes
      )
        ? product.sizes.join(", ")
        : String(
            product.size ||
            ""
          ),

    sizes:
      Array.isArray(
        product.sizes
      )
        ? product.sizes
        : String(
            product.size ||
            ""
          )
          .split(",")
          .map(
            size =>
              size.trim()
          )
          .filter(Boolean),

    image:
      String(
        product.image ||
        product.imageUrl ||
        ""
      ),

    description:
      String(
        product.description ||
        ""
      ),

    badge:
      String(
        product.badge ||
        ""
      ),

    discount:
      Number(
        product.discount ??
        calculatedDiscount
      ),

    rating:
      Number(
        product.rating ||
        5
      ),

    featured:
      product.featured === true,

    color:
      String(
        product.color ||
        ""
      ),

    createdAt:
      product.createdAt ||
      "",

    updatedAt:
      product.updatedAt ||
      ""

  };

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

          <div
            style="
              font-size:32px;
              margin-bottom:8px;
            "
          >
            🛍️
          </div>

          ${
            products.length
              ? "No products match your search."
              : "No products added yet."
          }

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
   PRODUCT TABLE ROW
===================================================== */

function createProductRow(
  product
) {

  const stock =
    Number(
      product.stock || 0
    );


  let statusClass =
    "status-online";


  let statusText =
    "In Stock";


  if (stock <= 0) {

    statusClass =
      "status-offline";

    statusText =
      "Out of Stock";

  } else if (
    stock <= 5
  ) {

    statusClass =
      "status-warning";

    statusText =
      "Low Stock";

  }


  return `

    <tr>

      <td>

        <div
          class="admin-product"
          style="
            display:flex;
            align-items:center;
            gap:12px;
          "
        >

          <div
            style="
              width:52px;
              height:52px;
              border-radius:12px;
              overflow:hidden;
              background:var(--soft,#f5f5f5);
              display:flex;
              align-items:center;
              justify-content:center;
              flex-shrink:0;
            "
          >

            ${
              product.image
                ? `
                  <img
                    src="${escapeHtml(product.image)}"
                    alt="${escapeHtml(product.name)}"
                    style="
                      width:100%;
                      height:100%;
                      object-fit:cover;
                    "
                    onerror="this.style.display='none'"
                  >
                `
                : "🎀"
            }

          </div>


          <div>

            <strong>
              ${escapeHtml(product.name)}
            </strong>

            ${
              product.featured
                ? `
                  <small
                    style="
                      display:block;
                      margin-top:3px;
                      opacity:.7;
                    "
                  >
                    ⭐ Featured
                  </small>
                `
                : ""
            }

          </div>

        </div>

      </td>


      <td>

        ${escapeHtml(
          capitalize(product.category)
        )}

      </td>


      <td>

        <strong>
          ₱${product.price.toLocaleString()}
        </strong>

      </td>


      <td>

        ${stock}

      </td>


      <td>

        <strong
          class="${statusClass}"
        >

          ● ${statusText}

        </strong>

      </td>


      <td>

        <div
          class="table-actions"
          style="
            display:flex;
            gap:6px;
            flex-wrap:wrap;
          "
        >

          <button
            class="secondary-button"
            type="button"
            onclick="editProduct('${escapeJs(product.id)}')"
          >
            Edit
          </button>


          <button
            class="secondary-button"
            type="button"
            onclick="deleteProduct('${escapeJs(product.id)}')"
          >
            Delete
          </button>

        </div>

      </td>

    </tr>

  `;

}


/* =====================================================
   PRODUCT COUNT
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
   SEARCH
===================================================== */

const productSearch =
  $("productSearch");


if (productSearch) {

  productSearch.addEventListener(
    "input",
    renderProductsTable
  );

}


/* =====================================================
   CATEGORY FILTER
===================================================== */

const productCategoryFilter =
  $("productCategoryFilter");


if (productCategoryFilter) {

  productCategoryFilter.addEventListener(
    "change",
    renderProductsTable
  );

}


/* =====================================================
   PRODUCT MODAL ELEMENTS
===================================================== */

const productModal =
  $("productModal");

const productForm =
  $("productForm");

const productModalTitle =
  $("productModalTitle");

const productFormMessage =
  $("productFormMessage");


/* =====================================================
   OPEN ADD PRODUCT MODAL
===================================================== */

function openAddProductModal() {

  editingProductId =
    null;


  if (productModalTitle) {

    productModalTitle.textContent =
      "Add Product";

  }


  if (productForm) {

    productForm.reset();

  }


  const productId =
    $("productId");


  if (productId) {

    productId.value = "";

  }


  const discount =
    $("productDiscount");


  if (discount) {

    discount.value =
      "0";

  }


  clearFormMessage();


  openProductModal();

}


/* =====================================================
   OPEN PRODUCT MODAL
===================================================== */

function openProductModal() {

  if (productModal) {

    productModal.classList.add(
      "show"
    );

  }

}


/* =====================================================
   CLOSE PRODUCT MODAL
===================================================== */

function closeProductModal() {

  if (productModal) {

    productModal.classList.remove(
      "show"
    );

  }


  editingProductId =
    null;


  clearFormMessage();

}


/* =====================================================
   ADD PRODUCT BUTTON
===================================================== */

const addProductBtn =
  $("addProductBtn");


if (addProductBtn) {

  addProductBtn.addEventListener(
    "click",
    openAddProductModal
  );

}


/* =====================================================
   CLOSE PRODUCT MODAL BUTTON
===================================================== */

const closeProductModalBtn =
  $("closeProductModal");


if (closeProductModalBtn) {

  closeProductModalBtn.addEventListener(
    "click",
    closeProductModal
  );

}


/* =====================================================
   CANCEL PRODUCT
===================================================== */

const cancelProductBtn =
  $("cancelProductBtn");


if (cancelProductBtn) {

  cancelProductBtn.addEventListener(
    "click",
    closeProductModal
  );

}


/* =====================================================
   MODAL OVERLAY
===================================================== */

if (productModal) {

  productModal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        productModal
      ) {

        closeProductModal();

      }

    }
  );

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(
  id
) {

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!product) {

    showToast(
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


  setValue(
    "productId",
    product.id
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
    product.size
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


  clearFormMessage();


  openProductModal();

}


/* =====================================================
   PRODUCT FORM SUBMIT
===================================================== */

if (productForm) {

  productForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      await saveProduct();

    }
  );

}


/* =====================================================
   SAVE PRODUCT
===================================================== */

async function saveProduct() {

  if (!currentAdmin) {

    showToast(
      "You must be signed in as an admin.",
      "error"
    );

    return;

  }


  const name =
    getValue(
      "productName"
    );


  const price =
    Number(
      getValue(
        "productPrice"
      )
    );


  const stock =
    Number(
      getValue(
        "productStock"
      )
    );


  const category =
    getValue(
      "productCategory"
    )
    .toLowerCase();


  const size =
    getValue(
      "productSize"
    );


  const image =
    getValue(
      "productImage"
    );


  const description =
    getValue(
      "productDescription"
    );


  const badge =
    getValue(
      "productBadge"
    );


  const discount =
    Number(
      getValue(
        "productDiscount"
      ) || 0
    );


  /*
    Validation.
  */

  if (!name) {

    setFormMessage(
      "Please enter a product name.",
      "error"
    );

    return;

  }


  if (
    !Number.isFinite(price) ||
    price < 0
  ) {

    setFormMessage(
      "Please enter a valid price.",
      "error"
    );

    return;

  }


  if (
    !Number.isFinite(stock) ||
    stock < 0
  ) {

    setFormMessage(
      "Please enter a valid stock quantity.",
      "error"
    );

    return;

  }


  if (!category) {

    setFormMessage(
      "Please select a category.",
      "error"
    );

    return;

  }


  if (!image) {

    setFormMessage(
      "Please enter an image URL.",
      "error"
    );

    return;

  }


  if (
    discount < 0 ||
    discount > 100
  ) {

    setFormMessage(
      "Discount must be between 0 and 100.",
      "error"
    );

    return;

  }


  /*
    Generate Firebase product ID.

    We use timestamp + random string
    so we don't need to add push()
    to firebase.js yet.
  */

  const productId =
    editingProductId ||
    generateProductId();


  const existingProduct =
    products.find(
      product =>
        String(product.id) ===
        String(editingProductId)
    );


  /*
    Calculate old price.

    If editing an existing product,
    preserve its oldPrice.

    Otherwise, use current price
    unless discount is supplied.
  */

  let oldPrice =
    existingProduct
      ? Number(
          existingProduct.oldPrice ||
          price
        )
      : price;


  /*
    If discount exists,
    calculate original price.
  */

  if (
    discount > 0 &&
    price > 0
  ) {

    oldPrice =
      Math.round(
        price /
        (1 - discount / 100)
      );

  }


  /*
    Convert comma-separated sizes
    into array.
  */

  const sizes =
    size
      .split(",")
      .map(
        value =>
          value.trim()
      )
      .filter(Boolean);


  const productData = {

    id:
      productId,

    name,

    category,

    price,

    oldPrice,

    stock,

    sizes,

    image,

    description,

    badge,

    discount,

    rating:
      existingProduct
        ? existingProduct.rating
        : 5,

    featured:
      existingProduct
        ? existingProduct.featured
        : false,

    color:
      existingProduct
        ? existingProduct.color || ""
        : "",

    createdAt:
      existingProduct
        ? existingProduct.createdAt
        : new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),

    createdBy:
      existingProduct
        ? existingProduct.createdBy
        : currentAdmin.uid

  };


  try {

    setProductFormLoading(
      true
    );


    const productRef =
      ref(
        database,
        `products/${productId}`
      );


    await set(
      productRef,
      productData
    );


    /*
      Update local array.
    */

    if (editingProductId) {

      const index =
        products.findIndex(
          product =>
            String(product.id) ===
            String(productId)
        );


      if (index !== -1) {

        products[index] =
          normalizeAdminProduct(
            productData,
            productId
          );

      }

    } else {

      products.unshift(
        normalizeAdminProduct(
          productData,
          productId
        )
      );

    }


    renderProductsTable();

    updateProductCount();


    closeProductModal();


    showToast(
      editingProductId
        ? "Product updated successfully! ✨"
        : "Product added successfully! 🎀"
    );


    editingProductId =
      null;


  } catch (error) {

    console.error(
      "Save product error:",
      error
    );


    setFormMessage(
      getFirebaseErrorMessage(
        error
      ),
      "error"
    );


  } finally {

    setProductFormLoading(
      false
    );

  }

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

async function deleteProduct(
  id
) {

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(id)
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
        `products/${id}`
      );


    /*
      Firebase Realtime Database:

      set(ref, null)

      removes the node.
    */

    await set(
      productRef,
      null
    );


    products =
      products.filter(
        item =>
          String(item.id) !==
          String(id)
      );


    renderProductsTable();

    updateProductCount();


    showToast(
      "Product deleted successfully."
    );


  } catch (error) {

    console.error(
      "Delete product error:",
      error
    );


    showToast(
      getFirebaseErrorMessage(
        error
      ),
      "error"
    );

  }

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
      await get(
        ordersRef
      );


    if (!snapshot.exists()) {

      renderEmptyOrders();

      updateOrderCount(
        0
      );

      return;

    }


    const data =
      snapshot.val();


    let orders = [];


    /*
      Structure:

      orders
        uid
          orderId
            ...
    */

    Object.entries(
      data
    )
    .forEach(
      ([uid, userOrders]) => {

        if (
          !userOrders ||
          typeof userOrders !==
            "object"
        )
          return;


        Object.entries(
          userOrders
        )
        .forEach(
          ([orderId, order]) => {

            if (!order)
              return;


            orders.push({

              ...order,

              orderId,

              uid

            });

          }
        );

      }
    );


    updateOrderCount(
      orders.length
    );


    if (!orders.length) {

      renderEmptyOrders();

      return;

    }


    /*
      Newest first.
    */

    orders.sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ) -
        new Date(
          a.createdAt || 0
        )
    );


    container.innerHTML =
      orders
        .map(
          order =>
            createOrderCard(
              order
            )
        )
        .join("");


    /*
      Calculate revenue.
    */

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


    updateRevenue(
      revenue
    );


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

  }

}


/* =====================================================
   ORDER CARD
===================================================== */

function createOrderCard(
  order
) {

  const customer =
    order.customer || {};


  const status =
    String(
      order.status ||
      "pending"
    );


  return `

    <div
      class="order-card"
      style="
        border:1px solid var(--border,#eee);
        border-radius:16px;
        padding:18px;
        margin-bottom:12px;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          gap:15px;
          flex-wrap:wrap;
        "
      >

        <div>

          <strong>
            #${escapeHtml(
              order.orderNumber ||
              order.orderId
            )}
          </strong>

          <p
            style="
              margin:5px 0 0;
              opacity:.7;
            "
          >
            ${escapeHtml(
              customer.name ||
              "Customer"
            )}
          </p>

        </div>


        <div>

          <strong>
            ₱${Number(
              order.total || 0
            ).toLocaleString()}
          </strong>

          <div
            style="
              margin-top:5px;
              font-size:13px;
            "
          >
            ${escapeHtml(
              status
            )}
          </div>

        </div>

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
      await get(
        usersRef
      );


    if (!snapshot.exists()) {

      renderEmptyUsers();

      updateUserCount(
        0
      );

      return;

    }


    const data =
      snapshot.val();


    const users = [];


    Object.entries(
      data
    )
    .forEach(
      ([uid, userData]) => {

        const profile =
          userData?.profile;


        if (!profile)
          return;


        users.push({

          uid,

          ...profile

        });

      }
    );


    updateUserCount(
      users.length
    );


    if (!users.length) {

      renderEmptyUsers();

      return;

    }


    container.innerHTML =
      users
        .map(
          user => `

            <div
              class="user-card"
              style="
                display:flex;
                align-items:center;
                gap:14px;
                padding:16px 0;
                border-bottom:1px solid var(--border,#eee);
              "
            >

              <div
                style="
                  width:44px;
                  height:44px;
                  border-radius:50%;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  background:var(--soft,#f5f5f5);
                  font-weight:700;
                "
              >

                ${escapeHtml(
                  String(
                    user.name ||
                    "U"
                  )
                  .charAt(0)
                  .toUpperCase()
                )}

              </div>


              <div>

                <strong>
                  ${escapeHtml(
                    user.name ||
                    "Customer"
                  )}
                </strong>

                <small
                  style="
                    display:block;
                    opacity:.7;
                    margin-top:3px;
                  "
                >
                  ${escapeHtml(
                    user.email ||
                    ""
                  )}
                </small>

              </div>

            </div>

          `
        )
        .join("");


  } catch (error) {

    console.error(
      "Load users error:",
      error
    );


    container.innerHTML = `

      <div class="empty-state">

        <div>
          ⚠️
        </div>

        <h3>
          Unable to load users
        </h3>

        <p>
          Check your Firebase database rules.
        </p>

      </div>

    `;

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
   ORDER STATS
===================================================== */

async function loadOrderStats() {

  try {

    const ordersRef =
      ref(
        database,
        "orders"
      );


    const snapshot =
      await get(
        ordersRef
      );


    if (!snapshot.exists()) {

      updateOrderCount(0);

      updateRevenue(0);

      return;

    }


    const data =
      snapshot.val();


    let count = 0;

    let revenue = 0;


    Object.values(
      data
    )
    .forEach(
      userOrders => {

        if (
          !userOrders ||
          typeof userOrders !==
            "object"
        )
          return;


        Object.values(
          userOrders
        )
        .forEach(
          order => {

            if (!order)
              return;


            count++;


            if (
              order.status !==
              "cancelled"
            ) {

              revenue +=
                Number(
                  order.total || 0
                );

            }

          }
        );

      }
    );


    updateOrderCount(
      count
    );


    updateRevenue(
      revenue
    );


  } catch (error) {

    console.warn(
      "Unable to load order stats:",
      error
    );

  }

}


/* =====================================================
   USER STATS
===================================================== */

async function loadUserStats() {

  try {

    const usersRef =
      ref(
        database,
        "users"
      );


    const snapshot =
      await get(
        usersRef
      );


    if (!snapshot.exists()) {

      updateUserCount(0);

      return;

    }


    const data =
      snapshot.val();


    const count =
      Object.keys(
        data
      ).length;


    updateUserCount(
      count
    );


  } catch (error) {

    console.warn(
      "Unable to load user stats:",
      error
    );

  }

}


/* =====================================================
   STAT HELPERS
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


function updateRevenue(
  amount
) {

  const element =
    $("revenueCount");


  if (element) {

    element.textContent =
      "₱" +
      Number(
        amount || 0
      ).toLocaleString();

  }

}


/* =====================================================
   FORM HELPERS
===================================================== */

function getValue(
  id
) {

  const element =
    $(id);


  return element
    ? String(
        element.value || ""
      ).trim()
    : "";

}


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


function setFormMessage(
  message,
  type = "error"
) {

  if (!productFormMessage)
    return;


  productFormMessage.textContent =
    message;


  productFormMessage.className =
    "form-message " +
    type;

}


function clearFormMessage() {

  if (!productFormMessage)
    return;


  productFormMessage.textContent =
    "";

  productFormMessage.className =
    "form-message";

}


/* =====================================================
   PRODUCT FORM LOADING
===================================================== */

function setProductFormLoading(
  loading
) {

  if (!productForm)
    return;


  const submitButton =
    productForm.querySelector(
      "button[type='submit']"
    );


  if (!submitButton)
    return;


  if (loading) {

    submitButton.disabled =
      true;


    if (
      !submitButton.dataset
        .originalText
    ) {

      submitButton.dataset
        .originalText =
          submitButton.textContent;

    }


    submitButton.textContent =
      editingProductId
        ? "Updating..."
        : "Saving...";

  } else {

    submitButton.disabled =
      false;


    submitButton.textContent =
      submitButton.dataset
        .originalText ||
      "Save Product";

  }

}


/* =====================================================
   GENERATE PRODUCT ID
===================================================== */

function generateProductId() {

  return (
    "product_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .substring(2, 8)
  );

}


/* =====================================================
   CAPITALIZE
===================================================== */

function capitalize(
  value
) {

  const text =
    String(
      value || ""
    );


  if (!text)
    return "";


  return (
    text
      .charAt(0)
      .toUpperCase() +
    text.slice(1)
  );

}


/* =====================================================
   ESCAPE HTML
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
   ESCAPE JS
===================================================== */

function escapeJs(
  value
) {

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
   FIREBASE ERROR MESSAGE
===================================================== */

function getFirebaseErrorMessage(
  error
) {

  if (!error)
    return "Something went wrong.";


  switch (
    error.code
  ) {

    case "PERMISSION_DENIED":
      return "Firebase permission denied. Check your Realtime Database rules.";

    case "permission-denied":
      return "Firebase permission denied. Check your Realtime Database rules.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "auth/user-not-found":
      return "Admin account was not found.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    default:

      return (
        error.message ||
        "Something went wrong."
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


  if (
    type ===
    "error"
  ) {

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
          "show",
          "error"
        );

      },
      3000
    );

}


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Escape"
    ) {

      closeProductModal();

    }

  }
);


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.editProduct =
  editProduct;

window.deleteProduct =
  deleteProduct;

window.openAddProductModal =
  openAddProductModal;

window.closeProductModal =
  closeProductModal;


/* =====================================================
   INITIALIZE
===================================================== */

console.log(
  "🎀 Zola's Closet Admin Dashboard initialized."
);

console.log(
  "🔥 Firebase Admin Database ready."
);
