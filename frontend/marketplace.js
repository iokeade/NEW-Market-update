
const API_BASE_URL = 'http://localhost:4001/api';
const CART_STORAGE_KEY = 'marketlink_buyer_cart';

const grid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const searchForm = document.getElementById('search-form');
const categoriesElement = document.getElementById('categories');
const sortSelect = document.getElementById('sort-select');

let products = [];
let activeCategory = 'all';
let searchTerm = '';
let cart = loadCart();

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

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
  return product.name ?? product.title ?? product.product_name ?? 'Unnamed product';
}

function getProductPrice(product) {
  const raw = product.price ?? product.unit_price ?? product.amount ?? 0;
  const price = Number(raw);
  return Number.isFinite(price) ? price : 0;
}

function getProductImage(product) {
  return product.image_url ?? product.imageUrl ?? product.image ?? product.photo_url ?? '';
}

function getProductCategory(product) {
  return String(product.category ?? product.category_name ?? 'General');
}

function getProductDescription(product) {
  return product.description ?? 'Discover this product from a MarketLink vendor.';
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2
  }).format(price);
}

function categoryMatches(product) {
  if (activeCategory === 'all') return true;

  const category = getProductCategory(product).toLowerCase();

  const keywords = {
    food: ['food', 'grocery', 'groceries', 'fruit', 'vegetable', 'drink'],
    fashion: ['fashion', 'clothing', 'clothes', 'wear', 'shoe', 'apparel'],
    electronics: ['electronic', 'phone', 'computer', 'device', 'gadget'],
    home: ['home', 'living', 'furniture', 'kitchen', 'household']
  };

  return keywords[activeCategory]?.some(word => category.includes(word)) ?? false;
}

function filteredProducts() {
  let result = products.filter(product => {
    const searchable = [
      getProductName(product),
      getProductDescription(product),
      getProductCategory(product),
      product.vendor_name ?? product.vendorName ?? ''
    ].join(' ').toLowerCase();

    return categoryMatches(product) && searchable.includes(searchTerm);
  });

  switch (sortSelect.value) {
    case 'price-low':
      result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      break;
    case 'price-high':
      result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      break;
    case 'name':
      result.sort((a, b) => getProductName(a).localeCompare(getProductName(b)));
      break;
  }

  return result;
}

function renderProducts() {
  const result = filteredProducts();

  document.getElementById('results-count').textContent =
    `${result.length} product${result.length === 1 ? '' : 's'} found`;

  if (!result.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try another search or select a different category.</p>
      </div>`;
    return;
  }

  grid.innerHTML = result.map((product, index) => {
    const id = getProductId(product);
    const name = getProductName(product);
    const image = getProductImage(product);
    const category = getProductCategory(product);
    const description = getProductDescription(product);
    const price = getProductPrice(product);

    const placeholderIcons = ['🛍️', '🥑', '👟', '🎧', '📦'];
    const imageMarkup = image
      ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
         <div class="product-placeholder" style="display:none">${placeholderIcons[index % placeholderIcons.length]}</div>`
      : `<div class="product-placeholder">${placeholderIcons[index % placeholderIcons.length]}</div>`;

    return `
      <article class="product-card">
        <div class="product-image">${imageMarkup}</div>
        <div class="product-info">
          <span class="product-category">${escapeHtml(category)}</span>
          <h3>${escapeHtml(name)}</h3>
          <p class="product-description">${escapeHtml(description)}</p>
          <div class="product-bottom">
            <span class="product-price">${formatPrice(price)}</span>
            <button
              class="add-button"
              type="button"
              data-add-id="${escapeHtml(id ?? '')}"
              ${id == null ? 'disabled title="This product has no ID"' : ''}
            >+ Add to cart</button>
          </div>
        </div>
      </article>`;
  }).join('');
}

async function loadProducts() {
  grid.innerHTML = '<div class="loading-state">Loading MarketLink products...</div>';

  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.message || result.error?.message || 'Unable to load products.');
    }

    const rows = Array.isArray(result)
      ? result
      : result.data ?? result.products ?? result.items ?? [];

    if (!Array.isArray(rows)) {
      throw new Error('The products API returned an unexpected response.');
    }

    products = rows;
    renderProducts();
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>We couldn't load products</h3>
        <p>${escapeHtml(error.message)}</p>
        <p>Make sure the MarketLink backend is running on port 4001.</p>
        <button id="retry-products" class="add-button" type="button">Try again</button>
      </div>`;
  }
}

function addToCart(id) {
  const product = products.find(item => String(getProductId(item)) === String(id));
  if (!product) return;

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
}

function changeQuantity(id, amount) {
  const item = cart.find(entry => String(entry.id) === String(id));
  if (!item) return;

  item.quantity += amount;
  cart = cart.filter(entry => entry.quantity > 0);

  saveCart();
  renderCart();
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  document.getElementById('cart-count').textContent = totalItems;
  document.getElementById('cart-total').textContent = formatPrice(total);

  const container = document.getElementById('cart-items');

  if (!cart.length) {
    container.innerHTML = '<p class="muted">Your cart is empty. Add a product to get started.</p>';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${formatPrice(item.price)} each</p>
        <div class="quantity-controls">
          <button type="button" data-quantity-id="${escapeHtml(item.id)}" data-change="-1" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity-id="${escapeHtml(item.id)}" data-change="1" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
    </div>
  `).join('');
}

function openCart() {
  document.getElementById('cart-panel').classList.add('open');
  document.getElementById('cart-backdrop').classList.add('open');
  document.getElementById('cart-panel').setAttribute('aria-hidden', 'false');
}

function closeCart() {
  document.getElementById('cart-panel').classList.remove('open');
  document.getElementById('cart-backdrop').classList.remove('open');
  document.getElementById('cart-panel').setAttribute('aria-hidden', 'true');
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchTerm = searchInput.value.trim().toLowerCase();
  renderProducts();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

searchInput.addEventListener('input', () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  renderProducts();
});

categoriesElement.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;

  activeCategory = button.dataset.category;

  categoriesElement.querySelectorAll('[data-category]').forEach(element => {
    element.classList.toggle('active', element === button);
  });

  renderProducts();
});

sortSelect.addEventListener('change', renderProducts);

grid.addEventListener('click', event => {
  if (event.target.id === 'retry-products') {
    loadProducts();
    return;
  }

  const button = event.target.closest('[data-add-id]');
  if (button && !button.disabled) {
    addToCart(button.dataset.addId);
  }
});

document.getElementById('cart-toggle').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
document.getElementById('cart-backdrop').addEventListener('click', closeCart);

document.getElementById('cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-quantity-id]');
  if (!button) return;

  changeQuantity(button.dataset.quantityId, Number(button.dataset.change));
});

document.getElementById('checkout-button').addEventListener('click', () => {
  if (!cart.length) {
    alert('Your cart is empty. Add some products first.');
    return;
  }

  alert('Your cart is ready! We will connect checkout to the MarketLink orders API in the next step.');
});

renderCart();
loadProducts();
