/* =====================================================
   ZOLA'S CLOSET
   KIDS WEAR STORE
   FIREBASE VERSION
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
   TEMPORARY PRODUCT DATA
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
   HERO
===================================================== */

const featuredProducts = products.slice(0, 5);

let heroIndex = 0;
let heroTimer = null;


/* =====================================================
   CART
===================================================== */

let cart =
  JSON.parse(
    localStorage.getItem("zolas-cart")
  ) || [];


/* =====================================================
   FILTER
===================================================== */

let currentCategory = "all";


/* =====================================================
   PRODUCT DETAILS
===================================================== */

let selectedProduct = null;
let selectedQuantity = 1;


/* =====================================================
   FIREBASE USER
===================================================== */

let currentUser = null;


/* =====================================================
   AUTH ELEMENTS
===================================================== */

const authOverlay =
  document.getElementById("authOverlay");

const loginView =
  document.getElementById("loginView");

const registerView =
  document.getElementById("registerView");

const accountView =
  document.getElementById("accountView");


/* =====================================================
   HERO RENDER
===================================================== */

function renderHero() {

  const track =
    document.getElementById("heroTrack");

  const dots =
    document.getElementById("heroDots");

  if (!track || !dots) return;

  track.innerHTML =
    featuredProducts
      .map(
        (product, index) => `

        <div class="hero-slide">

          <div class="hero-product-visual">

            <div class="hero-product-circle">

              <img
                src="${product.image}"
                alt="${escapeHtml(product.name)}">

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

            <div class="hero-slide-actions">

              <button
                class="btn btn-primary"
                onclick="viewProduct(${product.id})">

                View Outfit →

              </button>


              <button
                class="btn btn-secondary"
                onclick="addToCart(${product.id})">

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
            ${index === 0 ? "active" : ""}
          "
          onclick="goToHero(${index})"
          aria-label="
            Go to featured product
            ${index + 1}
          ">
        </button>

        `
      )
      .join("");


  updateHero();

}


/* =====================================================
   HERO TITLES
===================================================== */

function getHeroTitle(product, index) {

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
    document.getElementById("heroTrack");

  const dots =
    document.querySelectorAll(".hero-dot");

  if (!track) return;

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

  heroIndex++;

  if (
    heroIndex >=
    featuredProducts.length
  ) {

    heroIndex = 0;

  }

  updateHero();

  restartHeroTimer();

}


/* =====================================================
   PREVIOUS HERO
===================================================== */

function previousHero() {

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

  heroIndex = index;

  updateHero();

  restartHeroTimer();

}


/* =====================================================
   HERO TIMER
===================================================== */

function startHeroTimer() {

  clearInterval(heroTimer);

  heroTimer =
    setInterval(
      () => {

        heroIndex++;

        if (
          heroIndex >=
          featuredProducts.length
        ) {

          heroIndex = 0;

        }

        updateHero();

      },
      4500
    );

}


function restartHeroTimer() {

  startHeroTimer();

}


/* =====================================================
   HERO BUTTONS
===================================================== */

const heroNext =
  document.getElementById("heroNext");

const heroPrev =
  document.getElementById("heroPrev");

const heroSlider =
  document.getElementById("heroSlider");


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
    () => clearInterval(heroTimer)
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
    document.getElementById("products");

  const searchInput =
    document.getElementById("searchInput");

  if (!container) return;

  const search =
    searchInput
      ? searchInput.value.toLowerCase().trim()
      : "";


  const filtered =
    products.filter(
      product => {

        const categoryMatch =
          currentCategory === "all" ||
          product.category === currentCategory;


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


  if (filtered.length === 0) {

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
        product => `

        <div class="product-card">

          <div class="product-image">

            <div class="discount">
              -${product.discount}%
            </div>


            <button
              class="favorite"
              onclick="favoriteProduct(this, ${product.id})"
              aria-label="Add to favorites"
              type="button">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">

                <path
                  d="M20.84 4.61
                     a5.5 5.5 0 0 0-7.78 0
                     L12 5.67
                     l-1.06-1.06
                     a5.5 5.5 0 0 0-7.78 7.78
                     l1.06 1.06
                     L12 21.23
                     l7.78-7.78
                     1.06-1.06
                     a5.5 5.5 0 0 0 0-7.78z">
                </path>

              </svg>

            </button>


            <img
              src="${product.image}"
              alt="${escapeHtml(product.name)}">

          </div>


          <div class="product-info">

            <h3>
              ${escapeHtml(product.name)}
            </h3>


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

        `
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


  if (!selectedProduct) return;


  selectedQuantity = 1;

  renderProductDetails();


  document
    .getElementById("productModal")
    .classList.add("show");

}


/* =====================================================
   PRODUCT DETAILS
===================================================== */

function renderProductDetails() {

  const product =
    selectedProduct;


  document
    .getElementById("productDetails")
    .innerHTML = `

    <div class="product-detail">

      <div class="product-detail-image">

        <img
          src="${product.image}"
          alt="${escapeHtml(product.name)}">

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

function changeProductQuantity(amount) {

  selectedQuantity += amount;


  if (selectedQuantity < 1) {

    selectedQuantity = 1;

  }


  const quantityElement =
    document.getElementById(
      "productQuantity"
    );


  if (quantityElement) {

    quantityElement.textContent =
      selectedQuantity;

  }

}


/* =====================================================
   ADD SELECTED PRODUCT
===================================================== */

function addSelectedProductToCart() {

  if (!selectedProduct) return;


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


  saveCart();


  const productName =
    selectedProduct.name;


  closeProduct();


  showToast(
    productName +
    " added to your bag 🛍️"
  );

}


/* =====================================================
   CLOSE PRODUCT
===================================================== */

function closeProduct() {

  const modal =
    document.getElementById("productModal");

  if (modal) {

    modal.classList.remove("show");

  }

}


/* =====================================================
   ADD TO CART
===================================================== */

function addToCart(id) {

  const product =
    products.find(
      p => p.id === id
    );


  if (!product) return;


  const existing =
    cart.find(
      item =>
        item.id === id
    );


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({

      id: id,
      quantity: 1

    });

  }


  saveCart();


  showToast(
    product.name +
    " added to your bag 🛍️"
  );

}


/* =====================================================
   SAVE CART
===================================================== */

function saveCart() {

  localStorage.setItem(
    "zolas-cart",
    JSON.stringify(cart)
  );


  renderCart();

  updateCartCount();

}


/* =====================================================
   CART COUNT
===================================================== */

function updateCartCount() {

  const count =
    cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );


  const cartCount =
    document.getElementById("cartCount");


  if (cartCount) {

    cartCount.textContent =
      count;

  }

}


/* =====================================================
   RENDER CART
===================================================== */

function renderCart() {

  const container =
    document.getElementById("cartItems");

  if (!container) return;


  if (cart.length === 0) {

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


    document
      .getElementById("cartTotal")
      .textContent =
      "₱0";


    return;

  }


  let total = 0;


  container.innerHTML =
    cart.map(
      item => {

        const product =
          products.find(
            p =>
              p.id ===
              item.id
          );


        if (!product) return "";


        const subtotal =
          product.price *
          item.quantity;


        total += subtotal;


        return `

          <div class="cart-item">

            <div class="cart-item-image">

              <img
                src="${product.image}"
                alt="${escapeHtml(product.name)}">

            </div>


            <div>

              <h4>
                ${escapeHtml(product.name)}
              </h4>


              <div class="cart-item-price">
                ₱${subtotal.toLocaleString()}
              </div>


              <div class="quantity">

                <button
                  onclick="changeQuantity(${product.id}, -1)"
                  type="button">

                  −

                </button>


                <span>
                  ${item.quantity}
                </span>


                <button
                  onclick="changeQuantity(${product.id}, 1)"
                  type="button">

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


  document
    .getElementById("cartTotal")
    .textContent =
      "₱" +
      total.toLocaleString();

}


/* =====================================================
   CART QUANTITY
===================================================== */

function changeQuantity(id, amount) {

  const item =
    cart.find(
      i => i.id === id
    );


  if (!item) return;


  item.quantity += amount;


  if (item.quantity <= 0) {

    cart =
      cart.filter(
        i => i.id !== id
      );

  }


  saveCart();

}


/* =====================================================
   REMOVE
===================================================== */

function removeFromCart(id) {

  cart =
    cart.filter(
      item =>
        item.id !== id
    );


  saveCart();


  showToast(
    "Product removed from your bag"
  );

}


/* =====================================================
   OPEN CART
===================================================== */

function openCart() {

  renderCart();


  document
    .getElementById("cartOverlay")
    .classList.add("show");

}


/* =====================================================
   CLOSE CART
===================================================== */

function closeCart() {

  document
    .getElementById("cartOverlay")
    .classList.remove("show");

}


/* =====================================================
   CHECKOUT
===================================================== */

function startCheckout() {

  if (cart.length === 0) {

    showToast(
      "Your cart is empty"
    );

    return;

  }


  /* =================================================
     USER MUST BE LOGGED IN
  ================================================= */

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


  document
    .getElementById("checkoutOverlay")
    .classList.add("show");

}


/* =====================================================
   CLOSE CHECKOUT
===================================================== */

function closeCheckout() {

  document
    .getElementById("checkoutOverlay")
    .classList.remove("show");

}


/* =====================================================
   CHECKOUT RENDER
===================================================== */

function renderCheckout() {

  const container =
    document.getElementById("checkoutItems");


  let subtotal = 0;


  container.innerHTML =
    cart.map(
      item => {

        const product =
          products.find(
            p =>
              p.id === item.id
          );


        if (!product) return "";


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


  document
    .getElementById("checkoutSubtotal")
    .textContent =
      "₱" +
      subtotal.toLocaleString();


  /* =================================================
     AUTO-FILL USER INFORMATION
  ================================================= */

  const customerEmail =
    document.getElementById("customerEmail");


  if (customerEmail && currentUser) {

    customerEmail.value =
      currentUser.email || "";

  }


  const customerName =
    document.getElementById("customerName");


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
    document.getElementById(
      "shippingMethod"
    );


  const shipping =
    shippingElement
      ? Number(shippingElement.value)
      : 0;


  document
    .getElementById("checkoutShipping")
    .textContent =

      shipping === 0
        ? "FREE"
        : "₱" +
          shipping.toLocaleString();


  document
    .getElementById("checkoutTotal")
    .textContent =
      "₱" +
      (
        subtotal +
        shipping
      ).toLocaleString();

}


/* =====================================================
   PLACE ORDER
   SAVE TO FIREBASE REALTIME DATABASE
===================================================== */

async function placeOrder() {

  if (!currentUser) {

    showToast(
      "Please sign in before placing your order."
    );

    closeCheckout();

    openLogin();

    return;

  }


  const name =
    document
      .getElementById("customerName")
      .value
      .trim();


  const email =
    document
      .getElementById("customerEmail")
      .value
      .trim();


  const phone =
    document
      .getElementById("customerPhone")
      .value
      .trim();


  const address =
    document
      .getElementById("customerAddress")
      .value
      .trim();


  const city =
    document
      .getElementById("customerCity")
      .value
      .trim();


  const province =
    document
      .getElementById("customerProvince")
      .value
      .trim();


  if (
    !name ||
    !email ||
    !phone ||
    !address ||
    !city ||
    !province
  ) {

    showToast(
      "Please complete your information"
    );

    return;

  }


  const paymentMethod =
    document
      .getElementById("paymentMethod")
      .value;


  const shippingMethod =
    document
      .getElementById("shippingMethod");


  const shipping =
    shippingMethod
      ? Number(shippingMethod.value)
      : 0;


  let subtotal = 0;


  const orderItems =
    cart.map(
      item => {

        const product =
          products.find(
            p =>
              p.id === item.id
          );


        if (!product) return null;


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


  const total =
    subtotal +
    shipping;


  const orderNumber =
    "ZC" +
    Date.now()
      .toString()
      .slice(-8);


  const orderData = {

    orderNumber:

      orderNumber,

    userId:

      currentUser.uid,

    customer: {

      name:
        name,

      email:
        email,

      phone:
        phone

    },

    shippingAddress: {

      address:
        address,

      city:
        city,

      province:
        province

    },

    items:
      orderItems,

    subtotal:
      subtotal,

    shipping:
      shipping,

    total:
      total,

    paymentMethod:
      paymentMethod,

    status:
      "pending",

    createdAt:
      new Date().toISOString()

  };


  try {

    /*
      Save order using UID + order number
    */

    const orderRef =
      ref(
        database,
        `orders/${currentUser.uid}/${orderNumber}`
      );


    await set(
      orderRef,
      orderData
    );


    /*
      Also save latest order reference
      under the user's account
    */

    const userOrderRef =
      ref(
        database,
        `users/${currentUser.uid}/orders/${orderNumber}`
      );


    await set(
      userOrderRef,
      {

        orderNumber:
          orderNumber,

        total:
          total,

        status:
          "pending",

        createdAt:
          orderData.createdAt

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
      "Unable to place order. Please try again."
    );

  }

}


/* =====================================================
   ORDER SUCCESS
===================================================== */

function showOrderSuccess(
  name,
  orderNumber,
  paymentMethod
) {

  document
    .getElementById("checkoutContent")
    .innerHTML = `

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
   FAVORITE
===================================================== */

function favoriteProduct(button, productId) {

  button.classList.toggle("active");


  if (button.classList.contains("active")) {

    showToast(
      "Added to favorites ♡"
    );

  } else {

    showToast(
      "Removed from favorites"
    );

  }

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

  const toast =
    document.getElementById("toast");


  if (!toast) return;


  toast.textContent =
    message;


  toast.classList.add("show");


  setTimeout(
    () => {

      toast.classList.remove("show");

    },
    2000
  );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

  return String(value)

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
  document.getElementById(
    "searchInput"
  );


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
            this.dataset.category;


          renderProducts();

        }
      );

    }
  );


/* =====================================================
   THEME
===================================================== */

const themeBtn =
  document.getElementById(
    "themeBtn"
  );


if (
  localStorage.getItem(
    "zolas-theme"
  ) === "dark"
) {

  document.body.classList.add(
    "dark"
  );

}


if (themeBtn) {

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


      /*
        Keep SVG icon.
        CSS can handle the visual state.
      */

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
  document.getElementById(
    "cartBtn"
  );


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
  document.getElementById(
    "cartOverlay"
  );


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
  document.getElementById(
    "productModal"
  );


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
  document.getElementById(
    "checkoutOverlay"
  );


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
  document.getElementById(
    "shippingMethod"
  );


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
   FIREBASE AUTHENTICATION
===================================================== */


/* =====================================================
   OPEN LOGIN
===================================================== */

function openLogin() {

  loginView.classList.remove(
    "hidden"
  );

  registerView.classList.add(
    "hidden"
  );

  accountView.classList.add(
    "hidden"
  );

  authOverlay.classList.add(
    "show"
  );

}


/* =====================================================
   OPEN REGISTER
===================================================== */

function openRegister() {

  loginView.classList.add(
    "hidden"
  );

  registerView.classList.remove(
    "hidden"
  );

  accountView.classList.add(
    "hidden"
  );

  authOverlay.classList.add(
    "show"
  );

}


/* =====================================================
   ACCOUNT VIEW
===================================================== */

function openAccount() {

  if (!currentUser) {

    openLogin();

    return;

  }


  loginView.classList.add(
    "hidden"
  );

  registerView.classList.add(
    "hidden"
  );

  accountView.classList.remove(
    "hidden"
  );


  const accountName =
    document.getElementById(
      "accountName"
    );


  const accountEmail =
    document.getElementById(
      "accountEmail"
    );


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


  authOverlay.classList.add(
    "show"
  );

}


/* =====================================================
   CLOSE AUTH
===================================================== */

function closeAuth() {

  if (!authOverlay) return;

  authOverlay.classList.remove(
    "show"
  );

}


/* =====================================================
   FIREBASE REGISTER
===================================================== */

const registerForm =
  document.getElementById(
    "registerForm"
  );


if (registerForm) {

  registerForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const name =
        document
          .getElementById("registerName")
          .value
          .trim();


      const email =
        document
          .getElementById("registerEmail")
          .value
          .trim();


      const password =
        document
          .getElementById("registerPassword")
          .value;


      if (!name) {

        showToast(
          "Please enter your name."
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


        /*
          Save display name
          inside Firebase Auth
        */

        await updateProfile(
          user,
          {
            displayName: name
          }
        );


        /*
          Save customer profile
          to Realtime Database
        */

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

            createdAt:
              new Date().toISOString()

          }
        );


        showToast(
          "Account created successfully! ✨"
        );


        registerForm.reset();

        closeAuth();


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
   FIREBASE LOGIN
===================================================== */

const loginForm =
  document.getElementById(
    "loginForm"
  );


if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const email =
        document
          .getElementById("loginEmail")
          .value
          .trim();


      const password =
        document
          .getElementById("loginPassword")
          .value;


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


    /*
      Check if profile already exists
    */

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
   OPTIONAL
   If we add button later:
   id="googleLoginBtn"
===================================================== */

const googleLoginBtn =
  document.getElementById(
    "googleLoginBtn"
  );


if (googleLoginBtn) {

  googleLoginBtn.addEventListener(
    "click",
    loginWithGoogle
  );

}


/* =====================================================
   FIREBASE LOGOUT
===================================================== */

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );


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

    currentUser = user || null;


    updateAuthUI();


    if (user) {

      /*
        Make sure customer profile exists
      */

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

  }
);


/* =====================================================
   AUTH UI
===================================================== */

function updateAuthUI() {

  const profileBtn =
    document.getElementById(
      "profileBtn"
    );


  if (!profileBtn)
    return;


  if (currentUser) {

    profileBtn.classList.add(
      "logged-in"
    );

    profileBtn.setAttribute(
      "title",
      currentUser.displayName
        ? currentUser.displayName
        : currentUser.email
    );

  } else {

    profileBtn.classList.remove(
      "logged-in"
    );

    profileBtn.removeAttribute(
      "title"
    );

  }

}


/* =====================================================
   AUTH BUTTON EVENTS
===================================================== */

const profileBtn =
  document.getElementById(
    "profileBtn"
  );


if (profileBtn) {

  profileBtn.addEventListener(
    "click",
    openAccount
  );

}


const authClose =
  document.getElementById(
    "authClose"
  );


if (authClose) {

  authClose.addEventListener(
    "click",
    closeAuth
  );

}


const showRegister =
  document.getElementById(
    "showRegister"
  );


if (showRegister) {

  showRegister.addEventListener(
    "click",
    openRegister
  );

}


const showLogin =
  document.getElementById(
    "showLogin"
  );


if (showLogin) {

  showLogin.addEventListener(
    "click",
    openLogin
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
   FIREBASE AUTH ERROR HANDLER
===================================================== */

function handleFirebaseAuthError(
  error
) {

  let message =
    "Something went wrong. Please try again.";


  switch (error.code) {

    case "auth/email-already-in-use":

      message =
        "This email is already registered.";

      break;


    case "auth/invalid-email":

      message =
        "Please enter a valid email address.";

      break;


    case "auth/weak-password":

      message =
        "Password is too weak. Use at least 6 characters.";

      break;


    case "auth/user-not-found":

      message =
        "No account found with this email.";

      break;


    case "auth/wrong-password":

      message =
        "Incorrect password.";

      break;


    case "auth/invalid-credential":

      message =
        "Incorrect email or password.";

      break;


    case "auth/popup-closed-by-user":

      message =
        "Google sign-in was cancelled.";

      break;


    case "auth/popup-blocked":

      message =
        "Your browser blocked the Google sign-in popup.";

      break;


    case "auth/network-request-failed":

      message =
        "Network error. Please check your internet connection.";

      break;

  }


  showToast(message);

}


/* =====================================================
   GLOBAL FUNCTIONS
   Needed because HTML uses onclick=""
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

renderHero();

renderProducts();

renderCart();

updateCartCount();

updateAuthUI();

startHeroTimer();
