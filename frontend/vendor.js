
const API_BASE_URL = 'http://localhost:4000/api';

const token = sessionStorage.getItem('marketlinkVendorToken');

const productForm = document.getElementById('product-form');
const submitButton = document.getElementById('submit-button');
const productList = document.getElementById('product-list');
const productTotal = document.getElementById('product-total');
const formNotice = document.getElementById('form-notice');
const listNotice = document.getElementById('list-notice');

let isSaving = false;

function showNotice(element, message, type = 'error') {
  element.textContent = message;
  element.className = `notice ${type}`;
}

function clearNotice(element) {
  element.textContent = '';
  element.className = 'notice';
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function formatPrice(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) return 'Price unavailable';

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2
  }).format(amount);
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 403) {
    sessionStorage.removeItem('marketlinkVendorToken');
    sessionStorage.removeItem('marketlinkVendor');
    window.location.href = 'auth.html';
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Request failed (${response.status}).`
    );
  }

  return result;
}

function getProductArray(result) {
  // Supports common API response formats.
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.products)) return result.products;
  if (Array.isArray(result.data?.products)) return result.data.products;

  return [];
}

function renderProducts(products) {
  productList.replaceChildren();

  if (products.length === 0) {
    productList.innerHTML = `
      <div class="empty-state">
        No products found yet. Add your first product using the form.
      </div>
    `;

    productTotal.textContent = '0 products';
    return;
  }

  products.forEach(product => {
    const item = document.createElement('article');
    item.className = 'product-item';

    const details = document.createElement('div');

    const name = document.createElement('h3');
    name.textContent = product.name || 'Unnamed product';

    const meta = document.createElement('p');
    meta.className = 'product-meta';

    const category = product.category || 'Uncategorised';
    const location = product.location || 'Location unavailable';
    const stock = product.stock ?? product.quantity ?? 'N/A';

    meta.textContent =
      `${category} · ${location} · Stock: ${stock}`;

    details.append(name, meta);

    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = formatPrice(product.price);

    item.append(details, price);
    productList.appendChild(item);
  });

  productTotal.textContent =
    `${products.length} product${products.length === 1 ? '' : 's'} loaded`;
}

async function loadProducts() {
  clearNotice(listNotice);

  productList.innerHTML = `
    <div class="empty-state">Loading products…</div>
  `;

  try {
    const result = await apiRequest('/products');
    const products = getProductArray(result);

    // If the API returns products belonging to all vendors,
    // filter them to the currently signed-in vendor.
    const vendorText = sessionStorage.getItem('marketlinkVendor');
    const vendor = vendorText ? JSON.parse(vendorText) : null;
    const vendorId = vendor?.id;

    const ownProducts = vendorId == null
      ? products
      : products.filter(product => {
          const ownerId =
            product.vendorId ??
            product.vendor_id ??
            product.vendor?.id;

          // If no owner ID is provided, retain the item because
          // the API may already filter products by the logged-in vendor.
          return ownerId == null || String(ownerId) === String(vendorId);
        });

    renderProducts(ownProducts);
  } catch (error) {
    productList.innerHTML = `
      <div class="empty-state">
        Could not load products. Check that your backend is running
        and the products API is available.
      </div>
    `;

    productTotal.textContent = 'Products unavailable';
    showNotice(listNotice, error.message || 'Failed to fetch products.');
  }
}

productForm.addEventListener('submit', async event => {
  event.preventDefault();

  if (isSaving) return;

  if (!token) {
    window.location.href = 'auth.html';
    return;
  }

  clearNotice(formNotice);

  const formData = new FormData(productForm);

  const name = String(formData.get('name') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const price = Number(formData.get('price'));
  const stock = Number(formData.get('stock'));
  const location = String(formData.get('location') || '').trim();
  const unit = String(formData.get('unit') || 'piece');
  const imageUrl = String(formData.get('image_url') || '').trim();
  const description = String(formData.get('description') || '').trim();

  if (!name || !category || !location) {
    showNotice(formNotice, 'Please complete all required fields.');
    return;
  }

  if (!Number.isFinite(price) || price < 0) {
    showNotice(formNotice, 'Enter a valid product price.');
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    showNotice(formNotice, 'Stock must be a whole number of zero or more.');
    return;
  }

  if (imageUrl) {
    try {
      const url = new URL(imageUrl);

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error();
      }
    } catch {
      showNotice(formNotice, 'Enter a valid HTTP or HTTPS image URL.');
      return;
    }
  }

  const payload = {
    name,
    category,
    price,
    stock,
    unit,
    location,
    image_url: imageUrl || null,
    description
  };

  isSaving = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Saving product…';

  try {
    await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    showNotice(formNotice, 'Product saved successfully!', 'success');

    productForm.reset();

    // Restore the defaults from the HTML form.
    document.getElementById('stock').value = '1';
    document.getElementById('location').value = 'Lagos';

    await loadProducts();
  } catch (error) {
    showNotice(
      formNotice,
      error.message || 'Could not save product. Please try again.'
    );
  } finally {
    isSaving = false;
    submitButton.disabled = false;
    submitButton.textContent = 'Save product';
  }
});

// Redirect to sign-in if the vendor is not logged in.
if (!token) {
  window.location.href = 'auth.html';
} else {
  loadProducts();
}

