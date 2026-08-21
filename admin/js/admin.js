/* =====================================================
   ZOLA'S CLOSET
   ADMIN DASHBOARD
   ADMIN.JS
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

      sidebar.classList.remove("open");

    }

  }


  navItems.forEach(item => {

    item.addEventListener("click", () => {

      const section =
        item.dataset.section;

      showSection(section);

    });

  });


  quickActions.forEach(button => {

    button.addEventListener("click", () => {

      const section =
        button.dataset.section;

      showSection(section);

      /*
        If Quick Action says Add Product,
        automatically open the product modal.
      */

      if (
        section === "products" &&
        button.querySelector("strong")?.textContent
          ?.toLowerCase()
          .includes("add product")
      ) {

        setTimeout(() => {

          openProductModal();

        }, 100);

      }

    });

  });


  /* ===================================================
     MOBILE MENU
  =================================================== */

  if (menuBtn && sidebar) {

    menuBtn.addEventListener("click", () => {

      sidebar.classList.toggle("open");

    });

  }


  /* ===================================================
     TOAST
  =================================================== */

  const toast =
    document.getElementById("adminToast");


  function showToast(
    message,
    duration = 3000
  ) {

    if (!toast) return;


    toast.textContent =
      message;


    toast.classList.add("show");


    setTimeout(() => {

      toast.classList.remove("show");

    }, duration);

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


      const productId =
        document.getElementById("productId");

      const productName =
        document.getElementById("productName");

      const productPrice =
        document.getElementById("productPrice");

      const productStock =
        document.getElementById("productStock");

      const productCategory =
        document.getElementById("productCategory");

      const productSize =
        document.getElementById("productSize");

      const productImage =
        document.getElementById("productImage");

      const productDescription =
        document.getElementById("productDescription");

      const productBadge =
        document.getElementById("productBadge");

      const productDiscount =
        document.getElementById("productDiscount");


      if (productId) {

        productId.value =
          product.id || "";

      }


      if (productName) {

        productName.value =
          product.name || "";

      }


      if (productPrice) {

        productPrice.value =
          product.price ?? "";

      }


      if (productStock) {

        productStock.value =
          product.stock ?? 0;

      }


      if (productCategory) {

        productCategory.value =
          product.category || "";

      }


      if (productSize) {

        productSize.value =
          product.size || "";

      }


      if (productImage) {

        productImage.value =
          product.image || "";

      }


      if (productDescription) {

        productDescription.value =
          product.description || "";

      }


      if (productBadge) {

        productBadge.value =
          product.badge || "";

      }


      if (productDiscount) {

        productDiscount.value =
          product.discount ?? 0;

      }

    } else {

      editingProductId =
        null;


      if (productModalTitle) {

        productModalTitle.textContent =
          "Add Product";

      }


      if (productForm) {

        productForm.reset();

      }


      const productDiscount =
        document.getElementById(
          "productDiscount"
        );


      const productId =
        document.getElementById(
          "productId"
        );


      if (productDiscount) {

        productDiscount.value =
          0;

      }


      if (productId) {

        productId.value =
          "";

      }

    }


    productModal.classList.add("active");

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
         LOAD DATA
      =============================================== */

      await loadProducts();

      await updateDashboardStats();

    }
  );


  /* ===================================================
     LOAD PRODUCTS
  =================================================== */

  async function loadProducts() {

    if (!productsTableBody) return;


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
      products.filter(product => {

        const productName =
          String(
            product.name || ""
          )
            .toLowerCase();


        const productDescription =
          String(
            product.description || ""
          )
            .toLowerCase();


        const matchesSearch =
          !search ||
          productName.includes(search) ||
          productDescription.includes(search);


        const matchesCategory =
          category === "all" ||
          product.category === category;


        return (
          matchesSearch &&
          matchesCategory
        );

      });


    if (
      filteredProducts.length === 0
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
        .map(product => {

          const stock =
            Number(
              product.stock || 0
            );


          let stockClass =
            "stock-good";


          if (stock === 0) {

            stockClass =
              "stock-out";

          } else if (stock <= 5) {

            stockClass =
              "stock-low";

          }


          const image =
            product.image ||
            "";


          const productName =
            product.name ||
            "Unnamed Product";


          return `

            <tr>

              <td>

                <div class="product-table-info">

                  <img
                    src="${escapeHtml(image)}"
                    class="product-table-image"
                    alt="${escapeHtml(productName)}"
                    onerror="
                      this.style.opacity='0.4';
                    "
                  >

                  <div>

                    <div class="product-table-name">

                      ${escapeHtml(
                        productName
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

                <span class="product-status">

                  Active

                </span>

              </td>


              <td>

                <div class="table-actions">

                  <button
                    type="button"
                    class="table-action"
                    data-edit-product="${escapeHtml(product.id)}"
                    title="Edit"
                  >
                    ✏️
                  </button>


                  <button
                    type="button"
                    class="table-action delete"
                    data-delete-product="${escapeHtml(product.id)}"
                    title="Delete"
                  >
                    🗑️
                  </button>

                </div>

              </td>

            </tr>

          `;

        })
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


    editButtons.forEach(button => {

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

    });


    deleteButtons.forEach(button => {

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

    });

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
           FORM ELEMENTS
        ============================================= */

        const productName =
          document.getElementById(
            "productName"
          );


        const productPrice =
          document.getElementById(
            "productPrice"
          );


        const productStock =
          document.getElementById(
            "productStock"
          );


        const productCategory =
          document.getElementById(
            "productCategory"
          );


        const productSize =
          document.getElementById(
            "productSize"
          );


        const productImage =
          document.getElementById(
            "productImage"
          );


        const productDescription =
          document.getElementById(
            "productDescription"
          );


        const productBadge =
          document.getElementById(
            "productBadge"
          );


        const productDiscount =
          document.getElementById(
            "productDiscount"
          );


        /* =============================================
           VALUES
        ============================================= */

        const name =
          productName
            ? productName.value.trim()
            : "";


        const price =
          productPrice
            ? Number(productPrice.value)
            : NaN;


        const stock =
          productStock
            ? Number(productStock.value)
            : NaN;


        const category =
          productCategory
            ? productCategory.value
            : "";


        const size =
          productSize
            ? productSize.value.trim()
            : "";


        const image =
          productImage
            ? productImage.value.trim()
            : "";


        const description =
          productDescription
            ? productDescription.value.trim()
            : "";


        const badge =
          productBadge
            ? productBadge.value.trim()
            : "";


        const discount =
          productDiscount
            ? Number(
                productDiscount.value || 0
              )
            : 0;


        /* =============================================
           VALIDATION
        ============================================= */

        if (!name) {

          showFormError(
            "Product name is required."
          );

          return;

        }


        if (name.length > 150) {

          showFormError(
            "Product name must be 150 characters or less."
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


        const validCategories = [
          "girls",
          "boys",
          "baby",
          "sets"
        ];


        if (
          !validCategories.includes(
            category
          )
        ) {

          showFormError(
            "Invalid product category."
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
          description.length > 1000
        ) {

          showFormError(
            "Description must be 1000 characters or less."
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
           FIREBASE PRODUCT DATA
           
           IMPORTANT:
           Your Firebase Rules require:
           name
           category
           price
           oldPrice
           discount
           rating
           image
           description
           featured
           stock
           
           The oldPrice, rating and featured values
           are automatically supplied here because
           they are not currently fields in index.html.
        ============================================= */

        const existingProduct =
          editingProductId
            ? products.find(
                product =>
                  product.id ===
                  editingProductId
              )
            : null;


        /*
          Preserve oldPrice when editing.

          If the existing product has no oldPrice,
          calculate it from the current price and
          discount if possible.
        */

        let oldPrice =
          Number(
            existingProduct?.oldPrice || 0
          );


        if (
          oldPrice <= 0 &&
          discount > 0
        ) {

          oldPrice =
            price /
            (1 - discount / 100);

        }


        /*
          If there is no discount,
          oldPrice defaults to current price.
        */

        if (
          oldPrice <= 0
        ) {

          oldPrice =
            price;

        }


        /*
          Preserve rating when editing.
          New products start at 0.
        */

        const rating =
          Number(
            existingProduct?.rating || 0
          );


        /*
          Preserve featured state when editing.
          New products default to false.
        */

        const featured =
          existingProduct?.featured === true
            ? true
            : false;


        const productData = {

          /* REQUIRED BY FIREBASE RULES */

          name,

          category,

          price,

          oldPrice,

          discount,

          rating,

          image,

          description,

          featured,

          stock,


          /* ADDITIONAL STORE DATA */

          size,

          badge,


          /* TIMESTAMP */

          updatedAt:
            Date.now()

        };


        console.log(
          "📦 Product data being saved:",
          productData
        );


        /* =============================================
           SAVE TO FIREBASE
        ============================================= */

        try {

          if (editingProductId) {

            /*
              EDIT EXISTING PRODUCT
            */

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

            /*
              CREATE NEW PRODUCT
            */

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


          /* ===========================================
             SUCCESS MESSAGE
          =========================================== */

          if (productFormMessage) {

            productFormMessage.textContent =
              "Product saved successfully.";

            productFormMessage.className =
              "form-message success";

          }


          /* ===========================================
             REFRESH DATA
          =========================================== */

          await loadProducts();

          await updateDashboardStats();


          /* ===========================================
             CLOSE MODAL
          =========================================== */

          setTimeout(() => {

            closeProductModalHandler();

          }, 700);


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


          /*
            Show a more useful error message.
          */

          if (
            error?.code ===
            "PERMISSION_DENIED"
          ) {

            showFormError(
              "Firebase rejected this product. Check your Database Rules and required fields."
            );

          } else {

            showFormError(
              `Failed to save product: ${
                error?.message ||
                "Unknown error"
              }`
            );

          }

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

        const productData =
          productsSnapshot.val();


        productCountValue =
          Object.keys(
            productData
          ).length;

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
          Your current database structure is:

          orders
            └── UID
                └── ORDER ID

          Therefore we need to loop through
          users/UID/orderID instead of assuming
          every direct child is an order.
        */

        Object.values(
          orders
        ).forEach(userOrders => {

          if (
            !userOrders ||
            typeof userOrders !==
              "object"
          ) {

            return;

          }


          Object.values(
            userOrders
          ).forEach(order => {

            if (
              !order ||
              typeof order !==
                "object"
            ) {

              return;

            }


            orderCountValue++;


            revenue +=
              Number(
                order.total ||
                order.amount ||
                0
              );

          });

        });

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

        userCountValue =
          Object.keys(
            usersSnapshot.val()
          ).length;

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


        if (!confirmed) return;


        try {

          await signOut(
            auth
          );


          showToast(
            "Signed out successfully."
          );


          setTimeout(() => {

            window.location.href =
              "../index.html";

          }, 700);


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
