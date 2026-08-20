/* =====================================================
   ZOLA'S CLOSET
   KIDS WEAR STORE
   FIREBASE VERSION
   PRODUCTS + AUTH + CART + CHECKOUT
===================================================== */

import {
  auth,
  database,
  googleProvider,
  ref,
  set,
  get,
  onValue,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged
} from "./firebase.js";


/* =====================================================
   PRODUCTS
   Loaded dynamically from Firebase Realtime Database
===================================================== */

let products = [];
let featuredProducts = [];

let productsLoaded = false;


/* =====================================================
   APP STATE
===================================================== */

let heroIndex = 0;
let heroTimer = null;

let currentCategory = "all";

let selectedProduct = null;
let selectedQuantity = 1;

let currentUser = null;

let isPlacingOrder = false;


/* =====================================================
   LOCAL STORAGE
===================================================== */

let cart =
  loadLocalStorage(
    "zolas-cart",
    []
  );

let favorites =
  loadLocalStorage(
    "zolas-favorites",
    []
  );


/* =====================================================
   DOM HELPER
===================================================== */

const $ = id =>
  document.getElementById(id);


/* =====================================================
   AUTH ELEMENTS
===================================================== */

const authOverlay =
  $("authOverlay");

const loginView =
  $("loginView");

const registerView =
  $("registerView");

const accountView =
  $("accountView");


/* =====================================================
   LOCAL STORAGE
===================================================== */

function loadLocalStorage(
  key,
  fallback
) {

  try {

    const value =
      localStorage.getItem(key);

    if (!value)
      return fallback;

    const parsed =
      JSON.parse(value);

    return parsed;

  } catch (error) {

    console.warn(
      `Unable to load ${key}:`,
      error
    );

    return fallback;

  }

}


/* =====================================================
   SAVE FAVORITES
===================================================== */

function saveFavorites() {

  localStorage.setItem(
    "zolas-favorites",
    JSON.stringify(favorites)
  );

}


/* =====================================================
   FIREBASE PRODUCTS
===================================================== */

function loadProductsFromFirebase() {

  const productsRef =
    ref(
      database,
      "products"
    );


  onValue(
    productsRef,
    snapshot => {

      const data =
        snapshot.val();


      if (!data) {

        products = [];

        featuredProducts = [];

        productsLoaded = true;

        renderProducts();
        renderHero();
        renderCart();
        updateCartCount();

        return;

      }


      products =
        Object.entries(data)
          .map(
            ([id, product]) => ({

              id:

                String(id),

              name:

                product?.name ||
                "Unnamed Product",

              category:

                String(
                  product?.category ||
                  "all"
                ).toLowerCase(),

              price:

                Number(
                  product?.price || 0
                ),

              oldPrice:

                Number(
                  product?.oldPrice || 0
                ),

              discount:

                Number(
                  product?.discount || 0
                ),

              rating:

                Number(
                  product?.rating || 0
                ),

              image:

                product?.image ||
                "",

              description:

                product?.description ||
                "",

              featured:

                product?.featured === true,

              stock:

                Math.max(
                  0,
                  Number(
                    product?.stock || 0
                  )
                )

            })
          );


      featuredProducts =
        products.filter(
          product =>
            product.featured === true &&
            product.stock > 0
        );


      productsLoaded = true;


      /*
        Remove cart items for products
        that no longer exist in Firebase.
      */

      normalizeCart();


      console.log(
        "🔥 Firebase products loaded:",
        products
      );


      renderProducts();

      renderHero();

      renderCart();

      updateCartCount();

      heroIndex = 0;

      startHeroTimer();

    },

    error => {

      console.error(
        "Firebase products error:",
        error
      );


      productsLoaded = false;


      const container =
        $("products");


      if (container) {

        container.innerHTML = `

          <div class="no-results">

            <div style="font-size:42px;">
              ⚠️
            </div>

            <h3>
              Unable to load products
            </h3>

            <p>
              Please refresh the page and try again.
            </p>

          </div>

        `;

      }


      showToast(
        "Unable to load products."
      );

    }
  );

}


/* =====================================================
   HERO
===================================================== */

function renderHero() {

  const track =
    $("heroTrack");

  const dots =
    $("heroDots");


  if (!track || !dots)
    return;


  /*
    Loading state
  */

  if (!productsLoaded) {

    track.innerHTML = `

      <div class="hero-slide">

        <div class="hero-product-visual">

          <div class="hero-product-circle">

            <div
              style="
                font-size:52px;
                animation:zolaPulse 1.5s infinite;
              "
            >
              🎀
            </div>

          </div>

        </div>


        <div class="hero-slide-content">

          <div class="hero-mini-label">
            🎀 ZOLA'S CLOSET
          </div>

          <h1>
            Loading cute
            <span>little looks...</span>
          </h1>

          <p>
            We're getting our collection ready for you.
          </p>

        </div>

      </div>

    `;

    dots.innerHTML = "";

    return;

  }


  /*
    No featured products
  */

  if (!featuredProducts.length) {

    track.innerHTML = `

      <div class="hero-slide">

        <div class="hero-product-visual">

          <div class="hero-product-circle">

            <div style="font-size:52px;">
              🎀
            </div>

          </div>

        </div>


        <div class="hero-slide-content">

          <div class="hero-mini-label">
            🎀 ZOLA'S CLOSET
          </div>

          <h1>
            Little Looks.
            <span>Big Style.</span>
          </h1>

          <p>
            Discover cute and comfortable outfits
            made for little ones.
          </p>

          <div class="hero-slide-actions">

            <a
              href="#shop"
              class="btn btn-primary">

              Shop Now →

            </a>

          </div>

        </div>

      </div>

    `;

    dots.innerHTML = "";

    return;

  }


  /*
    Featured products
  */

  track.innerHTML =
    featuredProducts
      .map(
        (product, index) => `

          <div class="hero-slide">

            <div class="hero-product-visual">

              <div class="hero-product-circle">

                <img
                  src="${escapeHtml(product.image)}"
                  alt="${escapeHtml(product.name)}"
                  loading="${index === 0 ? "eager" : "lazy"}"
                  onerror="this.style.display='none'"
                >

              </div>


              <div class="hero-discount-badge">

                <strong>
                  -${product.discount}%
                </strong>

                <span>
                  OFF
                </span>

              </div>

            </div>


            <div class="hero-slide-content">

              <div class="hero-mini-label">
                🎀 ZOLA'S PICK
              </div>


              <h1>
                ${getHeroTitle(product, index)}
              </h1>


              <p>
                ${escapeHtml(product.description)}
              </p>


              <div class="hero-slide-actions">

                <button
                  class="btn btn-primary"
                  onclick="viewProduct('${escapeJs(product.id)}')"
                  type="button">

                  View Outfit →

                </button>


                <button
                  class="btn btn-secondary"
                  onclick="addToCart('${escapeJs(product.id)}')"
                  type="button">

                  🛍️ Add to Bag

                </button>

              </div>

            </div>

          </div>

        `
      )
      .join("");


  dots.innerHTML =
    featuredProducts
      .map(
        (product, index) => `

          <button
            class="
              hero-dot
              ${index === heroIndex ? "active" : ""}
            "
            onclick="goToHero(${index})"
            aria-label="Go to featured product ${index + 1}"
            type="button">
          </button>

        `
      )
      .join("");


  updateHero();

}


function getHeroTitle(
  product,
  index
) {

  const titles = [

    `
      Sweet Dresses.
      <span>Big Little Smiles.</span>
    `,

    `
      Cute Everyday Looks.
      <span>Made for Play.</span>
    `,

    `
      Little Style.
      <span>Big Personality.</span>
    `,

    `
      Soft & Sweet.
      <span>Perfect for Little Ones.</span>
    `,

    `
      Dress Them Cute.
      <span>Let Them Shine.</span>
    `

  ];


  return (
    titles[index] ||
    `
      Little Looks.
      <span>Big Style.</span>
    `
  );

}


function updateHero() {

  const track =
    $("heroTrack");

  const dots =
    document.querySelectorAll(
      ".hero-dot"
    );


  if (!track)
    return;


  if (!featuredProducts.length)
    return;


  if (
    heroIndex >=
    featuredProducts.length
  ) {

    heroIndex = 0;

  }


  track.style.transform =
    `translateX(-${heroIndex * 100}%)`;


  dots.forEach(
    (dot, index) => {

      dot.classList.toggle(
        "active",
        index === heroIndex
      );

    }
  );

}


function nextHero() {

  if (!featuredProducts.length)
    return;


  heroIndex =
    (
      heroIndex + 1
    ) %
    featuredProducts.length;


  updateHero();

  restartHeroTimer();

}


function previousHero() {

  if (!featuredProducts.length)
    return;


  heroIndex--;


  if (heroIndex < 0) {

    heroIndex =
      featuredProducts.length - 1;

  }


  updateHero();

  restartHeroTimer();

}


function goToHero(index) {

  if (
    index < 0 ||
    index >= featuredProducts.length
  )
    return;


  heroIndex = index;

  updateHero();

  restartHeroTimer();

}


function startHeroTimer() {

  clearInterval(heroTimer);


  if (featuredProducts.length <= 1)
    return;


  heroTimer =
    setInterval(
      () => {

        heroIndex =
          (
            heroIndex + 1
          ) %
          featuredProducts.length;

        updateHero();

      },
      4500
    );

}


function restartHeroTimer() {

  startHeroTimer();

}


/* =====================================================
   HERO CONTROLS
===================================================== */

const heroNext =
  $("heroNext");

const heroPrev =
  $("heroPrev");

const heroSlider =
  $("heroSlider");


if (heroNext) {

  heroNext.addEventListener(
    "click",
    nextHero
  );

}


if (heroPrev) {

  heroPrev.addEventListener(
    "click",
    previousHero
  );

}


if (heroSlider) {

  heroSlider.addEventListener(
    "mouseenter",
    () =>
      clearInterval(heroTimer)
  );


  heroSlider.addEventListener(
    "mouseleave",
    startHeroTimer
  );

}


/* =====================================================
   PRODUCTS
===================================================== */

function renderProducts() {

  const container =
    $("products");

  const searchInput =
    $("searchInput");


  if (!container)
    return;


  /*
    Loading state
  */

  if (!productsLoaded) {

    container.innerHTML = `

      <div class="no-results">

        <div style="font-size:42px;">
          🎀
        </div>

        <h3>
          Loading little looks...
        </h3>

        <p>
          Please wait while we load our collection.
        </p>

      </div>

    `;

    return;

  }


  /*
    No products
  */

  if (!products.length) {

    container.innerHTML = `

      <div class="no-results">

        <div style="font-size:42px;">
          🎀
        </div>

        <h3>
          Little looks coming soon
        </h3>

        <p>
          Our cute collection will be available here soon.
        </p>

      </div>

    `;

    return;

  }


  const search =
    searchInput
      ? searchInput.value
          .toLowerCase()
          .trim()
      : "";


  const filtered =
    products.filter(
      product => {

        const categoryMatch =
          currentCategory === "all" ||
          product.category ===
            currentCategory;


        const searchMatch =
          product.name
            .toLowerCase()
            .includes(search) ||
          product.description
            .toLowerCase()
            .includes(search);


        return (
          categoryMatch &&
          searchMatch
        );

      }
    );


  if (!filtered.length) {

    container.innerHTML = `

      <div class="no-results">

        <div style="font-size:42px;">
          🎀
        </div>

        <h3>
          No little looks found
        </h3>

        <p>
          Try another search or category.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    filtered
      .map(
        product => {

          const isFavorite =
            favorites.includes(
              product.id
            );


          const outOfStock =
            product.stock <= 0;


          return `

            <div
              class="product-card"
              data-product-id="${escapeHtml(product.id)}">

              <div class="product-image">

                <div class="discount">
                  -${product.discount}%
                </div>


                <button
                  class="
                    favorite
                    ${isFavorite ? "active" : ""}
                  "
                  onclick="favoriteProduct(this, '${escapeJs(product.id)}')"
                  type="button">

                  ♡

                </button>


                <img
                  src="${escapeHtml(product.image)}"
                  alt="${escapeHtml(product.name)}"
                  loading="lazy"
                  onerror="this.style.display='none'"
                >


                ${
                  outOfStock
                    ? `
                      <div class="stock-badge">
                        Sold Out
                      </div>
                    `
                    : ""
                }

              </div>


              <div class="product-info">

                <div class="product-category">
                  ${escapeHtml(product.category)}
                </div>


                <h3>
                  ${escapeHtml(product.name)}
                </h3>


                <div class="product-price-row">

                  <strong>
                    ₱${product.price.toLocaleString()}
                  </strong>

                  ${
                    product.oldPrice > 0
                      ? `
                        <del>
                          ₱${product.oldPrice.toLocaleString()}
                        </del>
                      `
                      : ""
                  }

                </div>


                <div class="product-rating">
                  ⭐ ${product.rating.toFixed(1)}
                </div>


                <div
                  class="product-stock">

                  ${
                    outOfStock
                      ? "Out of stock"
                      : `${product.stock} available`
                  }

                </div>


                <div class="product-actions">

                  <button
                    class="view-product"
                    onclick="viewProduct('${escapeJs(product.id)}')"
                    type="button">

                    View Outfit

                  </button>


                  <button
                    class="add-cart"
                    onclick="addToCart('${escapeJs(product.id)}')"
                    type="button"
                    ${outOfStock ? "disabled" : ""}>

                    ${
                      outOfStock
                        ? "Sold Out"
                        : "🛍️ Add"
                    }

                  </button>

                </div>

              </div>

            </div>

          `;

        }
      )
      .join("");

}


/* =====================================================
   PRODUCT MODAL
===================================================== */

function viewProduct(id) {

  selectedProduct =
    products.find(
      product =>
        String(product.id) ===
        String(id)
    );


  if (!selectedProduct) {

    showToast(
      "Product information is not available."
    );

    return;

  }


  selectedQuantity = 1;

  renderProductDetails();


  const modal =
    $("productModal");


  if (modal)
    modal.classList.add("show");

}


/* =====================================================
   CLOSE PRODUCT
===================================================== */

function closeProduct() {

  const modal =
    $("productModal");


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }


  selectedProduct = null;

  selectedQuantity = 1;

}


/* =====================================================
   PRODUCT DETAILS
===================================================== */

function renderProductDetails() {

  const product =
    selectedProduct;


  if (!product)
    return;


  const container =
    $("productDetails");


  if (!container)
    return;


  const outOfStock =
    product.stock <= 0;


  container.innerHTML = `

    <div class="product-detail">

      <div class="product-detail-image">

        <img
          src="${escapeHtml(product.image)}"
          alt="${escapeHtml(product.name)}"
        >

      </div>


      <div class="product-detail-info">

        <div class="product-detail-category">
          ${escapeHtml(product.category)}
        </div>


        <div class="product-detail-discount">
          -${product.discount}% OFF
        </div>


        <h2>
          ${escapeHtml(product.name)}
        </h2>


        <div class="product-detail-rating">
          ⭐⭐⭐⭐⭐
          ${product.rating.toFixed(1)}
          · Customer Reviews
        </div>


        <p class="product-detail-description">
          ${escapeHtml(product.description)}
        </p>


        <div class="product-detail-price">
          ₱${product.price.toLocaleString()}
        </div>


        ${
          product.oldPrice > 0
            ? `
              <div class="product-detail-old-price">
                ₱${product.oldPrice.toLocaleString()}
              </div>
            `
            : ""
        }


        <div class="product-detail-stock">

          ${
            outOfStock
              ? "❌ Out of stock"
              : `✓ ${product.stock} pieces available`
          }

        </div>


        ${
          !outOfStock
            ? `
              <div class="product-quantity">

                <strong>
                  Quantity:
                </strong>


                <button
                  onclick="changeProductQuantity(-1)"
                  type="button">

                  −

                </button>


                <span id="productQuantity">
                  1
                </span>


                <button
                  onclick="changeProductQuantity(1)"
                  type="button">

                  +

                </button>

              </div>
            `
            : ""
        }


        <button
          class="product-buy"
          onclick="addSelectedProductToCart()"
          type="button"
          ${outOfStock ? "disabled" : ""}>

          ${
            outOfStock
              ? "Sold Out"
              : "🛍️ Add to Bag"
          }

        </button>

      </div>

    </div>

  `;

}


/* =====================================================
   PRODUCT QUANTITY
===================================================== */

function changeProductQuantity(
  amount
) {

  if (!selectedProduct)
    return;


  const maxStock =
    Math.min(
      99,
      Math.max(
        1,
        Number(
          selectedProduct.stock || 1
        )
      )
    );


  selectedQuantity += amount;


  if (selectedQuantity < 1)
    selectedQuantity = 1;


  if (selectedQuantity > maxStock) {

    selectedQuantity =
      maxStock;

    showToast(
      `Only ${maxStock} available.`
    );

  }


  const quantityElement =
    $("productQuantity");


  if (quantityElement) {

    quantityElement.textContent =
      selectedQuantity;

  }

}


/* =====================================================
   ADD SELECTED PRODUCT
===================================================== */

function addSelectedProductToCart() {

  if (!selectedProduct)
    return;


  if (selectedProduct.stock <= 0) {

    showToast(
      "This product is sold out."
    );

    return;

  }


  const existing =
    cart.find(
      item =>
        String(item.id) ===
        String(selectedProduct.id)
    );


  const currentQuantity =
    existing
      ? Number(existing.quantity)
      : 0;


  if (
    currentQuantity +
    selectedQuantity >
    selectedProduct.stock
  ) {

    showToast(
      `Only ${selectedProduct.stock} available.`
    );

    return;

  }


  if (existing) {

    existing.quantity +=
      selectedQuantity;

  } else {

    cart.push({

      id:
        selectedProduct.id,

      quantity:
        selectedQuantity

    });

  }


  normalizeCart();

  saveCart();


  const productName =
    selectedProduct.name;


  closeProduct();


  showToast(
    `${productName} added to your bag 🛍️`
  );

}


/* =====================================================
   CART
===================================================== */

function normalizeCart() {

  cart =
    cart
      .map(
        item => {

          const product =
            products.find(
              p =>
                String(p.id) ===
                String(item.id)
            );


          if (!product)
            return null;


          const quantity =
            Number(
              item.quantity
            );


          if (
            !Number.isFinite(quantity) ||
            quantity <= 0 ||
            product.stock <= 0
          ) {

            return null;

          }


          return {

            id:
              product.id,

            quantity:
              Math.min(
                99,
                product.stock,
                Math.max(
                  1,
                  quantity
                )
              )

          };

        }
      )
      .filter(Boolean);

}


function saveCart() {

  normalizeCart();


  localStorage.setItem(
    "zolas-cart",
    JSON.stringify(cart)
  );


  renderCart();

  updateCartCount();

}


function addToCart(id) {

  const product =
    products.find(
      p =>
        String(p.id) ===
        String(id)
    );


  if (!product) {

    showToast(
      "Product is not available."
    );

    return;

  }


  if (product.stock <= 0) {

    showToast(
      "This product is sold out."
    );

    return;

  }


  const existing =
    cart.find(
      item =>
        String(item.id) ===
        String(id)
    );


  const currentQuantity =
    existing
      ? Number(existing.quantity)
      : 0;


  if (
    currentQuantity >=
    product.stock
  ) {

    showToast(
      `Only ${product.stock} available.`
    );

    return;

  }


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({

      id:
        product.id,

      quantity:
        1

    });

  }


  saveCart();


  showToast(
    `${product.name} added to your bag 🛍️`
  );

}


function updateCartCount() {

  const count =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );


  const cartCount =
    $("cartCount");


  if (cartCount) {

    cartCount.textContent =
      count > 99
        ? "99+"
        : count;

  }

}


/* =====================================================
   RENDER CART
===================================================== */

function renderCart() {

  const container =
    $("cartItems");


  if (!container)
    return;


  normalizeCart();


  if (!cart.length) {

    container.innerHTML = `

      <div class="empty-cart">

        <div style="font-size:45px">
          🛍️
        </div>

        <h3>
          Your bag is waiting
        </h3>

        <p>
          Add some cute outfits to get started.
        </p>

      </div>

    `;


    const totalElement =
      $("cartTotal");


    if (totalElement)
      totalElement.textContent =
        "₱0";


    return;

  }


  let total = 0;


  container.innerHTML =
    cart
      .map(
        item => {

          const product =
            products.find(
              p =>
                String(p.id) ===
                String(item.id)
            );


          if (!product)
            return "";


          const subtotal =
            product.price *
            item.quantity;


          total += subtotal;


          return `

            <div class="cart-item">

              <div class="cart-item-image">

                <img
                  src="${escapeHtml(product.image)}"
                  alt="${escapeHtml(product.name)}"
                  loading="lazy"
                >

              </div>


              <div class="cart-item-content">

                <h4>
                  ${escapeHtml(product.name)}
                </h4>


                <div class="cart-item-price">
                  ₱${subtotal.toLocaleString()}
                </div>


                <div class="quantity">

                  <button
                    onclick="changeQuantity('${escapeJs(product.id)}', -1)"
                    type="button">

                    −

                  </button>


                  <span>
                    ${item.quantity}
                  </span>


                  <button
                    onclick="changeQuantity('${escapeJs(product.id)}', 1)"
                    type="button">

                    +

                  </button>


                  <button
                    class="remove"
                    onclick="removeFromCart('${escapeJs(product.id)}')"
                    type="button">

                    Remove

                  </button>

                </div>

              </div>

            </div>

          `;

        }
      )
      .join("");


  const cartTotal =
    $("cartTotal");


  if (cartTotal) {

    cartTotal.textContent =
      "₱" +
      total.toLocaleString();

  }

}


function changeQuantity(
  id,
  amount
) {

  const item =
    cart.find(
      i =>
        String(i.id) ===
        String(id)
    );


  if (!item)
    return;


  const product =
    products.find(
      p =>
        String(p.id) ===
        String(id)
    );


  if (!product)
    return;


  const newQuantity =
    Number(item.quantity) +
    amount;


  if (newQuantity <= 0) {

    cart =
      cart.filter(
        i =>
          String(i.id) !==
          String(id)
      );

    saveCart();

    return;

  }


  if (
    newQuantity >
    product.stock
  ) {

    showToast(
      `Only ${product.stock} available.`
    );

    return;

  }


  if (newQuantity > 99) {

    item.quantity = 99;

    showToast(
      "Maximum quantity reached."
    );

  } else {

    item.quantity =
      newQuantity;

  }


  saveCart();

}


function removeFromCart(id) {

  const product =
    products.find(
      p =>
        String(p.id) ===
        String(id)
    );


  cart =
    cart.filter(
      item =>
        String(item.id) !==
        String(id)
    );


  saveCart();


  showToast(
    product
      ? `${product.name} removed from your bag`
      : "Product removed from your bag"
  );

}


/* =====================================================
   OPEN / CLOSE CART
===================================================== */

function openCart() {

  renderCart();


  const overlay =
    $("cartOverlay");


  if (overlay) {

    overlay.classList.add(
      "show"
    );

  }

}


function closeCart() {

  const overlay =
    $("cartOverlay");


  if (overlay) {

    overlay.classList.remove(
      "show"
    );

  }

}


/* =====================================================
   CHECKOUT
===================================================== */

function startCheckout() {

  if (!cart.length) {

    showToast(
      "Your cart is empty."
    );

    return;

  }


  if (!currentUser) {

    closeCart();

    openLogin();


    showToast(
      "Please sign in before checkout."
    );

    return;

  }


  closeCart();

  renderCheckout();


  const overlay =
    $("checkoutOverlay");


  if (overlay)
    overlay.classList.add("show");

}


function closeCheckout() {

  const overlay =
    $("checkoutOverlay");


  if (overlay)
    overlay.classList.remove("show");

}


/* =====================================================
   CHECKOUT RENDER
===================================================== */

function renderCheckout() {

  const container =
    $("checkoutItems");


  if (!container)
    return;


  let subtotal = 0;


  container.innerHTML =
    cart
      .map(
        item => {

          const product =
            products.find(
              p =>
                String(p.id) ===
                String(item.id)
            );


          if (!product)
            return "";


          const total =
            product.price *
            item.quantity;


          subtotal += total;


          return `

            <div class="summary-item">

              <span>
                ${escapeHtml(product.name)}
                × ${item.quantity}
              </span>

              <strong>
                ₱${total.toLocaleString()}
              </strong>

            </div>

          `;

        }
      )
      .join("");


  const subtotalElement =
    $("checkoutSubtotal");


  if (subtotalElement) {

    subtotalElement.textContent =
      "₱" +
      subtotal.toLocaleString();

  }


  const customerEmail =
    $("customerEmail");


  if (
    customerEmail &&
    currentUser
  ) {

    customerEmail.value =
      currentUser.email || "";

  }


  const customerName =
    $("customerName");


  if (
    customerName &&
    currentUser &&
    currentUser.displayName
  ) {

    customerName.value =
      currentUser.displayName;

  }


  updateCheckoutTotal();

}


function updateCheckoutTotal() {

  let subtotal = 0;


  cart.forEach(
    item => {

      const product =
        products.find(
          p =>
            String(p.id) ===
            String(item.id)
        );


      if (product) {

        subtotal +=
          product.price *
          item.quantity;

      }

    }
  );


  const shippingElement =
    $("shippingMethod");


  const shipping =
    shippingElement
      ? Number(
          shippingElement.value || 0
        )
      : 0;


  const shippingOutput =
    $("checkoutShipping");


  if (shippingOutput) {

    shippingOutput.textContent =
      shipping === 0
        ? "FREE"
        : "₱" +
          shipping.toLocaleString();

  }


  const totalOutput =
    $("checkoutTotal");


  if (totalOutput) {

    totalOutput.textContent =
      "₱" +
      (
        subtotal +
        shipping
      ).toLocaleString();

  }

}


/* =====================================================
   PLACE ORDER
===================================================== */

async function placeOrder() {

  if (isPlacingOrder)
    return;


  if (!currentUser) {

    showToast(
      "Please sign in before placing your order."
    );

    closeCheckout();

    openLogin();

    return;

  }


  if (!cart.length) {

    showToast(
      "Your cart is empty."
    );

    closeCheckout();

    return;

  }


  const name =
    $("customerName")?.value.trim() || "";

  const email =
    $("customerEmail")?.value.trim() || "";

  const phone =
    $("customerPhone")?.value.trim() || "";

  const address =
    $("customerAddress")?.value.trim() || "";

  const city =
    $("customerCity")?.value.trim() || "";

  const province =
    $("customerProvince")?.value.trim() || "";


  if (
    !name ||
    !email ||
    !phone ||
    !address ||
    !city ||
    !province
  ) {

    showToast(
      "Please complete your information."
    );

    return;

  }


  const paymentMethod =
    $("paymentMethod")?.value ||
    "Not specified";


  const shipping =
    Number(
      $("shippingMethod")?.value || 0
    );


  let subtotal = 0;


  const orderItems =
    cart
      .map(
        item => {

          const product =
            products.find(
              p =>
                String(p.id) ===
                String(item.id)
            );


          if (!product)
            return null;


          /*
            Check stock again before order
          */

          if (
            item.quantity >
            product.stock
          ) {

            return null;

          }


          const itemTotal =
            product.price *
            item.quantity;


          subtotal += itemTotal;


          return {

            productId:
              product.id,

            productName:
              product.name,

            price:
              product.price,

            quantity:
              item.quantity,

            total:
              itemTotal

          };

        }
      )
      .filter(Boolean);


  if (!orderItems.length) {

    showToast(
      "Unable to process your cart."
    );

    return;

  }


  const total =
    subtotal + shipping;


  const orderNumber =
    "ZC" +
    Date.now()
      .toString()
      .slice(-8);


  const createdAt =
    new Date().toISOString();


  const orderData = {

    orderNumber,

    userId:
      currentUser.uid,

    customer: {

      name,
      email,
      phone

    },

    shippingAddress: {

      address,
      city,
      province

    },

    items:
      orderItems,

    subtotal,
    shipping,
    total,

    paymentMethod,

    status:
      "pending",

    createdAt

  };


  try {

    isPlacingOrder = true;

    setCheckoutButtonLoading(true);


    const orderRef =
      ref(
        database,
        `orders/${currentUser.uid}/${orderNumber}`
      );


    await set(
      orderRef,
      orderData
    );


    const userOrderRef =
      ref(
        database,
        `users/${currentUser.uid}/orders/${orderNumber}`
      );


    await set(
      userOrderRef,
      {

        orderNumber,

        total,

        status:
          "pending",

        paymentMethod,

        createdAt

      }
    );


    showOrderSuccess(
      name,
      orderNumber,
      paymentMethod
    );


  } catch (error) {

    console.error(
      "Order save error:",
      error
    );


    showToast(
      getFirebaseErrorMessage(error)
    );


    isPlacingOrder = false;

    setCheckoutButtonLoading(false);

  }

}


/* =====================================================
   CHECKOUT BUTTON LOADING
===================================================== */

function setCheckoutButtonLoading(
  loading
) {

  const buttons =
    document.querySelectorAll(
      "#checkoutOverlay .place-order, #checkoutOverlay button[type='submit']"
    );


  buttons.forEach(
    button => {

      if (loading) {

        button.disabled = true;


        if (!button.dataset.originalText) {

          button.dataset.originalText =
            button.textContent;

        }


        button.textContent =
          "Processing...";

      } else {

        button.disabled = false;


        if (button.dataset.originalText) {

          button.textContent =
            button.dataset.originalText;

        }

      }

    }
  );

}


/* =====================================================
   ORDER SUCCESS
===================================================== */

function showOrderSuccess(
  name,
  orderNumber,
  paymentMethod
) {

  const checkoutContent =
    $("checkoutContent");


  if (!checkoutContent)
    return;


  checkoutContent.innerHTML = `

    <div class="success-box">

      <div class="success-icon">
        🎀
      </div>


      <h2>
        Order Confirmed!
      </h2>


      <p>
        Thank you,
        <strong>
          ${escapeHtml(name)}
        </strong>!
      </p>


      <p>
        Your order number is:
        <br>

        <strong>
          #${escapeHtml(orderNumber)}
        </strong>
      </p>


      <p>
        Payment:
        ${escapeHtml(paymentMethod)}
      </p>


      <button
        class="place-order"
        onclick="finishOrder()"
        type="button">

        Continue Shopping

      </button>

    </div>

  `;


  isPlacingOrder = false;

}


function finishOrder() {

  cart = [];

  saveCart();

  closeCheckout();

  location.reload();

}


/* =====================================================
   FAVORITES
===================================================== */

function favoriteProduct(
  button,
  productId
) {

  const index =
    favorites.findIndex(
      id =>
        String(id) ===
        String(productId)
    );


  if (index === -1) {

    favorites.push(
      productId
    );


    button.classList.add(
      "active"
    );


    showToast(
      "Added to favorites ♡"
    );

  } else {

    favorites.splice(
      index,
      1
    );


    button.classList.remove(
      "active"
    );


    showToast(
      "Removed from favorites"
    );

  }


  saveFavorites();

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer = null;


function showToast(message) {

  const toast =
    $("toast");


  if (!toast)
    return;


  toast.textContent =
    message;


  toast.classList.remove(
    "show"
  );


  void toast.offsetWidth;


  toast.classList.add(
    "show"
  );


  clearTimeout(toastTimer);


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
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
   ESCAPE JAVASCRIPT STRING
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
    )
    .replace(
      /\r?\n/g,
      "\\n"
    );

}


/* =====================================================
   SEARCH
===================================================== */

const searchInput =
  $("searchInput");


if (searchInput) {

  searchInput.addEventListener(
    "input",
    renderProducts
  );

}


/* =====================================================
   CATEGORY
===================================================== */

document
  .querySelectorAll(".category")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        function () {

          document
            .querySelectorAll(".category")
            .forEach(
              b =>
                b.classList.remove(
                  "active"
                )
            );


          this.classList.add(
            "active"
          );


          currentCategory =
            this.dataset.category ||
            "all";


          renderProducts();

        }
      );

    }
  );


/* =====================================================
   THEME
===================================================== */

const themeBtn =
  $("themeBtn");


const savedTheme =
  localStorage.getItem(
    "zolas-theme"
  );


if (savedTheme === "dark") {

  document.body.classList.add(
    "dark"
  );

}


if (themeBtn) {

  themeBtn.classList.toggle(
    "active",
    document.body.classList.contains(
      "dark"
    )
  );


  themeBtn.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "dark"
      );


      const dark =
        document.body.classList.contains(
          "dark"
        );


      localStorage.setItem(
        "zolas-theme",
        dark
          ? "dark"
          : "light"
      );


      themeBtn.classList.toggle(
        "active",
        dark
      );

    }
  );

}


/* =====================================================
   CART BUTTON
===================================================== */

const cartBtn =
  $("cartBtn");


if (cartBtn) {

  cartBtn.addEventListener(
    "click",
    openCart
  );

}


/* =====================================================
   CART OVERLAY
===================================================== */

const cartOverlay =
  $("cartOverlay");


if (cartOverlay) {

  cartOverlay.addEventListener(
    "click",
    function (event) {

      if (
        event.target === this
      ) {

        closeCart();

      }

    }
  );

}


/* =====================================================
   PRODUCT MODAL OVERLAY
===================================================== */

const productModal =
  $("productModal");


if (productModal) {

  productModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target === this
      ) {

        closeProduct();

      }

    }
  );

}


/* =====================================================
   CHECKOUT OVERLAY
===================================================== */

const checkoutOverlay =
  $("checkoutOverlay");


if (checkoutOverlay) {

  checkoutOverlay.addEventListener(
    "click",
    function (event) {

      if (
        event.target === this
      ) {

        closeCheckout();

      }

    }
  );

}


/* =====================================================
   SHIPPING
===================================================== */

const shippingMethod =
  $("shippingMethod");


if (shippingMethod) {

  shippingMethod.addEventListener(
    "change",
    updateCheckoutTotal
  );

}


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape")
      return;


    closeProduct();

    closeCart();

    closeAuth();

    closeCheckout();

  }
);


/* =====================================================
   AUTH
===================================================== */

function openLogin() {

  if (loginView)
    loginView.classList.remove(
      "hidden"
    );


  if (registerView)
    registerView.classList.add(
      "hidden"
    );


  if (accountView)
    accountView.classList.add(
      "hidden"
    );


  if (authOverlay)
    authOverlay.classList.add(
      "show"
    );

}


function openRegister() {

  if (loginView)
    loginView.classList.add(
      "hidden"
    );


  if (registerView)
    registerView.classList.remove(
      "hidden"
    );


  if (accountView)
    accountView.classList.add(
      "hidden"
    );


  if (authOverlay)
    authOverlay.classList.add(
      "show"
    );

}


function openAccount() {

  if (!currentUser) {

    openLogin();

    return;

  }


  if (loginView)
    loginView.classList.add(
      "hidden"
    );


  if (registerView)
    registerView.classList.add(
      "hidden"
    );


  if (accountView)
    accountView.classList.remove(
      "hidden"
    );


  const accountName =
    $("accountName");


  const accountEmail =
    $("accountEmail");


  const displayName =
    currentUser.displayName ||
    "Customer";


  if (accountName) {

    accountName.textContent =
      "Hi, " +
      displayName +
      "!";

  }


  if (accountEmail) {

    accountEmail.textContent =
      currentUser.email || "";

  }


  if (authOverlay)
    authOverlay.classList.add(
      "show"
    );

}


function closeAuth() {

  if (authOverlay) {

    authOverlay.classList.remove(
      "show"
    );

  }

}


/* =====================================================
   REGISTER
===================================================== */

const registerForm =
  $("registerForm");


if (registerForm) {

  registerForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const name =
        $("registerName")?.value.trim() || "";

      const email =
        $("registerEmail")?.value.trim() || "";

      const password =
        $("registerPassword")?.value || "";


      if (!name) {

        showToast(
          "Please enter your name."
        );

        return;

      }


      if (!email) {

        showToast(
          "Please enter your email."
        );

        return;

      }


      if (password.length < 6) {

        showToast(
          "Password must be at least 6 characters."
        );

        return;

      }


      const submitButton =
        registerForm.querySelector(
          "button[type='submit']"
        );


      try {

        if (submitButton) {

          submitButton.disabled = true;

          submitButton.dataset.originalText =
            submitButton.textContent;

          submitButton.textContent =
            "Creating Account...";

        }


        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );


        const user =
          userCredential.user;


        await updateProfile(
          user,
          {
            displayName:
              name
          }
        );


        await set(
          ref(
            database,
            `users/${user.uid}/profile`
          ),
          {

            uid:
              user.uid,

            name:
              name,

            email:
              email,

            provider:
              "password",

            createdAt:
              new Date().toISOString()

          }
        );


        registerForm.reset();

        closeAuth();


        showToast(
          "Account created successfully! ✨"
        );


      } catch (error) {

        console.error(
          "Registration error:",
          error
        );


        handleFirebaseAuthError(
          error
        );

      } finally {

        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            submitButton.dataset.originalText ||
            "Create Account";

        }

      }

    }
  );

}


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
  $("loginForm");


if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const email =
        $("loginEmail")?.value.trim() || "";

      const password =
        $("loginPassword")?.value || "";


      if (!email || !password) {

        showToast(
          "Please enter your email and password."
        );

        return;

      }


      const submitButton =
        loginForm.querySelector(
          "button[type='submit']"
        );


      try {

        if (submitButton) {

          submitButton.disabled = true;

          submitButton.dataset.originalText =
            submitButton.textContent;

          submitButton.textContent =
            "Signing In...";

        }


        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );


        loginForm.reset();

        closeAuth();


        showToast(
          "Welcome back! ✨"
        );


      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        handleFirebaseAuthError(
          error
        );

      } finally {

        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            submitButton.dataset.originalText ||
            "Sign In";

        }

      }

    }
  );

}


/* =====================================================
   GOOGLE LOGIN
===================================================== */

async function loginWithGoogle() {

  const googleButton =
    $("googleLoginBtn");


  try {

    if (googleButton) {

      googleButton.disabled = true;

      googleButton.dataset.originalText =
        googleButton.textContent;

      googleButton.textContent =
        "Signing in...";

    }


    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );


    const user =
      result.user;


    const profileRef =
      ref(
        database,
        `users/${user.uid}/profile`
      );


    const snapshot =
      await get(profileRef);


    if (!snapshot.exists()) {

      await set(
        profileRef,
        {

          uid:
            user.uid,

          name:
            user.displayName ||
            "Google Customer",

          email:
            user.email ||
            "",

          provider:
            "google",

          createdAt:
            new Date().toISOString()

        }
      );

    }


    closeAuth();


    showToast(
      "Signed in with Google! ✨"
    );


  } catch (error) {

    console.error(
      "Google login error:",
      error
    );


    handleFirebaseAuthError(
      error
    );

  } finally {

    if (googleButton) {

      googleButton.disabled = false;

      googleButton.textContent =
        googleButton.dataset.originalText ||
        "Continue with Google";

    }

  }

}


/* =====================================================
   GOOGLE BUTTON
===================================================== */

const googleLoginBtn =
  $("googleLoginBtn");


if (googleLoginBtn) {

  googleLoginBtn.addEventListener(
    "click",
    loginWithGoogle
  );

}


/* =====================================================
   LOGOUT
===================================================== */

const logoutBtn =
  $("logoutBtn");


if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        closeAuth();


        showToast(
          "You have been signed out."
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
   FIREBASE AUTH STATE
===================================================== */

onAuthStateChanged(
  auth,
  async user => {

    currentUser =
      user || null;


    updateAuthUI();


    if (!user)
      return;


    try {

      const profileRef =
        ref(
          database,
          `users/${user.uid}/profile`
        );


      const snapshot =
        await get(profileRef);


      if (!snapshot.exists()) {

        await set(
          profileRef,
          {

            uid:
              user.uid,

            name:
              user.displayName ||
              "Customer",

            email:
              user.email ||
              "",

            provider:
              user.providerData?.[0]?.providerId ||
              "unknown",

            createdAt:
              new Date().toISOString()

          }
        );

      }

    } catch (error) {

      console.error(
        "Profile sync error:",
        error
      );

    }

  }
);


/* =====================================================
   AUTH UI
===================================================== */

function updateAuthUI() {

  const profileBtn =
    $("profileBtn");


  if (!profileBtn)
    return;


  if (currentUser) {

    profileBtn.classList.add(
      "logged-in"
    );


    profileBtn.setAttribute(
      "title",
      currentUser.displayName ||
      currentUser.email ||
      "My Account"
    );


    profileBtn.setAttribute(
      "aria-label",
      "Open my account"
    );

  } else {

    profileBtn.classList.remove(
      "logged-in"
    );


    profileBtn.setAttribute(
      "title",
      "Sign in"
    );


    profileBtn.setAttribute(
      "aria-label",
      "Sign in"
    );

  }

}


/* =====================================================
   PROFILE BUTTON
===================================================== */

const profileBtn =
  $("profileBtn");


if (profileBtn) {

  profileBtn.addEventListener(
    "click",
    openAccount
  );

}


/* =====================================================
   AUTH CLOSE
===================================================== */

const authClose =
  $("authClose");


if (authClose) {

  authClose.addEventListener(
    "click",
    closeAuth
  );

}


/* =====================================================
   SHOW REGISTER
===================================================== */

const showRegister =
  $("showRegister");


if (showRegister) {

  showRegister.addEventListener(
    "click",
    event => {

      event.preventDefault();

      openRegister();

    }
  );

}


/* =====================================================
   SHOW LOGIN
===================================================== */

const showLogin =
  $("showLogin");


if (showLogin) {

  showLogin.addEventListener(
    "click",
    event => {

      event.preventDefault();

      openLogin();

    }
  );

}


/* =====================================================
   AUTH OVERLAY
===================================================== */

if (authOverlay) {

  authOverlay.addEventListener(
    "click",
    function (event) {

      if (
        event.target === this
      ) {

        closeAuth();

      }

    }
  );

}


/* =====================================================
   FIREBASE ERROR
===================================================== */

function handleFirebaseAuthError(
  error
) {

  showToast(
    getFirebaseErrorMessage(error)
  );

}


function getFirebaseErrorMessage(
  error
) {

  if (!error)
    return "Something went wrong.";


  switch (error.code) {

    case "auth/email-already-in-use":
      return "This email is already registered.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";

    case "auth/user-not-found":
      return "No account found with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";

    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup.";

    case "auth/unauthorized-domain":
      return "This website domain is not authorized in Firebase.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/operation-not-allowed":
      return "This sign-in method is currently unavailable.";

    case "auth/requires-recent-login":
      return "Please sign in again to continue.";

    default:
      return (
        error.message ||
        "Something went wrong. Please try again."
      );

  }

}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.viewProduct =
  viewProduct;

window.closeProduct =
  closeProduct;

window.addToCart =
  addToCart;

window.changeProductQuantity =
  changeProductQuantity;

window.addSelectedProductToCart =
  addSelectedProductToCart;

window.changeQuantity =
  changeQuantity;

window.removeFromCart =
  removeFromCart;

window.closeCart =
  closeCart;

window.startCheckout =
  startCheckout;

window.closeCheckout =
  closeCheckout;

window.placeOrder =
  placeOrder;

window.finishOrder =
  finishOrder;

window.favoriteProduct =
  favoriteProduct;

window.goToHero =
  goToHero;

window.nextHero =
  nextHero;

window.previousHero =
  previousHero;

window.openLogin =
  openLogin;

window.openRegister =
  openRegister;

window.openAccount =
  openAccount;

window.closeAuth =
  closeAuth;

window.loginWithGoogle =
  loginWithGoogle;


/* =====================================================
   INITIALIZE
===================================================== */

normalizeCart();

renderHero();

renderProducts();

renderCart();

updateCartCount();

updateAuthUI();

startHeroTimer();

loadProductsFromFirebase();


/* =====================================================
   READY
===================================================== */

console.log(
  "🎀 Zola's Closet initialized successfully."
);

console.log(
  "🔥 Firebase authentication enabled."
);

console.log(
  "🔥 Firebase products loading enabled."
);

console.log(
  "🛒 Cart system ready."
);

console.log(
  "👤 Account system ready."
);

console.log(
  "🎀 Hero controls ready."
);
