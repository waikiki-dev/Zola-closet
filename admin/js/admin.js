/* =====================================================
   ZOLA'S CLOSET
   ADMIN DASHBOARD
   ADMIN.JS
   FIREBASE PRODUCT MANAGEMENT
===================================================== */

import {
  auth,
  database,
  onAuthStateChanged,
  signOut,
  ref,
  get,
  push,
  set,
  update,
  remove
} from "../../js/firebase.js";


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  console.log("🛍️ Zola's Closet Admin JS loaded");


  /* ===================================================
     ELEMENTS
  =================================================== */

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

  const settingsEmail =
    document.getElementById("settingsEmail");

  const profileAvatar =
    document.getElementById("profileAvatar");

  const productModal =
    document.getElementById("productModal");

  const addProductBtn =
    document.getElementById("addProductBtn");

  const closeProductModal =
    document.getElementById("closeProductModal");

  const cancelProductBtn =
    document.getElementById("cancelProductBtn");

  const productForm =
    document.getElementById("productForm");

  const productModalTitle =
    document.getElementById("productModalTitle");

  const productFormMessage =
    document.getElementById("productFormMessage");

  const productsTableBody =
    document.getElementById("productsTableBody");

  const productSearch =
    document.getElementById("productSearch");

  const productCategoryFilter =
    document.getElementById("productCategoryFilter");


  /* ===================================================
     STATE
  =================================================== */

  let products = [];

  let editingProductId = null;


  /* ===================================================
     HELPER
  =================================================== */

  function getField(id) {
    return document.getElementById(id);
  }


  function getFieldValue(id) {

    const field = getField(id);

    return field
      ? field.value.trim()
      : "";

  }


  function setFieldValue(id, value) {

    const field = getField(id);

    if (field) {
      field.value =
        value ?? "";
    }

  }


  /* ===================================================
     SIDEBAR NAVIGATION
  =================================================== */

  const navItems =
    document.querySelectorAll(".nav-item");

  const quickActions =
    document.querySelectorAll(".quick-action");


  function showSection(sectionName) {

    const sections =
      document.querySelectorAll(".admin-section");


    sections.forEach(section => {

      section.classList.remove("active");

    });


    const targetSection =
      document.getElementById(
        `${sectionName}Section`
      );


    if (targetSection) {

      targetSection.classList.add("active");

    }


    navItems.forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.section === sectionName
      );

    });


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


    if (sidebar) {

      sidebar.classList.remove(
        "open"
      );

    }

  }


  navItems.forEach(item => {

    item.addEventListener(
      "click",
      () => {

        const section =
          item.dataset.section;

        showSection(section);

      }
    );

  });


  quickActions.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const section =
          button.dataset.section;

        showSection(section);

      }
    );

  });


  /* ===================================================
     MOBILE MENU
  =================================================== */

  if (menuBtn && sidebar) {

    menuBtn.addEventListener(
      "click",
      () => {

        sidebar.classList.toggle(
          "open"
        );

      }
    );

  }


  /* ===================================================
     TOAST
  =================================================== */

  const toast =
    document.getElementById(
      "adminToast"
    );


  let toastTimer = null;


  function showToast(
    message,
    duration = 3000
  ) {

    if (!toast)
      return;


    toast.textContent =
      message;


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
        duration
      );

  }


  /* ===================================================
     PRODUCT MODAL
  =================================================== */

  function openProductModal(
    product = null
  ) {

    if (!productModal)
      return;


    if (productFormMessage) {

      productFormMessage.textContent =
        "";

      productFormMessage.className =
        "form-message";

    }


    /* ================================================
       EDIT
    ================================================ */

    if (product) {

      editingProductId =
        product.id;


      if (productModalTitle) {

        productModalTitle.textContent =
          "Edit Product";

      }


      setFieldValue(
        "productId",
        product.id
      );


      setFieldValue(
        "productName",
        product.name
      );


      setFieldValue(
        "productPrice",
        product.price
      );


      setFieldValue(
        "productStock",
        product.stock
      );


      setFieldValue(
        "productCategory",
        product.category
      );


      /*
        New normalized structure:

        sizes: ["2T", "3T", "4T"]

        But we continue supporting
        the old "size" string.
      */

      let sizeValue = "";


      if (
        Array.isArray(
          product.sizes
        )
      ) {

        sizeValue =
          product.sizes.join(", ");

      } else {

        sizeValue =
          product.size || "";

      }


      setFieldValue(
        "productSize",
        sizeValue
      );


      setFieldValue(
        "productImage",
        product.image
      );


      setFieldValue(
        "productDescription",
        product.description
      );


      setFieldValue(
        "productBadge",
        product.badge
      );


      setFieldValue(
        "productDiscount",
        product.discount ?? 0
      );


    } else {

      /* ================================================
         ADD
      ================================================ */

      editingProductId =
        null;


      if (productModalTitle) {

        productModalTitle.textContent =
          "Add Product";

      }


      if (productForm) {

        productForm.reset();

      }


      setFieldValue(
        "productDiscount",
        0
      );


      setFieldValue(
        "productId",
        ""
      );

    }


    productModal.classList.add(
      "active"
    );


    document.body.style.overflow =
      "hidden";

  }


  function closeProductModalHandler() {

    if (!productModal)
      return;


    productModal.classList.remove(
      "active"
    );


    document.body.style.overflow =
      "";


    editingProductId =
      null;

  }


  /* ===================================================
     ADD PRODUCT BUTTON
  =================================================== */

  if (addProductBtn) {

    addProductBtn.addEventListener(
      "click",
      () => {

        console.log(
          "➕ Add Product clicked"
        );


        openProductModal();

      }
    );

  } else {

    console.error(
      "❌ addProductBtn not found"
    );

  }


  /* ===================================================
     CLOSE MODAL
  =================================================== */

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


  if (productModal) {

    productModal.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          productModal
        ) {

          closeProductModalHandler();

        }

      }
    );

  }


  /* ===================================================
     ESC KEY
  =================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        productModal &&
        productModal.classList.contains(
          "active"
        )
      ) {

        closeProductModalHandler();

      }

    }
  );


  /* ===================================================
     AUTH STATE
  =================================================== */

  onAuthStateChanged(
    auth,
    async user => {

      console.log(
        "🔐 Auth state:",
        user
          ? user.email
          : "No user"
      );


      if (!user) {

        console.warn(
          "⚠️ No authenticated user."
        );


        if (adminName) {

          adminName.textContent =
            "Admin";

        }


        if (adminEmail) {

          adminEmail.textContent =
            "Not signed in";

        }


        if (settingsEmail) {

          settingsEmail.textContent =
            "Not signed in";

        }


        if (profileAvatar) {

          profileAvatar.textContent =
            "A";

        }


        return;

      }


      /* ===============================================
         PROFILE
      =============================================== */

      const email =
        user.email || "";


      const name =
        user.displayName ||
        email.split("@")[0] ||
        "Admin";


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


      /* ===============================================
         LOAD PRODUCTS
      =============================================== */

      await loadProducts();


      await updateDashboardStats();

    }
  );


  /* ===================================================
     NORMALIZE ADMIN PRODUCT
  =================================================== */

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


    const discount =
      Number(
        product.discount || 0
      );


    /*
      Convert old size string
      into the new sizes array.
    */

    let sizes = [];


    if (
      Array.isArray(
        product.sizes
      )
    ) {

      sizes =
        product.sizes;

    } else if (
      typeof product.size ===
      "string" &&
      product.size.trim()
    ) {

      sizes =
        product.size
          .split(",")
          .map(
            size =>
              size.trim()
          )
          .filter(Boolean);

    }


    /*
      Support old imageUrl
      field as well.
    */

    const image =
      String(
        product.image ||
        product.imageUrl ||
        ""
      );


    return {

      id,

      firebaseId:
        id,

      name:
        String(
          product.name ||
          "Unnamed Product"
        ),

      price,

      stock:
        Number(
          product.stock ?? 0
        ),

      category:
        String(
          product.category ||
          "all"
        ).toLowerCase(),

      sizes,

      /*
        Keep old size field for
        backward compatibility.
      */

      size:
        sizes.join(", "),

      image,

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

      discount,

      /*
        Fields expected by
        customer script.js
      */

      oldPrice:
        Number(
          product.oldPrice ||
          product.originalPrice ||
          (
            discount > 0
              ? price /
                (1 - discount / 100)
              : price
          )
        ),

      rating:
        Number(
          product.rating || 5
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
        null,

      updatedAt:
        product.updatedAt ||
        null

    };

  }


  /* ===================================================
     LOAD PRODUCTS
  =================================================== */

  async function loadProducts() {

    if (!productsTableBody)
      return;


    productsTableBody.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="empty-table"
        >
          Loading products...
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
        await get(
          productsRef
        );


      products = [];


      if (snapshot.exists()) {

        const data =
          snapshot.val();


        if (
          data &&
          typeof data ===
            "object"
        ) {

          Object.entries(data)
            .forEach(
              ([id, product]) => {

                const normalized =
                  normalizeAdminProduct(
                    product,
                    id
                  );


                if (normalized) {

                  products.push(
                    normalized
                  );

                }

              }
            );

        }

      }


      renderProducts();


      console.log(
        `🛍️ ${products.length} products loaded`
      );


    } catch (error) {

      console.error(
        "❌ Failed to load products:",
        error
      );


      productsTableBody.innerHTML = `
        <tr>
          <td
            colspan="6"
            class="empty-table"
          >
            Failed to load products.
          </td>
        </tr>
      `;

    }

  }


  /* ===================================================
     RENDER PRODUCTS
  =================================================== */

  function renderProducts() {

    if (!productsTableBody)
      return;


    const search =
      productSearch
        ? productSearch.value
            .trim()
            .toLowerCase()
        : "";


    const category =
      productCategoryFilter
        ? productCategoryFilter.value
        : "all";


    const filteredProducts =
      products.filter(
        product => {

          const matchesSearch =
            !search ||
            String(
              product.name || ""
            )
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


    if (
      !filteredProducts.length
    ) {

      productsTableBody.innerHTML = `
        <tr>
          <td
            colspan="6"
            class="empty-table"
          >
            No products found.
          </td>
        </tr>
      `;

      return;

    }


    productsTableBody.innerHTML =
      filteredProducts
        .map(
          product => {

            const stock =
              Number(
                product.stock || 0
              );


            let stockClass =
              "stock-good";


            if (
              stock === 0
            ) {

              stockClass =
                "stock-out";

            } else if (
              stock <= 5
            ) {

              stockClass =
                "stock-low";

            }


            const image =
              product.image ||
              "";


            return `

              <tr>

                <td>

                  <div
                    class="product-table-info"
                  >

                    ${
                      image
                        ? `
                          <img
                            src="${escapeHtml(image)}"
                            class="product-table-image"
                            alt="${escapeHtml(
                              product.name ||
                              "Product"
                            )}"
                            onerror="
                              this.style.opacity='0.4';
                            "
                          >
                        `
                        : `
                          <div
                            class="product-table-image"
                            style="
                              display:grid;
                              place-items:center;
                              font-size:20px;
                            "
                          >
                            🎀
                          </div>
                        `
                    }


                    <div>

                      <div
                        class="product-table-name"
                      >
                        ${escapeHtml(
                          product.name ||
                          "Unnamed Product"
                        )}
                      </div>

                    </div>

                  </div>

                </td>


                <td>

                  <span
                    class="product-table-category"
                  >
                    ${escapeHtml(
                      product.category ||
                      "-"
                    )}
                  </span>

                </td>


                <td>
                  ₱${formatPrice(
                    product.price
                  )}
                </td>


                <td>

                  <span
                    class="${stockClass}"
                  >
                    ${stock}
                  </span>

                </td>


                <td>

                  <span
                    class="product-status"
                  >
                    ${
                      product.featured
                        ? "Featured"
                        : "Active"
                    }
                  </span>

                </td>


                <td>

                  <div
                    class="table-actions"
                  >

                    <button
                      type="button"
                      class="table-action"
                      data-edit-product="${escapeHtml(
                        product.id
                      )}"
                      title="Edit"
                    >
                      ✏️
                    </button>


                    <button
                      type="button"
                      class="table-action delete"
                      data-delete-product="${escapeHtml(
                        product.id
                      )}"
                      title="Delete"
                    >
                      🗑️
                    </button>

                  </div>

                </td>

              </tr>

            `;

          }
        )
        .join("");


    attachProductActions();

  }


  /* ===================================================
     PRODUCT ACTIONS
  =================================================== */

  function attachProductActions() {

    const editButtons =
      document.querySelectorAll(
        "[data-edit-product]"
      );


    const deleteButtons =
      document.querySelectorAll(
        "[data-delete-product]"
      );


    editButtons.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset
                .editProduct;


            const product =
              products.find(
                item =>
                  String(
                    item.id
                  ) ===
                  String(id)
              );


            if (product) {

              openProductModal(
                product
              );

            }

          }
        );

      }
    );


    deleteButtons.forEach(
      button => {

        button.addEventListener(
          "click",
          async () => {

            const id =
              button.dataset
                .deleteProduct;


            const product =
              products.find(
                item =>
                  String(
                    item.id
                  ) ===
                  String(id)
              );


            if (!product)
              return;


            const confirmed =
              confirm(
                `Delete "${product.name}"?`
              );


            if (!confirmed)
              return;


            try {

              await remove(
                ref(
                  database,
                  `products/${id}`
                )
              );


              showToast(
                "Product deleted successfully."
              );


              await loadProducts();


              await updateDashboardStats();


            } catch (error) {

              console.error(
                "❌ Delete error:",
                error
              );


              showToast(
                "Failed to delete product."
              );

            }

          }
        );

      }
    );

  }


  /* ===================================================
     SAVE PRODUCT
  =================================================== */

  if (productForm) {

    productForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        if (productFormMessage) {

          productFormMessage.textContent =
            "Saving product...";

          productFormMessage.className =
            "form-message";

        }


        /* =============================================
           READ FORM
        ============================================= */

        const name =
          getFieldValue(
            "productName"
          );


        const price =
          Number(
            getField(
              "productPrice"
            )?.value
          );


        const stock =
          Number(
            getField(
              "productStock"
            )?.value
          );


        const category =
          getFieldValue(
            "productCategory"
          );


        const sizeInput =
          getFieldValue(
            "productSize"
          );


        const image =
          getFieldValue(
            "productImage"
          );


        const description =
          getFieldValue(
            "productDescription"
          );


        const badge =
          getFieldValue(
            "productBadge"
          );


        const discount =
          Number(
            getField(
              "productDiscount"
            )?.value || 0
          );


        /* =============================================
           VALIDATION
        ============================================= */

        if (!name) {

          showFormError(
            "Product name is required."
          );

          return;

        }


        if (
          !Number.isFinite(price) ||
          price < 0
        ) {

          showFormError(
            "Please enter a valid price."
          );

          return;

        }


        if (
          !Number.isInteger(stock) ||
          stock < 0
        ) {

          showFormError(
            "Please enter a valid stock quantity."
          );

          return;

        }


        if (!category) {

          showFormError(
            "Please select a category."
          );

          return;

        }


        if (!image) {

          showFormError(
            "Product image URL is required."
          );

          return;

        }


        if (
          !Number.isFinite(discount) ||
          discount < 0 ||
          discount > 100
        ) {

          showFormError(
            "Discount must be between 0 and 100."
          );

          return;

        }


        /* =============================================
           NORMALIZE SIZES
        ============================================= */

        const sizes =
          sizeInput
            ? sizeInput
                .split(",")
                .map(
                  size =>
                    size.trim()
                )
                .filter(Boolean)
            : [];


        /* =============================================
           CALCULATE OLD PRICE
        ============================================= */

        let oldPrice =
          price;


        if (
          discount > 0 &&
          discount < 100
        ) {

          oldPrice =
            Math.round(
              (
                price /
                (
                  1 -
                  discount / 100
                )
              ) *
              100
            ) / 100;

        }


        /* =============================================
           PRESERVE EXISTING PRODUCT DATA
        ============================================= */

        let existingProduct =
          null;


        if (editingProductId) {

          existingProduct =
            products.find(
              product =>
                String(
                  product.id
                ) ===
                String(
                  editingProductId
                )
            ) || null;

        }


        /* =============================================
           PRODUCT DATA
        ============================================= */

        const productData = {

          /*
            Core
          */

          name,

          price,

          oldPrice,

          stock,

          category,

          image,

          description,


          /*
            Sizes
          */

          sizes,

          /*
            Backward compatibility
          */

          size:
            sizes.join(", "),


          /*
            Store display
          */

          badge,

          discount,


          /*
            Existing optional data
          */

          rating:
            existingProduct?.rating ||
            5,

          featured:
            existingProduct?.featured === true,

          color:
            existingProduct?.color ||
            "",


          /*
            Timestamps
          */

          updatedAt:
            Date.now()

        };


        /* =============================================
           SAVE
        ============================================= */

        try {

          if (editingProductId) {

            await update(
              ref(
                database,
                `products/${editingProductId}`
              ),
              productData
            );


            showToast(
              "Product updated successfully. ✨"
            );


          } else {

            const productsRef =
              ref(
                database,
                "products"
              );


            const newProductRef =
              push(
                productsRef
              );


            await set(
              newProductRef,
              {

                ...productData,

                createdAt:
                  Date.now()

              }
            );


            showToast(
              "Product added successfully. 🎀"
            );

          }


          if (productFormMessage) {

            productFormMessage.textContent =
              "Product saved successfully.";

            productFormMessage.className =
              "form-message success";

          }


          await loadProducts();


          await updateDashboardStats();


          setTimeout(
            () => {

              closeProductModalHandler();

            },
            500
          );


        } catch (error) {

          console.error(
            "❌ Product save error:",
            error
          );


          console.error(
            "Firebase error code:",
            error?.code
          );


          console.error(
            "Firebase error message:",
            error?.message
          );


          showFormError(
            getDatabaseErrorMessage(
              error
            )
          );

        }

      }
    );

  }


  /* ===================================================
     SEARCH
  =================================================== */

  if (productSearch) {

    productSearch.addEventListener(
      "input",
      renderProducts
    );

  }


  if (productCategoryFilter) {

    productCategoryFilter.addEventListener(
      "change",
      renderProducts
    );

  }


  /* ===================================================
     DASHBOARD STATS
  =================================================== */

  async function updateDashboardStats() {

    try {

      /* =============================================
         PRODUCTS
      ============================================= */

      const productsSnapshot =
        await get(
          ref(
            database,
            "products"
          )
        );


      let productCountValue =
        0;


      if (
        productsSnapshot.exists()
      ) {

        const data =
          productsSnapshot.val();


        if (
          data &&
          typeof data ===
            "object"
        ) {

          productCountValue =
            Object.keys(
              data
            ).length;

        }

      }


      const productCount =
        document.getElementById(
          "productCount"
        );


      if (productCount) {

        productCount.textContent =
          productCountValue;

      }


      /* =============================================
         ORDERS
      ============================================= */

      const ordersSnapshot =
        await get(
          ref(
            database,
            "orders"
          )
        );


      let orderCountValue =
        0;


      let revenue =
        0;


      if (
        ordersSnapshot.exists()
      ) {

        const orders =
          ordersSnapshot.val();


        /*
          Orders are stored:

          orders/
            userId/
              orderNumber/

        */

        if (
          orders &&
          typeof orders ===
            "object"
        ) {

          Object.values(
            orders
          ).forEach(
            userOrders => {

              if (
                !userOrders ||
                typeof userOrders !==
                  "object"
              )
                return;


              Object.values(
                userOrders
              ).forEach(
                order => {

                  orderCountValue++;


                  revenue +=
                    Number(
                      order?.total ||
                      order?.amount ||
                      0
                    );

                }
              );

            }
          );

        }

      }


      const orderCount =
        document.getElementById(
          "orderCount"
        );


      if (orderCount) {

        orderCount.textContent =
          orderCountValue;

      }


      const revenueCount =
        document.getElementById(
          "revenueCount"
        );


      if (revenueCount) {

        revenueCount.textContent =
          `₱${formatPrice(
            revenue
          )}`;

      }


      /* =============================================
         USERS
      ============================================= */

      const usersSnapshot =
        await get(
          ref(
            database,
            "users"
          )
        );


      let userCountValue =
        0;


      if (
        usersSnapshot.exists()
      ) {

        const users =
          usersSnapshot.val();


        if (
          users &&
          typeof users ===
            "object"
        ) {

          userCountValue =
            Object.keys(
              users
            ).length;

        }

      }


      const userCount =
        document.getElementById(
          "userCount"
        );


      if (userCount) {

        userCount.textContent =
          userCountValue;

      }


    } catch (error) {

      console.error(
        "❌ Dashboard stats error:",
        error
      );

    }

  }


  /* ===================================================
     LOGOUT
  =================================================== */

  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      async () => {

        const confirmed =
          confirm(
            "Sign out from admin dashboard?"
          );


        if (!confirmed)
          return;


        try {

          await signOut(
            auth
          );


          showToast(
            "Signed out successfully."
          );


          setTimeout(
            () => {

              window.location.href =
                "../index.html";

            },
            700
          );


        } catch (error) {

          console.error(
            "❌ Logout error:",
            error
          );


          showToast(
            "Failed to sign out."
          );

        }

      }
    );

  }


  /* ===================================================
     FORM ERROR
  =================================================== */

  function showFormError(
    message
  ) {

    if (!productFormMessage)
      return;


    productFormMessage.textContent =
      message;


    productFormMessage.className =
      "form-message error";

  }


  /* ===================================================
     DATABASE ERROR
  =================================================== */

  function getDatabaseErrorMessage(
    error
  ) {

    if (!error)
      return "Failed to save product.";


    switch (
      error.code
    ) {

      case "PERMISSION_DENIED":

        return (
          "Permission denied. Check your Firebase Database Rules."
        );


      case "PERMISSION_DENIED: Permission denied":

        return (
          "Permission denied. Check your Firebase Database Rules."
        );


      case "NETWORK_ERROR":

        return (
          "Network error. Please check your internet connection."
        );


      default:

        return (
          error.message ||
          "Failed to save product."
        );

    }

  }


  /* ===================================================
     PRICE FORMAT
  =================================================== */

  function formatPrice(
    value
  ) {

    const number =
      Number(
        value || 0
      );


    return number.toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  }


  /* ===================================================
     HTML ESCAPE
  =================================================== */

  function escapeHtml(
    value
  ) {

    return String(
      value ?? ""
    )

      .replaceAll(
        "&",
        "&amp;"
      )

      .replaceAll(
        "<",
        "&lt;"
      )

      .replaceAll(
        ">",
        "&gt;"
      )

      .replaceAll(
        '"',
        "&quot;"
      )

      .replaceAll(
        "'",
        "&#039;"
      );

  }


  /* ===================================================
     INITIAL
  =================================================== */

  showSection(
    "dashboard"
  );


  console.log(
    "✅ Admin dashboard event listeners ready."
  );

});
