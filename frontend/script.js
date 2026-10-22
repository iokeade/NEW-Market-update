
/* =========================================
   MARKETLINK - MAIN FRONTEND JAVASCRIPT
   Connected to the SQLite-backed Express API
   ========================================= */

const API_BASE_URL = "http://localhost:4000/api";

const sampleProducts = [
  { id: "demo-1", name: "Premium Local Rice", category: "Groceries", price: 42000, unit: "50kg bag", location: "Lagos", description: "Quality local rice for your household.", emoji: "🌾" },
  { id: "demo-2", name: "Fresh Red Tomatoes", category: "Groceries", price: 6500, unit: "basket", location: "Ibadan", description: "Fresh tomatoes for everyday cooking.", emoji: "🍅" },
  { id: "demo-3", name: "Golden Cooking Oil", category: "Groceries", price: 8500, unit: "5 litres", location: "Lagos", description: "Cooking oil for your favourite meals.", emoji: "🫒" },
  { id: "demo-4", name: "Wireless Headphones", category: "Electronics", price: 18500, unit: "piece", location: "Abuja", description: "Enjoy music and calls on the go.", emoji: "🎧" },
  { id: "demo-5", name: "Everyday Sneakers", category: "Fashion", price: 25000, unit: "pair", location: "Lagos", description: "Versatile sneakers for everyday wear.", emoji: "👟" },
  { id: "demo-6", name: "Classic Travel Backpack", category: "Fashion", price: 14500, unit: "piece", location: "Port Harcourt", description: "A practical bag for work and travel.", emoji: "🎒" },
  { id: "demo-7", name: "Modern Table Lamp", category: "Home", price: 12000, unit: "piece", location: "Abuja", description: "Add warm lighting to your space.", emoji: "💡" },
  { id: "demo-8", name: "Daily Skincare Set", category: "Beauty", price: 9800, unit: "set", location: "Lagos", description: "A simple skincare routine in one set.", emoji: "🧴" }
];

let products = [...sampleProducts];
let cart = [];
let toastTimeout;
let usingDemoProducts = true;

const productGrid = document.getElementById("product-grid");
const productMessage = document.getElementById("product-message");
const productCount = document.getElementById("product-count");
const searchInput = document.getElementById("product-search");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");
const cartDialog = document.getElementById("cart-dialog");

/* =========================================
   SHARED HELPERS
   ========================================= */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(price) || 0);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* =========================================
   API CONNECTION
   ========================================= */

function normalizeProduct(product) {
  const category = product.category || "General";

  const categoryEmojis = {
    groceries: "🛒",
    electronics: "🎧",
    fashion: "👕",
    home: "🏠",
    beauty: "🧴",
    grains: "🌾",
    vegetables: "🥬",
    fruits: "🍎"
  };

  return {
    ...product,
    id: product.id,
    name: product.name || "Unnamed product",
    category,
    price: Number(product.price) || 0,
    unit: product.unit || "piece",
    location: product.location || "Nigeria",
    description: product.description || "Discover this product on MarketLink.",
    emoji: product.emoji || categoryEmojis[category.toLowerCase()] || "🛍️",
    image_url: product.image_url || ""
  };
}

async function loadProducts() {
  productMessage.textContent = "Loading products from MarketLink...";
  productCount.textContent = "Loading...";

  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("The products API returned an unexpected response.");
    }

    products = result.data.map(normalizeProduct);
    usingDemoProducts = false;

    populateCategories();
    filterProducts();

    if (products.length === 0) {
      productMessage.textContent =
        "No products have been added yet. Please check back soon.";
    } else {
      showToast(`${products.length} product${products.length === 1 ? "" : "s"} loaded from MarketLink.`);
    }
  } catch (error) {
    console.error("Could not load products from the API:", error);

    products = sampleProducts.map(normalizeProduct);
    usingDemoProducts = true;

    populateCategories();
    filterProducts();

    productMessage.textContent =
      "We're showing demo products because the MarketLink API could not be reached. Make sure the backend is running.";

    showToast("API unavailable. Showing demo products.");
  }
}

/* =========================================
   CATEGORIES AND PRODUCT DISPLAY
   ========================================= */

function populateCategories() {
  if (!categoryFilter) return;

  const selectedCategory = categoryFilter.value;
  const categories = [
    ...new Set(products.map(product => product.category).filter(Boolean))
  ].sort();

  categoryFilter.innerHTML =
    '<option value="">All categories</option>';

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  if (categories.includes(selectedCategory)) {
    categoryFilter.value = selectedCategory;
  }
}

function renderProducts(list) {
  if (!productGrid || !productCount || !productMessage) return;

  productCount.textContent =
    `${list.length} product${list.length === 1 ? "" : "s"}`;

  productGrid.innerHTML = "";

  if (!list.length) {
    productMessage.textContent = usingDemoProducts
      ? "No matching demo products. Try another search or category."
      : "No matching products found. Try another search or category.";

    return;
  }

  productMessage.textContent = "";

  productGrid.innerHTML = list.map(product => {
    const picture = product.image_url
      ? `<img class="product-image" src="${escapeHTML(product.image_url)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.style.display='none'">`
      : `<span class="product-emoji" aria-hidden="true">${escapeHTML(product.emoji)}</span>`;

    return `
      <article class="product-card">
        <div class="product-picture">
          ${picture}
          <span class="product-badge">${escapeHTML(product.category)}</span>
        </div>
        <div class="product-details">
          <span class="product-category">${escapeHTML(product.category)}</span>
          <h3 class="product-name">${escapeHTML(product.name)}</h3>
          <p class="product-location">
            <span aria-hidden="true">📍</span>
            ${escapeHTML(product.location)}
          </p>
          <p class="product-description">${escapeHTML(product.description)}</p>
          <div class="product-bottom">
            <div>
              <div class="product-price">${formatPrice(product.price)}</div>
              <span class="product-unit">${escapeHTML(product.unit)}</span>
            </div>
            <button
              class="add-button"
              data-add="${escapeHTML(product.id)}"
              aria-label="Add ${escapeHTML(product.name)} to cart"
              type="button"
            >+</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* =========================================
   SEARCH, FILTER AND SORT
   ========================================= */

function filterProducts() {
  if (!searchInput || !categoryFilter || !sortFilter) return;

  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort = sortFilter.value;

  let filtered = products.filter(product => {
    const text = [
      product.name,
      product.category,
      product.location,
      product.description
    ].join(" ").toLowerCase();

    return text.includes(query) &&
      (!category || product.category === category);
  });

  if (sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  }

  if (sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  }

  if (sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderProducts(filtered);

  document.querySelectorAll("[data-category]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === category && category !== ""
    );
  });
}

/* =========================================
   SHOPPING CART
   ========================================= */

function addToCart(id) {
  const product = products.find(item => String(item.id) === String(id));
  if (!product) return;

  const existing = cart.find(item => String(item.id) === String(id));

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  showToast(`${product.name} added to your cart.`);
}

function updateCart() {
  const cartCount = document.getElementById("cart-count");
  const cartSubtotal = document.getElementById("cart-subtotal");
  const cartItems = document.getElementById("cart-items");

  if (!cartCount || !cartSubtotal || !cartItems) return;

  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  cartCount.textContent = count;
  cartSubtotal.textContent = formatPrice(subtotal);

  if (!cart.length) {
    cartItems.innerHTML =
      '<div class="cart-empty">Your cart is empty. Explore the marketplace to find something you love.</div>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji" aria-hidden="true">
        ${escapeHTML(item.emoji || "🛍️")}
      </div>
      <div class="cart-item-info">
        <strong>${escapeHTML(item.name)}</strong>
        <small>${formatPrice(item.price)} each</small>
      </div>
      <div class="quantity-control">
        <button
          type="button"
          data-quantity="-1"
          data-id="${escapeHTML(item.id)}"
          aria-label="Decrease quantity"
        >−</button>
        <span>${item.quantity}</span>
        <button
          type="button"
          data-quantity="1"
          data-id="${escapeHTML(item.id)}"
          aria-label="Increase quantity"
        >+</button>
      </div>
    </div>
  `).join("");
}

function changeQuantity(id, change) {
  const item = cart.find(product => String(product.id) === String(id));
  if (!item) return;

  item.quantity += change;
  cart = cart.filter(product => product.quantity > 0);

  updateCart();
}

/* =========================================
   EVENT LISTENERS
   ========================================= */

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");

  if (addButton) {
    addToCart(addButton.dataset.add);
  }

  const quantityButton = event.target.closest("[data-quantity]");

  if (quantityButton) {
    changeQuantity(
      quantityButton.dataset.id,
      Number(quantityButton.dataset.quantity)
    );
  }

  const categoryButton = event.target.closest("[data-category]");

  if (categoryButton) {
    if (categoryFilter) {
      categoryFilter.value = categoryButton.dataset.category;
      filterProducts();
    }

    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth"
    });
  }
});

searchInput?.addEventListener("input", filterProducts);
categoryFilter?.addEventListener("change", filterProducts);
sortFilter?.addEventListener("change", filterProducts);

document.getElementById("cart-button")?.addEventListener("click", () => {
  updateCart();

  if (cartDialog?.showModal) {
    cartDialog.showModal();
  }
});

document.getElementById("close-cart")?.addEventListener("click", () => {
  cartDialog?.close();
});

cartDialog?.addEventListener("click", event => {
  if (event.target === cartDialog) {
    cartDialog.close();
  }
});

document.getElementById("checkout-button")?.addEventListener("click", () => {
  if (!cart.length) {
    showToast("Your cart is empty. Add a product first.");
    return;
  }

  showToast("Checkout will be connected when we build the order system.");
});

document.getElementById("menu-button")?.addEventListener("click", () => {
  const menu = document.getElementById("mobile-nav");
  const button = document.getElementById("menu-button");

  if (!menu || !button) return;

  const isOpen = !menu.hidden;

  menu.hidden = isOpen;
  button.setAttribute("aria-expanded", String(!isOpen));
  button.setAttribute(
    "aria-label",
    isOpen ? "Open navigation" : "Close navigation"
  );
  button.textContent = isOpen ? "☰" : "×";
});

document.querySelectorAll("#mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    const menu = document.getElementById("mobile-nav");
    const button = document.getElementById("menu-button");

    if (menu) menu.hidden = true;

    if (button) {
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open navigation");
      button.textContent = "☰";
    }
  });
});

document.getElementById("mobile-search-button")?.addEventListener("click", () => {
  document.getElementById("products")?.scrollIntoView({
    behavior: "smooth"
  });

  searchInput?.focus({ preventScroll: true });
});

/* =========================================
   INITIALIZE MARKETPLACE
   ========================================= */

const currentYear = document.getElementById("current-year");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

populateCategories();
renderProducts(products);
updateCart();
loadProducts();

