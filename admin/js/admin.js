/* =====================================================
   ZOLA'S CLOSET
   ADMIN DASHBOARD
   PRODUCT MODAL
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  console.log("🎀 ADMIN JS LOADED");


  /* =====================================================
     ELEMENTS
  ===================================================== */

  const addProductBtn =
    document.getElementById("addProductBtn");

  const productModal =
    document.getElementById("productModal");

  const closeProductModal =
    document.getElementById("closeProductModal");

  const cancelProductBtn =
    document.getElementById("cancelProductBtn");


  /* =====================================================
     DEBUG
  ===================================================== */

  console.log(
    "Add Product Button:",
    addProductBtn
  );

  console.log(
    "Product Modal:",
    productModal
  );


  /* =====================================================
     OPEN PRODUCT MODAL
  ===================================================== */

  if (addProductBtn && productModal) {

    addProductBtn.addEventListener(
      "click",
      () => {

        console.log(
          "🛍️ Add Product clicked"
        );

        productModal.classList.add(
          "active"
        );

      }
    );

  }


  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  function closeModal() {

    if (!productModal)
      return;

    productModal.classList.remove(
      "active"
    );

  }


  /* =====================================================
     CLOSE BUTTON
  ===================================================== */

  if (closeProductModal) {

    closeProductModal.addEventListener(
      "click",
      closeModal
    );

  }


  /* =====================================================
     CANCEL BUTTON
  ===================================================== */

  if (cancelProductBtn) {

    cancelProductBtn.addEventListener(
      "click",
      closeModal
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

          closeModal();

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

      if (event.key === "Escape") {

        closeModal();

      }

    }
  );

});
