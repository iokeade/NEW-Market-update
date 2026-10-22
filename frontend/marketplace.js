
/* =========================================
   MARKETLINK MARKETPLACE
   API + SEARCH + FILTERS + SHOPPING CART
   ========================================= */

const API_BASE_URL = 'http://localhost:4000/api';
const CART_STORAGE_KEY = 'marketlink_buyer_cart';

const grid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const searchForm = document.getElementById('search-form');
const categoriesElement = document.getElementById('categories');
const sortSelect = document.getElementById('sort-select');

const cartPanel = document.getElementById('cart-panel');
const cartBackdrop = document.getElementById('cart-backdrop');
const checkoutPanel = document.getElementById('checkout-panel');
const checkoutBackdrop = document.getElementById('checkout-backdrop');

let products = [];
let activeCategory = 'all';
let searchTerm = '';
let cart = loadCart();
let previousFocus = null;
let toastTimeout = null;

/* =========================================
   GENERAL HELPERS
   ========================================= */

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function getProductId(product) {
  return product.id ?? product.product_id ?? product._id;
}

function getProductName(product) {
  return String(
    product.name ?? product.title ?? product.product_name ?? 'Unnamed product'
  );
}

function getProductPrice(product) {
  const price = Number(
    product.price ?? product.unit_price ?? product.amount ?? 0
  );

  return Number.isFinite(price) && price >= 0 ? price : 0;
}

function getProductImage(product) {
  return String(
    product.image_url ??
    product.imageUrl ??
    product.image ??
    product.photo_url ??
    ''
  );
}

function getProductCategory(product) {
  return String(product.category ?? product.category_name ?? 'General');
}

function getProductDescription(product) {
  return String(
    product.description ??
    'Discover this product from a MarketLink vendor.'
  );
}

function getProductLocation(product) {
  return String(
    product.location ?? product.vendor_location ?? product.city ?? 'Nigeria'
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2
  }).format(price);
}

function showToast(message) {
  const toast = document.getElementById('marketplace-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

/* =========================================
   CART STORAGE
   ========================================= */

function loadCart() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(CART_STORAGE_KEY) || '[]'
    );

    if (!Array.isArray(stored)) return [];

    return stored
      .filter(item =>
        item &&
        item.id != null &&
        typeof item.name === 'string' &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
      )
      .map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image: typeof item.image === 'string' ? item.image : '',
        quantity: Number(item.quantity)
      }));
  } catch (error) {
    console.error('Could not load the saved cart:', error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    return true;
  } catch (error) {
    console.error('Could not save the cart:', error);
    showToast('Unable to save your cart in this browser.');
    return false;
  }
}

function getCartItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartSubtotal() {
  return cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

/* =========================================
   PRODUCT CATEGORIES AND SEARCH
   ========================================= */

function categoryMatches(product) {
  if (activeCategory === 'all') return true;

  const category = getProductCategory(product).toLowerCase();

  const keywords = {
    food: [
      'food', 'grocery', 'groceries', 'fruit', 'vegetable',
      'drink', 'grain', 'rice', 'maize', 'yam', 'beans',
      'farm', 'fish', 'meat', 'produce'
    ],
    fashion: [
      'fashion', 'clothing', 'clothes', 'wear', 'shoe',
      'apparel', 'dress', 'bag', 'shirt'
    ],
    electronics: [
      'electronic', 'phone', 'computer', 'device',
      'gadget', 'laptop', 'tablet', 'audio'
    ],
    home: [
      'home', 'living', 'furniture', 'kitchen',
      'household', 'appliance', 'decor'
    ]
  };

  return keywords[activeCategory]?.some(word => category.includes(word))
    ?? false;
}

function filteredProducts() {
  const result = products.filter(product => {
    const searchable = [
      getProductName(product),
      getProductDescription(product),
      getProductCategory(product),
      getProductLocation(product),
      product.vendor_name ?? product.vendorName ?? ''
    ].join(' ').toLowerCase();

    return categoryMatches(product) && searchable.includes(searchTerm);
  });

  switch (sortSelect?.value) {
    case 'price-low':
      result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      break;

    case 'price-high':
      result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      break;

    case 'name':
      result.sort((a, b) =>
        getProductName(a).localeCompare(getProductName(b))
      );
      break;
  }

  return result;
}

/* =========================================
   PRODUCT DISPLAY
   ========================================= */

function renderProducts() {
  if (!grid) return;

  const result = filteredProducts();
  const resultsCount = document.getElementById('results-count');

  if (resultsCount) {
    resultsCount.textContent =
      `${result.length} product${result.length === 1 ? '' : 's'} found`;
  }

  if (!result.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try another search or select a different category.</p>
      </div>
    `;
    return;
  }

  const placeholderIcons = ['🛍️', '🥑', '👟', '🎧', '📦'];

  grid.innerHTML = result.map((product, index) => {
    const id = getProductId(product);
    const name = getProductName(product);
    const image = getProductImage(product);
    const category = getProductCategory(product);
    const description = getProductDescription(product);
    const location = getProductLocation(product);
    const price = getProductPrice(product);

    const imageMarkup = image
      ? `
        <img
          src="${escapeHtml(image)}"
          alt="${escapeHtml(name)}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"
        >
        <div class="product-placeholder" style="display:none" aria-hidden="true">
          ${placeholderIcons[index % placeholderIcons.length]}
        </div>
      `
      : `
        <div class="product-placeholder" aria-hidden="true">
          ${placeholderIcons[index % placeholderIcons.length]}
        </div>
      `;

    return `
      <article class="product-card">
        <div class="product-image">${imageMarkup}</div>

        <div class="product-info">
          <span class="product-category">${escapeHtml(category)}</span>
          <h3>${escapeHtml(name)}</h3>
          <p class="product-description">${escapeHtml(description)}</p>
          <p class="product-location">📍 ${escapeHtml(location)}</p>

          <div class="product-bottom">
            <span class="product-price">${formatPrice(price)}</span>
            <button
              class="add-button"
              type="button"
              data-add-id="${escapeHtml(id ?? '')}"
              ${id == null ? 'disabled' : ''}
            >+ Add to cart</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

async function loadProducts() {
  if (!grid) return;

  grid.innerHTML = `
    <div class="loading-state">Loading MarketLink products...</div>
  `;

  const resultsCount = document.getElementById('results-count');
  if (resultsCount) resultsCount.textContent = 'Connecting to MarketLink...';

  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(
        result.error?.message ??
        result.message ??
        `Request failed with status ${response.status}`
      );
    }

    const rows = Array.isArray(result)
      ? result
      : result.data ?? result.products ?? result.items ?? [];

    if (!Array.isArray(rows)) {
      throw new Error('The API did not return a valid products list.');
    }

    products = rows;
    renderProducts();

    if (!products.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No products available yet</h3>
          <p>Your API is connected, but there are no products to display.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('MarketLink product loading error:', error);

    if (resultsCount) resultsCount.textContent = 'Products unavailable';

    grid.innerHTML = `
      <div class="empty-state">
        <h3>We couldn't load products</h3>
        <p>${escapeHtml(error.message || 'Connection failed.')}</p>
        <p>Make sure the backend is running at localhost:4000.</p>
        <button id="retry-products" class="add-button" type="button">
          Try again
        </button>
      </div>
    `;
  }
}

/* =========================================
   ADD, REMOVE AND UPDATE CART ITEMS
   ========================================= */

function addToCart(id) {
  const product = products.find(
    item => String(getProductId(item)) === String(id)
  );

  if (!product) {
    showToast('This product could not be found.');
    return;
  }

  const existing = cart.find(item => String(item.id) === String(id));

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: getProductId(product),
      name: getProductName(product),
      price: getProductPrice(product),
      image: getProductImage(product),
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  openCart();
  showToast(`${getProductName(product)} added to your cart.`);
}

function changeQuantity(id, amount) {
  const item = cart.find(entry => String(entry.id) === String(id));
  if (!item) return;

  const nextQuantity = item.quantity + amount;

  if (nextQuantity <= 0) {
    removeFromCart(id);
    return;
  }

  item.quantity = nextQuantity;
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  const item = cart.find(entry => String(entry.id) === String(id));
  if (!item) return;

  cart = cart.filter(entry => String(entry.id) !== String(id));
  saveCart();
  renderCart();
  showToast(`${item.name} removed from your cart.`);
}

function clearCart() {
  if (!cart.length) return;

  cart = [];
  saveCart();
  renderCart();
  showToast('Your cart has been cleared.');
}

/* =========================================
   RENDER SHOPPING CART
   ========================================= */

function renderCart() {
  const countElement = document.getElementById('cart-count');
  const headingCount = document.getElementById('cart-heading-count');
  const itemLabel = document.getElementById('cart-item-label');
  const subtotalElement = document.getElementById('cart-subtotal');
  const totalElement = document.getElementById('cart-total');
  const container = document.getElementById('cart-items');
  const clearButton = document.getElementById('clear-cart-button');
  const checkoutButton = document.getElementById('checkout-button');
  const cartToggle = document.getElementById('cart-toggle');

  if (!container) return;

  const count = getCartItemCount();
  const subtotal = getCartSubtotal();

  if (countElement) countElement.textContent = count;
  if (headingCount) headingCount.textContent = `(${count})`;
  if (itemLabel) itemLabel.textContent = `${count} item${count === 1 ? '' : 's'}`;
  if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
  if (totalElement) totalElement.textContent = formatPrice(subtotal);
  if (clearButton) clearButton.disabled = cart.length === 0;
  if (checkoutButton) checkoutButton.disabled = cart.length === 0;
  if (cartToggle) cartToggle.setAttribute('aria-label', `Open cart, ${count} items`);

  const checkoutTotal = document.getElementById('checkout-summary-total');
  const checkoutCount = document.getElementById('checkout-summary-count');

  if (checkoutTotal) checkoutTotal.textContent = formatPrice(subtotal);
  if (checkoutCount) checkoutCount.textContent = `${count} item${count === 1 ? '' : 's'}`;

  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-cart-icon" aria-hidden="true">🛍️</div>
        <h3>Your cart is waiting</h3>
        <p class="muted">Discover something you love and add it here.</p>
        <button id="continue-shopping" class="secondary-button" type="button">
          Continue shopping
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => {
    const imageMarkup = item.image
      ? `
        <img
          src="${escapeHtml(item.image)}"
          alt="${escapeHtml(item.name)}"
          loading="lazy"
          onerror="this.style.display='none';this.parentElement.textContent='🛍️'"
        >
      `
      : '🛍️';

    return `
      <article class="cart-item">
        <div class="cart-item-image">${imageMarkup}</div>

        <div class="cart-item-main">
          <div class="cart-item-top">
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <p class="unit-price">${formatPrice(item.price)} each</p>
            </div>

            <button
              class="remove-item"
              type="button"
              data-remove-id="${escapeHtml(item.id)}"
              aria-label="Remove ${escapeHtml(item.name)} from cart"
            >Remove</button>
          </div>

          <div class="cart-item-bottom">
            <div class="quantity-controls" aria-label="Quantity controls">
              <button
                type="button"
                data-quantity-id="${escapeHtml(item.id)}"
                data-change="-1"
                aria-label="Decrease ${escapeHtml(item.name)} quantity"
              >−</button>

              <span aria-live="polite">${item.quantity}</span>

              <button
                type="button"
                data-quantity-id="${escapeHtml(item.id)}"
                data-change="1"
                aria-label="Increase ${escapeHtml(item.name)} quantity"
              >+</button>
            </div>

            <strong class="cart-item-line-total">
              ${formatPrice(item.price * item.quantity)}
            </strong>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* =========================================
   OPEN AND CLOSE DRAWERS
   ========================================= */

function setDialogOpen(panel, backdrop, isOpen) {
  if (!panel || !backdrop) return;

  panel.classList.toggle('open', isOpen);
  backdrop.classList.toggle('open', isOpen);
  panel.setAttribute('aria-hidden', String(!isOpen));
  panel.inert = !isOpen;
}

function openCart() {
  if (checkoutPanel?.classList.contains('open')) {
    closeCheckout(false);
  }

  previousFocus = document.activeElement;
  document.body.classList.add('cart-open');

  setDialogOpen(cartPanel, cartBackdrop, true);

  document.getElementById('cart-toggle')?.setAttribute('aria-expanded', 'true');
  document.getElementById('cart-close')?.focus();
}

function closeCart(restoreFocus = true) {
  setDialogOpen(cartPanel, cartBackdrop, false);
  document.body.classList.remove('cart-open');

  document.getElementById('cart-toggle')?.setAttribute('aria-expanded', 'false');

  if (restoreFocus) {
    const target = previousFocus?.isConnected
      ? previousFocus
      : document.getElementById('cart-toggle');

    target?.focus();
  }
}

function openCheckout() {
  if (!cart.length) {
    showToast('Add a product before checking out.');
    return;
  }

  closeCart(false);
  document.body.classList.add('checkout-open');
  setDialogOpen(checkoutPanel, checkoutBackdrop, true);

  document.getElementById('checkout-notice').hidden = true;
  document.getElementById('customer-name')?.focus();
}

function closeCheckout(restoreFocus = true) {
  setDialogOpen(checkoutPanel, checkoutBackdrop, false);
  document.body.classList.remove('checkout-open');

  if (restoreFocus) {
    document.getElementById('cart-toggle')?.focus();
  }
}

/* =========================================
   SEARCH AND CATEGORY EVENTS
   ========================================= */

searchForm?.addEventListener('submit', event => {
  event.preventDefault();
  searchTerm = searchInput.value.trim().toLowerCase();
  renderProducts();

  document.getElementById('products')?.scrollIntoView({
    behavior: 'smooth'
  });
});

searchInput?.addEventListener('input', () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  renderProducts();
});

categoriesElement?.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;

  activeCategory = button.dataset.category;

  categoriesElement.querySelectorAll('[data-category]').forEach(element => {
    const isActive = element === button;
    element.classList.toggle('active', isActive);
    element.setAttribute('aria-pressed', String(isActive));
  });

  renderProducts();
});

sortSelect?.addEventListener('change', renderProducts);

/* =========================================
   MARKETPLACE BUTTON EVENTS
   ========================================= */

grid?.addEventListener('click', event => {
  if (event.target.closest('#retry-products')) {
    loadProducts();
    return;
  }

  const button = event.target.closest('[data-add-id]');
  if (button && !button.disabled) {
    addToCart(button.dataset.addId);
  }
});

document.getElementById('cart-toggle')?.addEventListener('click', openCart);
document.getElementById('cart-close')?.addEventListener('click', () => closeCart());
cartBackdrop?.addEventListener('click', () => closeCart());
document.getElementById('clear-cart-button')?.addEventListener('click', clearCart);

document.getElementById('continue-shopping')?.addEventListener('click', () => {
  closeCart();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('cart-items')?.addEventListener('click', event => {
  const quantityButton = event.target.closest('[data-quantity-id]');
  if (quantityButton) {
    changeQuantity(
      quantityButton.dataset.quantityId,
      Number(quantityButton.dataset.change)
    );
    return;
  }

  const removeButton = event.target.closest('[data-remove-id]');
  if (removeButton) {
    removeFromCart(removeButton.dataset.removeId);
  }
});

/* =========================================
   CHECKOUT PREPARATION
   IMPORTANT:
   This form does not create an order yet.
   We will connect it to the real orders API
   after verifying that API's request format.
   ========================================= */

document.getElementById('checkout-button')?.addEventListener('click', openCheckout);

document.getElementById('checkout-close')?.addEventListener('click', () => {
  closeCheckout();
});

checkoutBackdrop?.addEventListener('click', () => closeCheckout());

document.getElementById('checkout-form')?.addEventListener('submit', event => {
  event.preventDefault();

  if (!cart.length) {
    closeCheckout(false);
    openCart();
    showToast('Your cart is empty. Add products before checkout.');
    return;
  }

  const form = event.currentTarget;

  if (!form.reportValidity()) return;

  const notice = document.getElementById('checkout-notice');

  notice.textContent =
    'Your delivery details are valid, but your order has NOT been submitted. ' +
    'The next step is to connect this form to the MarketLink orders API and ' +
    'verify the server response. No payment has been taken.';

  notice.hidden = false;
});

/* Close the active drawer with Escape. */
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;

  if (checkoutPanel?.classList.contains('open')) {
    closeCheckout();
  } else if (cartPanel?.classList.contains('open')) {
    closeCart();
  }
});

/* =========================================
   START MARKETPLACE
   ========================================= */

renderCart();
loadProducts();