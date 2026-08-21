/* =====================================================
   ZOLA'S CLOSET
   ADMIN DASHBOARD
   PRODUCT MODAL TEST
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

  console.log(
    "Close Button:",
    closeProductModal
  );

  console.log(
    "Cancel Button:",
    cancelProductBtn
  );


  /* =====================================================
     OPEN PRODUCT MODAL
  ===================================================== */

  if (addProductBtn && productModal) {

    addProductBtn.addEventListener(
      "click",
      () => {

        console.log(
          "🛍️ Add Product button clicked"
        );

        productModal.classList.add("show");

      }
    );

  }


  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  function closeModal() {

    if (!productModal)
      return;

    productModal.classList.remove("show");

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
     CLICK OUTSIDE
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
