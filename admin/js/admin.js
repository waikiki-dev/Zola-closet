/* =====================================================
   ZOLA'S CLOSET
   ADMIN DASHBOARD
   ADMIN.JS
===================================================== */
console.log("🔥🔥🔥 NEW ADMIN.JS VERSION LOADED 🔥🔥🔥");

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

  const toast =
    document.getElementById("adminToast");


  /* ===================================================
     STATE
  =================================================== */

  let products = [];

  let editingProductId = null;


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

      dashboard: "Dashboard",
      products: "Products",
      orders: "Orders",
      users: "Users",
      settings: "Settings"

    };


    if (pageTitle) {

      pageTitle.textContent =
        titles[sectionName] ||
        "Dashboard";

    }


    if (sidebar) {

      sidebar.classList.remove("open");

    }

  }


  navItems.forEach(item => {

    item.addEventListener(
      "click",
      () => {

        showSection(
          item.dataset.section
        );

      }
    );

  });


  quickActions.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        showSection(
          button.dataset.section
        );

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

  function showToast(
    message,
    duration = 3000
  ) {

    if (!toast) return;


    toast.textContent =
      message;


    toast.classList.add("show");


    setTimeout(
      () => {

        toast.classList.remove("show");

      },
      duration
    );

  }


  /* ===================================================
     PRODUCT MODAL
  =================================================== */

  function openProductModal(product = null) {

    if (!productModal) return;


    if (productFormMessage) {

      productFormMessage.textContent =
        "";

      productFormMessage.className =
        "form-message";

    }


    if (product) {

      editingProductId =
        product.id;


      if (productModalTitle) {

        productModalTitle.textContent =
          "Edit Product";

      }


      document.getElementById(
        "productId"
      ).value =
        product.id;


      document.getElementById(
        "productName"
      ).value =
        product.name || "";


      document.getElementById(
        "productPrice"
      ).value =
        product.price ?? "";


      document.getElementById(
        "productStock"
      ).value =
        product.stock ?? "";


      document.getElementById(
        "productCategory"
      ).value =
        product.category || "";


      document.getElementById(
        "productSize"
      ).value =
        product.size || "";


      document.getElementById(
        "productImage"
      ).value =
        product.image || "";


      document.getElementById(
        "productDescription"
      ).value =
        product.description || "";


      document.getElementById(
        "productBadge"
      ).value =
        product.badge || "";


      document.getElementById(
        "productDiscount"
      ).value =
        product.discount ?? 0;

    } else {

      editingProductId =
        null;


      if (productModalTitle) {

        productModalTitle.textContent =
          "Add Product";

      }


      productForm.reset();


      document.getElementById(
        "productDiscount"
      ).value =
        0;


      document.getElementById(
        "productId"
      ).value =
        "";

    }


    productModal.classList.add(
      "active"
    );


    document.body.style.overflow =
      "hidden";

  }


  function closeProductModalHandler() {

    if (!productModal) return;


    productModal.classList.remove(
      "active"
    );


    document.body.style.overflow =
      "";


    editingProductId =
      null;

  }


  /* ===================================================
     ADD PRODUCT
  =================================================== */

  if (addProductBtn) {

    addProductBtn.addEventListener(
      "click",
      () => {

        openProductModal();

      }
    );

  }


  /* ===================================================
     CLOSE PRODUCT MODAL
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
          event.target === productModal
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


      /* ===============================================
         UPDATE DASHBOARD
      =============================================== */

      updateDashboardStats();

    }
  );


  /* ===================================================
     LOAD PRODUCTS
  =================================================== */

  async function loadProducts() {

    if (!productsTableBody) return;


    productsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-table">
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
        await get(productsRef);


      products = [];


      if (snapshot.exists()) {

        const data =
          snapshot.val();


        Object.entries(data).forEach(
          ([id, product]) => {

            products.push({

              id,

              ...product

            });

          }
        );

      }


      renderProducts();


      console.log(
        `🛍️ ${products.length} products loaded`
      );


      /*
        IMPORTANT:

        Dashboard product count uses
        this already-loaded array.

        We do NOT make another Firebase
        request here.
      */

      updateDashboardStats();


    } catch (error) {

      console.error(
        "❌ Failed to load products:",
        error
      );


      productsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-table">
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

    if (!productsTableBody) return;


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
            product.category === category;


          return (
            matchesSearch &&
            matchesCategory
          );

        }
      );


    if (
      filteredProducts.length === 0
    ) {

      productsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-table">
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


            return `

              <tr>

                <td>

                  <div class="product-table-info">

                    <img
                      src="${escapeHtml(
                        product.image || ""
                      )}"
                      class="product-table-image"
                      alt="${escapeHtml(
                        product.name ||
                        "Product"
                      )}"
                      onerror="
                        this.style.opacity='0.4';
                      "
                    >

                    <div>

                      <div class="product-table-name">
                        ${escapeHtml(
                          product.name ||
                          "Unnamed Product"
                        )}
                      </div>

                    </div>

                  </div>

                </td>


                <td>

                  <span class="product-table-category">
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

                  <span class="product-status">
                    Active
                  </span>

                </td>


                <td>

                  <div class="table-actions">

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
              button.dataset.editProduct;


            const product =
              products.find(
                item =>
                  item.id === id
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
              button.dataset.deleteProduct;


            const product =
              products.find(
                item =>
                  item.id === id
              );


            if (!product) return;


            const confirmed =
              confirm(
                `Delete "${product.name}"?`
              );


            if (!confirmed) return;


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


            } catch (error) {

              console.error(
                "❌ Product delete error:",
                error
              );


              console.error(
                "Firebase code:",
                error?.code
              );


              console.error(
                "Firebase message:",
                error?.message
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
           FORM VALUES
        ============================================= */

        const name =
          document
            .getElementById(
              "productName"
            )
            .value
            .trim();


        const price =
          Number(
            document
              .getElementById(
                "productPrice"
              )
              .value
          );


        const stock =
          Number(
            document
              .getElementById(
                "productStock"
              )
              .value
          );


        const category =
          document
            .getElementById(
              "productCategory"
            )
            .value;


        const size =
          document
            .getElementById(
              "productSize"
            )
            .value
            .trim();


        const image =
          document
            .getElementById(
              "productImage"
            )
            .value
            .trim();


        const description =
          document
            .getElementById(
              "productDescription"
            )
            .value
            .trim();


        const badge =
          document
            .getElementById(
              "productBadge"
            )
            .value
            .trim();


        const discount =
          Number(
            document
              .getElementById(
                "productDiscount"
              )
              .value || 0
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
           OLD PRICE
        ============================================= */

        let oldPrice =
          price;


        if (discount > 0) {

          const calculatedOldPrice =
            price /
            (1 - discount / 100);


          if (
            Number.isFinite(
              calculatedOldPrice
            )
          ) {

            oldPrice =
              Number(
                calculatedOldPrice.toFixed(2)
              );

          }

        }


        /* =============================================
           PRODUCT DATA
        ============================================= */

        const productData = {

          name,
          category,
          price,
          oldPrice,
          discount,
          rating: 0,
          image,
          description,
          featured: false,
          stock,
          size,
          badge,
          updatedAt:
            Date.now()

        };


        console.log(
          "📦 Product data:",
          productData
        );


        /* =============================================
           FIREBASE SAVE
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


            console.log(
              "✅ Product updated:",
              editingProductId
            );


            showToast(
              "Product updated successfully."
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


            console.log(
              "✅ Product created:",
              newProductRef.key
            );


            showToast(
              "Product added successfully."
            );

          }


          /* =========================================
             SUCCESS
          ========================================= */

          if (productFormMessage) {

            productFormMessage.textContent =
              "Product saved successfully.";

            productFormMessage.className =
              "form-message success";

          }


          /* =========================================
             REFRESH PRODUCTS ONLY
          ========================================= */

          await loadProducts();


          setTimeout(
            () => {

              closeProductModalHandler();

            },
            500
          );


        } catch (error) {

          console.error(
            "================================"
          );

          console.error(
            "❌ PRODUCT SAVE FAILED"
          );

          console.error(
            "================================"
          );

          console.error(
            "ERROR OBJECT:",
            error
          );

          console.error(
            "ERROR CODE:",
            error?.code
          );

          console.error(
            "ERROR MESSAGE:",
            error?.message
          );


          let errorMessage =
            "Failed to save product.";


          if (
            error?.code ===
            "PERMISSION_DENIED"
          ) {

            errorMessage =
              "Firebase permission denied. Check your Realtime Database Rules.";

          } else if (
            error?.message
          ) {

            errorMessage =
              `Firebase Error: ${error.message}`;

          }


          showFormError(
            errorMessage
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
     
     IMPORTANT:
     
     We ONLY use the already loaded
     products array here.
     
     We DO NOT call:
       /orders
       /users
     
     because your current Firebase
     Rules do not allow global access
     to those paths.
  =================================================== */

  function updateDashboardStats() {

    try {

      /* =============================================
         PRODUCTS
      ============================================= */

      const totalProducts =
        products.length;


      const productCount =
        document.getElementById(
          "productCount"
        );


      if (productCount) {

        productCount.textContent =
          totalProducts;

      }


      /* =============================================
         ORDERS
         
         TEMPORARY
         
         Orders system will be implemented
         with proper admin permissions later.
      ============================================= */

      const orderCount =
        document.getElementById(
          "orderCount"
        );


      const revenueCount =
        document.getElementById(
          "revenueCount"
        );


      if (orderCount) {

        orderCount.textContent =
          "0";

      }


      if (revenueCount) {

        revenueCount.textContent =
          "₱0.00";

      }


      /* =============================================
         USERS
         
         TEMPORARY
         
         User count requires a separate
         admin-only database structure.
      ============================================= */

      const userCount =
        document.getElementById(
          "userCount"
        );


      if (userCount) {

        userCount.textContent =
          "0";

      }


      console.log(
        "📊 Dashboard stats updated successfully.",
        {
          products: totalProducts,
          orders: 0,
          users: 0,
          revenue: 0
        }
      );


    } catch (error) {

      /*
        This function does NOT perform
        Firebase reads, so a Permission
        Denied error should no longer
        happen here.
      */

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


        if (!confirmed) return;


        try {

          await signOut(auth);


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

    if (!productFormMessage) return;


    productFormMessage.textContent =
      message;


    productFormMessage.className =
      "form-message error";

  }


  /* ===================================================
     PRICE FORMAT
  =================================================== */

  function formatPrice(
    value
  ) {

    const number =
      Number(value || 0);


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
     INITIAL SECTION
  =================================================== */

  showSection(
    "dashboard"
  );


  console.log(
    "✅ Admin dashboard event listeners ready."
  );

});
console.log("🔥🔥🔥 NEW ADMIN.JS END 🔥🔥🔥");
