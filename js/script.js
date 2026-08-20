/* =====================================================
   ZOLA'S CLOSET
   KIDS WEAR STORE
   FIREBASE VERSION
   UPDATED PRODUCTION-READY FRONTEND
===================================================== */

import {
  auth,
  database,
  googleProvider,
  ref,
  set,
  get,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged
} from "./firebase.js";


/* =====================================================
   PRODUCT DATABASE
   TEMPORARY FRONTEND DATA
   LATER: FIREBASE / FIRESTORE
===================================================== */

const products = [

  {
    id: 1,
    name: "Pink Daisy Summer Dress",
    category: "girls",
    price: 499,
    oldPrice: 699,
    rating: 4.9,
    discount: 29,
    image: "YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "A cute and comfortable summer dress designed for little girls."
  },

  {
    id: 2,
    name: "Little Explorer T-Shirt Set",
    category: "boys",
    price: 399,
    oldPrice: 599,
    rating: 4.8,
    discount: 33,
    image: "YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Comfortable everyday outfit set made for active little explorers."
  },

  {
    id: 3,
    name: "Sweet Baby Romper",
    category: "baby",
    price: 349,
    oldPrice: 499,
    rating: 4.9,
    discount: 30,
    image: "YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Soft and comfortable baby romper perfect for everyday wear."
  },

  {
    id: 4,
    name: "Mini Princess Outfit Set",
    category: "sets",
    price: 599,
    oldPrice: 799,
    rating: 4.8,
    discount: 25,
    image: "YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Adorable outfit set designed for little princesses."
  },

  {
    id: 5,
    name: "Cute Bunny Kids Shirt",
    category: "girls",
    price: 299,
    oldPrice: 449,
    rating: 4.7,
    discount: 33,
    image: "YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Cute everyday shirt with a playful bunny design."
  },

  {
    id: 6,
    name: "Little Hero Casual Set",
    category: "boys",
    price: 449,
    oldPrice: 649,
    rating: 4.8,
    discount: 31,
    image: "YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "A comfortable casual outfit for everyday adventures."
  },

  {
    id: 7,
    name: "Baby Bear Cotton Set",
    category: "baby",
    price: 449,
    oldPrice: 599,
    rating: 4.9,
    discount: 25,
    image: "YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Soft cotton clothing set designed for babies."
  },

  {
    id: 8,
    name: "Rainbow Playtime Set",
    category: "sets",
    price: 549,
    oldPrice: 749,
    rating: 4.8,
    discount: 27,
    image: "YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Colorful and comfortable outfit set perfect for playtime."
  }

];


/* =====================================================
   APP STATE
===================================================== */

const featuredProducts =
  products.slice(0, 5);

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
   DOM HELPERS
===================================================== */

const $ = id =>
  document.getElementById(id);

const authOverlay =
  $("authOverlay");

const loginView =
  $("loginView");

const registerView =
  $("registerView");

const accountView =
  $("accountView");


/* =====================================================
   LOCAL STORAGE HELPER
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
   HERO RENDER
===================================================== */

function renderHero() {

  const track =
    $("heroTrack");

  const dots =
    $("heroDots");

  if (!track || !dots)
    return;


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
                  onclick="viewProduct(${product.id})"
                  type="button">

                  View Outfit →

                </button>


                <button
                  class="btn btn-secondary"
                  onclick="addToCart(${product.id})"
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


/* =====================================================
   HERO TITLES
===================================================== */

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


/* =====================================================
   UPDATE HERO
===================================================== */

function updateHero() {

  const track =
    $("heroTrack");

  const dots =
    document.querySelectorAll(
      ".hero-dot"
    );


  if (!track)
    return;


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


/* =====================================================
   NEXT HERO
===================================================== */

function nextHero() {

  if (!featuredProducts.length)
    return;


  heroIndex =
    (heroIndex + 1) %
    featuredProducts.length;


  updateHero();

  restartHeroTimer();

}


/* =====================================================
   PREVIOUS HERO
===================================================== */

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


/* =====================================================
   GO TO HERO
===================================================== */

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


/* =====================================================
   HERO TIMER
===================================================== */

function startHeroTimer() {

  clearInterval(heroTimer);


  if (featuredProducts.length <= 1)
    return;


  heroTimer =
    setInterval(
      () => {

        heroIndex =
          (heroIndex + 1) %
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


          return `

            <div
              class="product-card"
              data-product-id="${product.id}">

              <div class="product-image">

                <div class="discount">
                  -${product.discount}%
                </div>


                <button
                  class="
                    favorite
                    ${isFavorite ? "active" : ""}
                  "
                  onclick="favoriteProduct(this, ${product.id})"
                  aria-label="${
                    isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }"
                  type="button">

                  <svg
                    viewBox="0 0 24 24"
                    fill="${
                      isFavorite
                        ? "currentColor"
                        : "none"
                    }"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round">

                    <path
                      d="
                        M20.84 4.61
                        a5.5 5.5 0 0 0-7.78 0
                        L12 5.67
                        l-1.06-1.06
                        a5.5 5.5 0 0 0-7.78 7.78
                        l1.06 1.06
                        L12 21.23
                        l7.78-7.78
                        1.06-1.06
                        a5.5 5.5 0 0 0 0-7.78z
                      ">
                    </path>

                  </svg>

                </button>


                <img
                  src="${escapeHtml(product.image)}"
                  alt="${escapeHtml(product.name)}"
                  loading="lazy"
                  onerror="this.style.display='none'"
                >

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

                  <del>
                    ₱${product.oldPrice.toLocaleString()}
                  </del>

                </div>


                <div class="product-rating">
                  ⭐ ${product.rating}
                </div>


                <div class="product-actions">

                  <button
                    class="view-product"
                    onclick="viewProduct(${product.id})"
                    type="button">

                    View Outfit

                  </button>


                  <button
                    class="add-cart"
                    onclick="addToCart(${product.id})"
                    type="button">

                    🛍️ Add

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
   VIEW PRODUCT
===================================================== */

function viewProduct(id) {

  selectedProduct =
    products.find(
      product =>
        product.id === id
    );


  if (!selectedProduct)
    return;


  selectedQuantity = 1;

  renderProductDetails();


  const modal =
    $("productModal");


  if (modal)
    modal.classList.add("show");

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
          ${product.rating}
          · 128 reviews
        </div>


        <p class="product-detail-description">
          ${escapeHtml(product.description)}
        </p>


        <div class="product-detail-price">
          ₱${product.price.toLocaleString()}
        </div>


        <div class="product-detail-old-price">
          ₱${product.oldPrice.toLocaleString()}
        </div>


        <div class="product-quantity">

          <strong>
            Quantity:
          </strong>


          <button
            onclick="changeProductQuantity(-1)"
            type="button"
            aria-label="Decrease quantity">

            −

          </button>


          <span id="productQuantity">
            1
          </span>


          <button
            onclick="changeProductQuantity(1)"
            type="button"
            aria-label="Increase quantity">

            +

          </button>

        </div>


        <button
          class="product-buy"
          onclick="addSelectedProductToCart()"
          type="button">

          🛍️ Add to Bag

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

  selectedQuantity += amount;


  if (selectedQuantity < 1)
    selectedQuantity = 1;


  if (selectedQuantity > 99)
    selectedQuantity = 99;


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


  const existing =
    cart.find(
      item =>
        item.id ===
        selectedProduct.id
    );


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
   NORMALIZE CART
===================================================== */

function normalizeCart() {

  cart =
    cart
      .filter(item => {

        const product =
          products.find(
            p => p.id === item.id
          );

        return (
          product &&
          Number(item.quantity) > 0
        );

      })
      .map(item => ({

        id:
          item.id,

        quantity:
          Math.min(
            99,
            Math.max(
              1,
              Number(item.quantity)
            )
          )

      }));

}


/* =====================================================
   SAVE CART
===================================================== */

function saveCart() {

  normalizeCart();


  localStorage.setItem(
    "zolas-cart",
    JSON.stringify(cart)
  );


  renderCart();

  updateCartCount();

}


/* =====================================================
   ADD TO CART
===================================================== */

function addToCart(id) {

  const product =
    products.find(
      p => p.id === id
    );


  if (!product) {

    showToast(
      "Product not found."
    );

    return;

  }


  const existing =
    cart.find(
      item =>
        item.id === id
    );


  if (existing) {

    if (existing.quantity >= 99) {

      showToast(
        "Maximum quantity reached."
      );

      return;

    }

    existing.quantity++;

  } else {

    cart.push({

      id:
        id,

      quantity:
        1

    });

  }


  saveCart();


  showToast(
    `${product.name} added to your bag 🛍️`
  );

}


/* =====================================================
   CART COUNT
===================================================== */

function updateCartCount() {

  const count =
    cart.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
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
                p.id === item.id
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
                    onclick="changeQuantity(${product.id}, -1)"
                    type="button"
                    aria-label="Decrease quantity">

                    −

                  </button>


                  <span>
                    ${item.quantity}
                  </span>


                  <button
                    onclick="changeQuantity(${product.id}, 1)"
                    type="button"
                    aria-label="Increase quantity">

                    +

                  </button>


                  <button
                    class="remove"
                    onclick="removeFromCart(${product.id})"
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


/* =====================================================
   CART QUANTITY
===================================================== */

function changeQuantity(
  id,
  amount
) {

  const item =
    cart.find(
      i => i.id === id
    );


  if (!item)
    return;


  item.quantity += amount;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        i => i.id !== id
      );

  }


  if (item.quantity > 99) {

    item.quantity = 99;

    showToast(
      "Maximum quantity reached."
    );

  }


  saveCart();

}


/* =====================================================
   REMOVE FROM CART
===================================================== */

function removeFromCart(id) {

  const product =
    products.find(
      p => p.id === id
    );


  cart =
    cart.filter(
      item =>
        item.id !== id
    );


  saveCart();


  showToast(
    product
      ? `${product.name} removed from your bag`
      : "Product removed from your bag"
  );

}


/* =====================================================
   OPEN CART
===================================================== */

function openCart() {

  renderCart();


  const overlay =
    $("cartOverlay");


  if (overlay)
    overlay.classList.add("show");

}


/* =====================================================
   CLOSE CART
===================================================== */

function closeCart() {

  const overlay =
    $("cartOverlay");


  if (overlay)
    overlay.classList.remove("show");

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


/* =====================================================
   CLOSE CHECKOUT
===================================================== */

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
                p.id === item.id
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


  /* =================================================
     AUTO-FILL USER INFORMATION
  ================================================= */

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


/* =====================================================
   CHECKOUT TOTAL
===================================================== */

function updateCheckoutTotal() {

  let subtotal = 0;


  cart.forEach(
    item => {

      const product =
        products.find(
          p =>
            p.id === item.id
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
      ? Number(shippingElement.value || 0)
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


  const nameElement =
    $("customerName");

  const emailElement =
    $("customerEmail");

  const phoneElement =
    $("customerPhone");

  const addressElement =
    $("customerAddress");

  const cityElement =
    $("customerCity");

  const provinceElement =
    $("customerProvince");


  const name =
    nameElement
      ? nameElement.value.trim()
      : "";

  const email =
    emailElement
      ? emailElement.value.trim()
      : "";

  const phone =
    phoneElement
      ? phoneElement.value.trim()
      : "";

  const address =
    addressElement
      ? addressElement.value.trim()
      : "";

  const city =
    cityElement
      ? cityElement.value.trim()
      : "";

  const province =
    provinceElement
      ? provinceElement.value.trim()
      : "";


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


  const paymentElement =
    $("paymentMethod");


  const paymentMethod =
    paymentElement
      ? paymentElement.value
      : "Not specified";


  const shippingElement =
    $("shippingMethod");


  const shipping =
    shippingElement
      ? Number(
          shippingElement.value || 0
        )
      : 0;


  let subtotal = 0;


  const orderItems =
    cart
      .map(
        item => {

          const product =
            products.find(
              p =>
                p.id === item.id
            );


          if (!product)
            return null;


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


    /* =================================================
       SAVE COMPLETE ORDER
    ================================================= */

    const orderRef =
      ref(
        database,
        `orders/${currentUser.uid}/${orderNumber}`
      );


    await set(
      orderRef,
      orderData
    );


    /* =================================================
       SAVE ORDER SUMMARY
    ================================================= */

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


/* =====================================================
   FINISH ORDER
===================================================== */

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
    favorites.indexOf(
      productId
    );


  if (index === -1) {

    favorites.push(
      productId
    );

    button.classList.add(
      "active"
    );


    button.setAttribute(
      "aria-label",
      "Remove from favorites"
    );


    const svg =
      button.querySelector("svg");


    if (svg) {

      svg.setAttribute(
        "fill",
        "currentColor"
      );

    }


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


    button.setAttribute(
      "aria-label",
      "Add to favorites"
    );


    const svg =
      button.querySelector("svg");


    if (svg) {

      svg.setAttribute(
        "fill",
        "none"
      );

    }


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

  return String(value ?? "")

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


/* =====================================================
   OPEN LOGIN
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


/* =====================================================
   OPEN REGISTER
===================================================== */

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


/* =====================================================
   OPEN ACCOUNT
===================================================== */

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


/* =====================================================
   CLOSE AUTH
===================================================== */

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
    async function (event) {

      event.preventDefault();


      const nameElement =
        $("registerName");

      const emailElement =
        $("registerEmail");

      const passwordElement =
        $("registerPassword");


      const name =
        nameElement
          ? nameElement.value.trim()
          : "";

      const email =
        emailElement
          ? emailElement.value.trim()
          : "";

      const password =
        passwordElement
          ? passwordElement.value
          : "";


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


      try {

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
    async function (event) {

      event.preventDefault();


      const emailElement =
        $("loginEmail");

      const passwordElement =
        $("loginPassword");


      const email =
        emailElement
          ? emailElement.value.trim()
          : "";

      const password =
        passwordElement
          ? passwordElement.value
          : "";


      if (!email || !password) {

        showToast(
          "Please enter your email and password."
        );

        return;

      }


      try {

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

      }

    }
  );

}


/* =====================================================
   GOOGLE LOGIN
===================================================== */

async function loginWithGoogle() {

  try {

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

  }

}


/* =====================================================
   GOOGLE LOGIN BUTTON
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
    async function () {

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


    profileBtn.removeAttribute(
      "title"
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
   FIREBASE ERROR HANDLER
===================================================== */

function handleFirebaseAuthError(
  error
) {

  showToast(
    getFirebaseErrorMessage(error)
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


    case "auth/network-request-failed":

      return "Network error. Please check your internet connection.";


    case "auth/too-many-requests":

      return "Too many attempts. Please try again later.";


    case "auth/user-disabled":

      return "This account has been disabled.";


    case "auth/operation-not-allowed":

      return "This sign-in method is currently unavailable.";


    default:

      return (
        error.message ||
        "Something went wrong. Please try again."
      );

  }

}


/* =====================================================
   GLOBAL FUNCTIONS
   HTML onclick="" NEEDS THESE
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

window.openLogin =
  openLogin;

window.openRegister =
  openRegister;

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


/* =====================================================
   READY
===================================================== */

console.log(
  "🎀 Zola's Closet initialized successfully."
);

console.log(
  "🛍️ Products:",
  products.length
);

console.log(
  "🛒 Cart items:",
  cart.length
);

console.log(
  "♡ Favorites:",
  favorites.length
);
