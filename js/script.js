/* =====================================================
   ZOLA'S CLOSET
   KIDS WEAR STORE
===================================================== */


/* =====================================================
   PRODUCT DATABASE
   TEMPORARY DATA
   LATER: FIREBASE FIRESTORE
===================================================== */

const products = [

  {
    id:1,
    name:"Pink Daisy Summer Dress",
    category:"girls",
    price:499,
    oldPrice:699,
    rating:4.9,
    discount:29,
    image:"YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "A cute and comfortable summer dress designed for little girls."
  },

  {
    id:2,
    name:"Little Explorer T-Shirt Set",
    category:"boys",
    price:399,
    oldPrice:599,
    rating:4.8,
    discount:33,
    image:"YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Comfortable everyday outfit set made for active little explorers."
  },

  {
    id:3,
    name:"Sweet Baby Romper",
    category:"baby",
    price:349,
    oldPrice:499,
    rating:4.9,
    discount:30,
    image:"YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Soft and comfortable baby romper perfect for everyday wear."
  },

  {
    id:4,
    name:"Mini Princess Outfit Set",
    category:"sets",
    price:599,
    oldPrice:799,
    rating:4.8,
    discount:25,
    image:"YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Adorable outfit set designed for little princesses."
  },

  {
    id:5,
    name:"Cute Bunny Kids Shirt",
    category:"girls",
    price:299,
    oldPrice:449,
    rating:4.7,
    discount:33,
    image:"YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Cute everyday shirt with a playful bunny design."
  },

  {
    id:6,
    name:"Little Hero Casual Set",
    category:"boys",
    price:449,
    oldPrice:649,
    rating:4.8,
    discount:31,
    image:"YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "A comfortable casual outfit for everyday adventures."
  },

  {
    id:7,
    name:"Baby Bear Cotton Set",
    category:"baby",
    price:449,
    oldPrice:599,
    rating:4.9,
    discount:25,
    image:"YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Soft cotton clothing set designed for babies."
  },

  {
    id:8,
    name:"Rainbow Playtime Set",
    category:"sets",
    price:549,
    oldPrice:749,
    rating:4.8,
    discount:27,
    image:"YOUR_CLOUDINARY_IMAGE_URL",
    description:
      "Colorful and comfortable outfit set perfect for playtime."
  }

];


/* =====================================================
   HERO
===================================================== */

const featuredProducts =
  products.slice(0,5);

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
   HERO RENDER
===================================================== */

function renderHero(){

  const track =
    document.getElementById(
      "heroTrack"
    );

  const dots =
    document.getElementById(
      "heroDots"
    );


  track.innerHTML =
    featuredProducts
      .map(
        (product,index) => `

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
              ${getHeroTitle(product,index)}
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
        (product,index) => `

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

function getHeroTitle(product,index){

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
    titles[index]
    ||
    `
    Little Looks.
    <span>Big Style.</span>
    `
  );

}


/* =====================================================
   UPDATE HERO
===================================================== */

function updateHero(){

  const track =
    document.getElementById(
      "heroTrack"
    );

  const dots =
    document.querySelectorAll(
      ".hero-dot"
    );


  track.style.transform =
    `translateX(-${heroIndex * 100}%)`;


  dots.forEach(
    (dot,index) => {

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

function nextHero(){

  heroIndex++;

  if(
    heroIndex >=
    featuredProducts.length
  ){

    heroIndex = 0;

  }

  updateHero();

  restartHeroTimer();

}


/* =====================================================
   PREVIOUS HERO
===================================================== */

function previousHero(){

  heroIndex--;

  if(heroIndex < 0){

    heroIndex =
      featuredProducts.length - 1;

  }

  updateHero();

  restartHeroTimer();

}


/* =====================================================
   GO TO HERO
===================================================== */

function goToHero(index){

  heroIndex = index;

  updateHero();

  restartHeroTimer();

}


/* =====================================================
   HERO TIMER
===================================================== */

function startHeroTimer(){

  clearInterval(heroTimer);

  heroTimer =
    setInterval(
      () => {

        heroIndex++;

        if(
          heroIndex >=
          featuredProducts.length
        ){

          heroIndex = 0;

        }

        updateHero();

      },
      4500
    );

}


function restartHeroTimer(){

  startHeroTimer();

}


/* =====================================================
   HERO BUTTONS
===================================================== */

document
  .getElementById("heroNext")
  .addEventListener(
    "click",
    nextHero
  );


document
  .getElementById("heroPrev")
  .addEventListener(
    "click",
    previousHero
  );


/* =====================================================
   HERO HOVER
===================================================== */

document
  .getElementById("heroSlider")
  .addEventListener(
    "mouseenter",
    () => clearInterval(heroTimer)
  );


document
  .getElementById("heroSlider")
  .addEventListener(
    "mouseleave",
    startHeroTimer
  );


/* =====================================================
   PRODUCTS
===================================================== */

function renderProducts(){

  const container =
    document.getElementById(
      "products"
    );


  const search =
    document
      .getElementById(
        "searchInput"
      )
      .value
      .toLowerCase()
      .trim();


  const filtered =
    products.filter(
      product => {

        const categoryMatch =
          currentCategory === "all"
          ||
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


  if(filtered.length === 0){

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
  onclick="favoriteProduct(this)"
  aria-label="Add to favorites">

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
                onclick="
                  viewProduct(${product.id})
                ">

                View Outfit

              </button>


              <button
                class="add-cart"
                onclick="
                  addToCart(${product.id})
                ">

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

function viewProduct(id){

  selectedProduct =
    products.find(
      product =>
        product.id === id
    );


  if(!selectedProduct)
    return;


  selectedQuantity = 1;

  renderProductDetails();


  document
    .getElementById(
      "productModal"
    )
    .classList.add("show");

}


/* =====================================================
   PRODUCT DETAILS
===================================================== */

function renderProductDetails(){

  const product =
    selectedProduct;


  document
    .getElementById(
      "productDetails"
    )
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
            onclick="
              changeProductQuantity(-1)
            ">
            −
          </button>


          <span id="productQuantity">
            1
          </span>


          <button
            onclick="
              changeProductQuantity(1)
            ">
            +
          </button>

        </div>


        <button
          class="product-buy"
          onclick="
            addSelectedProductToCart()
          ">

          🛍️ Add to Bag

        </button>

      </div>

    </div>

  `;

}


/* =====================================================
   PRODUCT QUANTITY
===================================================== */

function changeProductQuantity(amount){

  selectedQuantity += amount;


  if(selectedQuantity < 1){

    selectedQuantity = 1;

  }


  const quantityElement =
    document.getElementById(
      "productQuantity"
    );


  if(quantityElement){

    quantityElement.textContent =
      selectedQuantity;

  }

}


/* =====================================================
   ADD SELECTED PRODUCT
===================================================== */

function addSelectedProductToCart(){

  if(!selectedProduct)
    return;


  const existing =
    cart.find(
      item =>
        item.id ===
        selectedProduct.id
    );


  if(existing){

    existing.quantity +=
      selectedQuantity;

  }else{

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

function closeProduct(){

  document
    .getElementById(
      "productModal"
    )
    .classList.remove("show");

}


/* =====================================================
   ADD TO CART
===================================================== */

function addToCart(id){

  const product =
    products.find(
      p => p.id === id
    );


  if(!product)
    return;


  const existing =
    cart.find(
      item =>
        item.id === id
    );


  if(existing){

    existing.quantity++;

  }else{

    cart.push({

      id:id,
      quantity:1

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

function saveCart(){

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

function updateCartCount(){

  const count =
    cart.reduce(
      (sum,item) =>
        sum + item.quantity,
      0
    );


  document
    .getElementById(
      "cartCount"
    )
    .textContent = count;

}


/* =====================================================
   RENDER CART
===================================================== */

function renderCart(){

  const container =
    document.getElementById(
      "cartItems"
    );


  if(cart.length === 0){

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
      .getElementById(
        "cartTotal"
      )
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


        if(!product)
          return "";


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
                  onclick="
                    changeQuantity(
                      ${product.id},
                      -1
                    )
                  ">
                  −
                </button>


                <span>
                  ${item.quantity}
                </span>


                <button
                  onclick="
                    changeQuantity(
                      ${product.id},
                      1
                    )
                  ">
                  +
                </button>


                <button
                  class="remove"
                  onclick="
                    removeFromCart(
                      ${product.id}
                    )
                  ">

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
    .getElementById(
      "cartTotal"
    )
    .textContent =
      "₱" +
      total.toLocaleString();

}


/* =====================================================
   CART QUANTITY
===================================================== */

function changeQuantity(id,amount){

  const item =
    cart.find(
      i => i.id === id
    );


  if(!item)
    return;


  item.quantity += amount;


  if(item.quantity <= 0){

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

function removeFromCart(id){

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

function openCart(){

  renderCart();


  document
    .getElementById(
      "cartOverlay"
    )
    .classList.add("show");

}


/* =====================================================
   CLOSE CART
===================================================== */

function closeCart(){

  document
    .getElementById(
      "cartOverlay"
    )
    .classList.remove("show");

}


/* =====================================================
   CHECKOUT
===================================================== */

function startCheckout(){

  /* =================================================
     CHECK CART
  ================================================= */

  if(cart.length === 0){

    showToast(
      "Your cart is empty"
    );

    return;

  }


  /* =================================================
     CHECK LOGIN
  ================================================= */

  if(!currentUser){

    closeCart();

    openLogin();


    showToast(
      "Please sign in before checkout."
    );


    return;

  }


  /* =================================================
     LOGGED IN → CHECKOUT
  ================================================= */

  closeCart();

  renderCheckout();


  document
    .getElementById(
      "checkoutOverlay"
    )
    .classList.add("show");

}


/* =====================================================
   CLOSE CHECKOUT
===================================================== */

function closeCheckout(){

  document
    .getElementById(
      "checkoutOverlay"
    )
    .classList.remove("show");

}


/* =====================================================
   CHECKOUT RENDER
===================================================== */

function renderCheckout(){

  const container =
    document.getElementById(
      "checkoutItems"
    );


  let subtotal = 0;


  container.innerHTML =
    cart.map(
      item => {

        const product =
          products.find(
            p =>
              p.id === item.id
          );


        if(!product)
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


  document
    .getElementById(
      "checkoutSubtotal"
    )
    .textContent =
      "₱" +
      subtotal.toLocaleString();


  updateCheckoutTotal();

}


/* =====================================================
   CHECKOUT TOTAL
===================================================== */

function updateCheckoutTotal(){

  let subtotal = 0;


  cart.forEach(
    item => {

      const product =
        products.find(
          p =>
            p.id === item.id
        );


      if(product){

        subtotal +=
          product.price *
          item.quantity;

      }

    }
  );


  const shipping =
    Number(
      document
        .getElementById(
          "shippingMethod"
        )
        .value
    );


  document
    .getElementById(
      "checkoutShipping"
    )
    .textContent =

      shipping === 0
      ?
      "FREE"
      :
      "₱" +
      shipping.toLocaleString();


  document
    .getElementById(
      "checkoutTotal"
    )
    .textContent =
      "₱" +
      (
        subtotal +
        shipping
      ).toLocaleString();

}


/* =====================================================
   PLACE ORDER
===================================================== */

function placeOrder(){

  const name =
    document
      .getElementById(
        "customerName"
      )
      .value
      .trim();


  const email =
    document
      .getElementById(
        "customerEmail"
      )
      .value
      .trim();


  const phone =
    document
      .getElementById(
        "customerPhone"
      )
      .value
      .trim();


  const address =
    document
      .getElementById(
        "customerAddress"
      )
      .value
      .trim();


  const city =
    document
      .getElementById(
        "customerCity"
      )
      .value
      .trim();


  const province =
    document
      .getElementById(
        "customerProvince"
      )
      .value
      .trim();


  if(
    !name ||
    !email ||
    !phone ||
    !address ||
    !city ||
    !province
  ){

    showToast(
      "Please complete your information"
    );

    return;

  }


  const orderNumber =
    "ZC" +
    Date.now()
      .toString()
      .slice(-6);


  const paymentMethod =
    document
      .getElementById(
        "paymentMethod"
      )
      .value;


  document
    .getElementById(
      "checkoutContent"
    )
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
            #${orderNumber}
          </strong>

        </p>


        <p>
          Payment:
          ${escapeHtml(paymentMethod)}
        </p>


        <button
          class="place-order"
          onclick="finishOrder()">

          Continue Shopping

        </button>

      </div>

    `;

}


/* =====================================================
   FINISH ORDER
===================================================== */

function finishOrder(){

  cart = [];

  saveCart();

  closeCheckout();

  location.reload();

}


/* =====================================================
   FAVORITE
===================================================== */

function favoriteProduct(button){

  button.classList.toggle("active");

  if(button.classList.contains("active")){

    showToast("Added to favorites ♡");

  }else{

    showToast("Removed from favorites");

  }

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message){

  const toast =
    document.getElementById(
      "toast"
    );


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

    },
    2000
  );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value){

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

document
  .getElementById(
    "searchInput"
  )
  .addEventListener(
    "input",
    renderProducts
  );


/* =====================================================
   CATEGORY
===================================================== */

document
  .querySelectorAll(
    ".category"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        function(){

          document
            .querySelectorAll(
              ".category"
            )
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


if(
  localStorage.getItem(
    "zolas-theme"
  )
  ===
  "dark"
){

  document.body.classList.add(
    "dark"
  );

  themeBtn.textContent =
    "☀️";

}


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


    themeBtn.textContent =
      dark
      ?
      "☀️"
      :
      "🌙";


    localStorage.setItem(
      "zolas-theme",
      dark
      ?
      "dark"
      :
      "light"
    );

  }
);


/* =====================================================
   CART BUTTON
===================================================== */

document
  .getElementById(
    "cartBtn"
  )
  .addEventListener(
    "click",
    openCart
  );


/* =====================================================
   CART OVERLAY
===================================================== */

document
  .getElementById(
    "cartOverlay"
  )
  .addEventListener(
    "click",
    function(event){

      if(
        event.target === this
      ){

        closeCart();

      }

    }
  );


/* =====================================================
   PRODUCT MODAL OVERLAY
===================================================== */

document
  .getElementById(
    "productModal"
  )
  .addEventListener(
    "click",
    function(event){

      if(
        event.target === this
      ){

        closeProduct();

      }

    }
  );


/* =====================================================
   CHECKOUT OVERLAY
===================================================== */

document
  .getElementById(
    "checkoutOverlay"
  )
  .addEventListener(
    "click",
    function(event){

      if(
        event.target === this
      ){

        closeCheckout();

      }

    }
  );


/* =====================================================
   SHIPPING
===================================================== */

document
  .getElementById(
    "shippingMethod"
  )
  .addEventListener(
    "change",
    updateCheckoutTotal
  );


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
  "keydown",
  event => {

    if(event.key !== "Escape")
      return;

    closeProduct();

    closeCart();
    
   closeAuth();

    closeCheckout();

  }
);

/* =====================================================
   AUTHENTICATION
   TEMPORARY LOCAL STORAGE VERSION
   WILL BE REPLACED WITH FIREBASE AUTH
===================================================== */

let currentUser =
  JSON.parse(
    localStorage.getItem("zolas-user")
  ) || null;


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
   OPEN LOGIN
===================================================== */

function openLogin(){

  loginView.classList.remove("hidden");

  registerView.classList.add("hidden");

  accountView.classList.add("hidden");

  authOverlay.classList.add("show");

}


/* =====================================================
   OPEN REGISTER
===================================================== */

function openRegister(){

  loginView.classList.add("hidden");

  registerView.classList.remove("hidden");

  accountView.classList.add("hidden");

  authOverlay.classList.add("show");

}


/* =====================================================
   ACCOUNT VIEW
===================================================== */

function openAccount(){

  if(!currentUser){

    openLogin();

    return;

  }


  loginView.classList.add("hidden");

  registerView.classList.add("hidden");

  accountView.classList.remove("hidden");


  document.getElementById(
    "accountName"
  ).textContent =
    "Hi, " + currentUser.name + "!";


  document.getElementById(
    "accountEmail"
  ).textContent =
    currentUser.email;


  authOverlay.classList.add("show");

}


/* =====================================================
   CLOSE AUTH
===================================================== */

function closeAuth(){

  authOverlay.classList.remove("show");

}


/* =====================================================
   LOGIN
===================================================== */

document
  .getElementById("loginForm")
  .addEventListener(
    "submit",
    function(event){

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


      const savedUser =
        JSON.parse(
          localStorage.getItem(
            "zolas-account"
          )
        );


      if(!savedUser){

        showToast(
          "Account not found. Please register first."
        );

        return;

      }


      if(
        savedUser.email !== email ||
        savedUser.password !== password
      ){

        showToast(
          "Incorrect email or password."
        );

        return;

      }


      currentUser = {

        name:savedUser.name,

        email:savedUser.email

      };


      localStorage.setItem(
        "zolas-user",
        JSON.stringify(currentUser)
      );


      updateAuthUI();

      closeAuth();


      showToast(
        "Welcome back, " +
        currentUser.name +
        "! ✨"
      );


      document
        .getElementById("loginForm")
        .reset();

    }
  );


/* =====================================================
   REGISTER
===================================================== */

document
  .getElementById("registerForm")
  .addEventListener(
    "submit",
    function(event){

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


      if(password.length < 6){

        showToast(
          "Password must be at least 6 characters."
        );

        return;

      }


      const account = {

        name:name,

        email:email,

        password:password

      };


      localStorage.setItem(
        "zolas-account",
        JSON.stringify(account)
      );


      currentUser = {

        name:name,

        email:email

      };


      localStorage.setItem(
        "zolas-user",
        JSON.stringify(currentUser)
      );


      updateAuthUI();

      closeAuth();


      showToast(
        "Account created successfully! ✨"
      );


      document
        .getElementById("registerForm")
        .reset();

    }
  );


/* =====================================================
   LOGOUT
===================================================== */

document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    function(){

      currentUser = null;


      localStorage.removeItem(
        "zolas-user"
      );


      closeAuth();


      updateAuthUI();


      showToast(
        "You have been signed out."
      );

    }
  );


/* =====================================================
   AUTH UI
===================================================== */

function updateAuthUI(){

  const profileBtn =
    document.getElementById(
      "profileBtn"
    );


  if(currentUser){

    profileBtn.classList.add(
      "logged-in"
    );

  }else{

    profileBtn.classList.remove(
      "logged-in"
    );

  }

}


/* =====================================================
   AUTH BUTTON EVENTS
===================================================== */

document
  .getElementById("profileBtn")
  .addEventListener(
    "click",
    openAccount
  );


document
  .getElementById("authClose")
  .addEventListener(
    "click",
    closeAuth
  );


document
  .getElementById("showRegister")
  .addEventListener(
    "click",
    openRegister
  );


document
  .getElementById("showLogin")
  .addEventListener(
    "click",
    openLogin
  );


/* =====================================================
   AUTH OVERLAY
===================================================== */

authOverlay.addEventListener(
  "click",
  function(event){

    if(event.target === this){

      closeAuth();

    }

  }
);


/* =====================================================
   INITIALIZE
===================================================== */

renderHero();

renderProducts();

renderCart();

updateCartCount();

startHeroTimer();