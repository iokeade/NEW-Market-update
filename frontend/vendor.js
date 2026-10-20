
/* =========================================
   MARKETLINK - VENDOR DASHBOARD
   Products, order activity and earnings overview
   ========================================= */

const API_BASE_URL = 'http://localhost:4001/api';

const productForm = document.getElementById('product-form');
const submitButton = document.getElementById('submit-button');
const formNotice = document.getElementById('form-notice');
const listNotice = document.getElementById('list-notice');
const productList = document.getElementById('product-list');
const productTotal = document.getElementById('product-total');

/* ---------- Shared helpers ---------- */

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function showNotice(element, message, type) {
  element.textContent = message;
  element.className = `notice ${type}`;
}

async function getErrorMessage(response) {
  try {
    const result = await response.json();
    return result?.error?.message ||
      result?.message ||
      `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

/* ---------- Dashboard layout ---------- */

/*
 * Add the sales dashboard above the existing product form.
 * No changes to vendor.html are required.
 */
function createSalesDashboard() {
  if (document.getElementById('sales-dashboard')) return;

  const styles = document.createElement('style');
  styles.textContent = `
    #sales-dashboard { margin-bottom: 24px; }
    .sales-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin: 18px 0;
    }
    .sales-card {
      background: #fff;
      border: 1px solid #e1e8e3;
      border-radius: 15px;
      padding: 20px;
      min-width: 0;
    }
    .sales-card-label {
      color: #68756d;
      font-size: 13px;
      margin-bottom: 10px;
    }
    .sales-card-value {
      color: #18251d;
      font-family: "Manrope", sans-serif;
      font-size: clamp(19px, 2.2vw, 27px);
      font-weight: 800;
      overflow-wrap: anywhere;
    }
    .sales-card-note {
      color: #68756d;
      font-size: 12px;
      margin-top: 8px;
    }
    .sales-panel {
      background: #fff;
      border: 1px solid #e1e8e3;
      border-radius: 18px;
      padding: 24px;
      margin-top: 18px;
      min-width: 0;
    }
    .sales-table-wrap { overflow-x: auto; }
    .sales-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      min-width: 650px;
    }
    .sales-table th, .sales-table td {
      text-align: left;
      padding: 13px 12px;
      border-bottom: 1px solid #e8eee9;
      vertical-align: top;
    }
    .sales-table th {
      color: #68756d;
      font-weight: 700;
      background: #f8faf8;
    }
    .sales-status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 20px;
      background: #f1f4f2;
      color: #46534a;
      font-size: 11px;
      font-weight: 700;
      text-transform: capitalize;
      white-space: nowrap;
    }
    .sales-status.paid {
      background: #eaf6ef;
      color: #17643a;
    }
    .sales-status.unpaid, .sales-status.pending {
      background: #fff4d6;
      color: #805b00;
    }
    .sales-notice {
      background: #fff8e8;
      border: 1px solid #f0dfb0;
      color: #765619;
      border-radius: 10px;
      padding: 13px 15px;
      font-size: 13px;
      margin-top: 16px;
    }
    .sales-muted {
      color: #68756d;
      font-size: 13px;
    }
    .sales-refresh {
      border: 1px solid #cbd8ce;
      background: white;
      color: #147d4a;
      border-radius: 9px;
      padding: 9px 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .sales-refresh:hover { background: #eaf6ef; }
    .sales-heading-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
    }
    @media (max-width: 900px) {
      .sales-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 480px) {
      .sales-grid { gap: 10px; }
      .sales-card { padding: 14px; }
      .sales-panel { padding: 16px; }
    }
  `;

  document.head.appendChild(styles);

  const dashboard = document.createElement('section');
  dashboard.id = 'sales-dashboard';
  dashboard.innerHTML = `
    <div class="sales-heading-row">
      <div>
        <div class="eyebrow">Sales overview</div>
        <h2 style="margin-top:8px;">Orders &amp; earnings</h2>
        <p class="section-description">
          Track order activity and MarketLink commission calculations.
        </p>
      </div>
      <button class="sales-refresh" id="refresh-sales" type="button">
        Refresh overview
      </button>
    </div>

    <div id="sales-message" class="notice" role="status"
         aria-live="polite"></div>

    <div class="sales-grid">
      <article class="sales-card">
        <div class="sales-card-label">Total orders</div>
        <div class="sales-card-value" id="metric-orders">—</div>
        <div class="sales-card-note">Orders recorded in the database</div>
      </article>

      <article class="sales-card">
        <div class="sales-card-label">Paid order value</div>
        <div class="sales-card-value" id="metric-paid">—</div>
        <div class="sales-card-note">Orders marked as paid by the API</div>
      </article>

      <article class="sales-card">
        <div class="sales-card-label">Awaiting payment</div>
        <div class="sales-card-value" id="metric-unpaid">—</div>
        <div class="sales-card-note">Unpaid or pending-payment orders</div>
      </article>

      <article class="sales-card">
        <div class="sales-card-label">Commission on paid orders</div>
        <div class="sales-card-value" id="metric-commission">—</div>
        <div class="sales-card-note">Calculated from paid order records</div>
      </article>
    </div>

    <section class="sales-panel" aria-labelledby="recent-orders-title">
      <h2 id="recent-orders-title">Recent orders</h2>
      <p class="section-description">
        Review order totals, payment status, and recorded commission.
      </p>
      <div id="orders-table-container">
        <div class="empty-state">Loading orders...</div>
      </div>
    </section>

    <div class="sales-notice">
      <strong>Vendor attribution is not ready yet.</strong>
      Products and order items do not have verified vendor ownership yet.
      These figures describe overall marketplace activity, not the earnings
      of a specific vendor. Payment status must also be verified by a payment
      provider before money is treated as received.
    </div>
  `;

  const intro = document.querySelector('main.container .intro');
  if (intro) {
    intro.insertAdjacentElement('afterend', dashboard);
  }

  document.getElementById('refresh-sales').addEventListener(
    'click',
    loadSalesOverview
  );
}

/* ---------- Products ---------- */

async function loadProducts() {
  productList.innerHTML =
    '<div class="empty-state">Loading products...</div>';

  try {
    const result = await fetchAPI('/products');

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('The products API returned an unexpected response.');
    }

    renderProducts(result.data);
  } catch (error) {
    console.error('Could not load products:', error);

    productList.innerHTML =
      '<div class="empty-state">Products could not be loaded. Check that the backend is running on port 4001, then reload this page.</div>';

    productTotal.textContent = 'Product list unavailable';

    showNotice(
      listNotice,
      error.message || 'Unable to connect to the MarketLink API.',
      'error'
    );
  }
}

function renderProducts(products) {
  listNotice.textContent = '';
  listNotice.className = 'notice';

  productTotal.textContent =
    `${products.length} product${products.length === 1 ? '' : 's'} in your database`;

  if (products.length === 0) {
    productList.innerHTML =
      '<div class="empty-state">No products yet. Use the form to add your first product.</div>';
    return;
  }

  productList.innerHTML = products.map(product => `
    <article class="product-item">
      <div>
        <h3>${escapeHTML(product.name)}</h3>
        <p class="product-meta">
          ${escapeHTML(product.category)}
          · ${escapeHTML(product.location || 'Nigeria')}
        </p>
        <p class="product-meta">
          Stock: ${Number(product.stock) || 0}
          · Per ${escapeHTML(product.unit || 'piece')}
        </p>
      </div>
      <div class="product-price">${formatPrice(product.price)}</div>
    </article>
  `).join('');
}

/* ---------- Sales and earnings overview ---------- */

function displayMetric(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value.replace(' ', 'T') + 'Z');

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function renderOrders(orders) {
  const container = document.getElementById('orders-table-container');

  if (!orders.length) {
    container.innerHTML =
      '<div class="empty-state">No orders have been created yet.</div>';
    return;
  }

  container.innerHTML = `
    <div class="sales-table-wrap">
      <table class="sales-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Order value</th>
            <th>Commission</th>
            <th>Payment</th>
            <th>Order status</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => {
            const paymentStatus = String(order.payment_status || 'unpaid')
              .toLowerCase();
            const orderStatus = String(order.status || 'pending')
              .toLowerCase();

            return `
              <tr>
                <td>
                  <strong>${escapeHTML(order.order_number || `Order ${order.id}`)}</strong>
                </td>
                <td>${escapeHTML(formatDate(order.created_at))}</td>
                <td>${formatPrice(order.total_amount)}</td>
                <td>${formatPrice(order.commission_total)}</td>
                <td>
                  <span class="sales-status ${escapeHTML(paymentStatus)}">
                    ${escapeHTML(paymentStatus.replaceAll('_', ' '))}
                  </span>
                </td>
                <td>
                  <span class="sales-status">
                    ${escapeHTML(orderStatus.replaceAll('_', ' '))}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function loadSalesOverview() {
  const message = document.getElementById('sales-message');
  const container = document.getElementById('orders-table-container');
  const refreshButton = document.getElementById('refresh-sales');

  refreshButton.disabled = true;
  refreshButton.textContent = 'Refreshing...';
  container.innerHTML =
    '<div class="empty-state">Loading orders...</div>';

  message.textContent = '';
  message.className = 'notice';

  try {
    const result = await fetchAPI('/orders');

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('The orders API returned an unexpected response.');
    }

    const orders = result.data;

    const paidOrders = orders.filter(
      order => order.payment_status === 'paid'
    );

    const awaitingPayment = orders.filter(
      order => ['unpaid', 'pending'].includes(order.payment_status)
    );

    const paidValue = paidOrders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );

    const awaitingValue = awaitingPayment.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );

    const paidCommission = paidOrders.reduce(
      (sum, order) => sum + Number(order.commission_total || 0),
      0
    );

    displayMetric('metric-orders', String(orders.length));
    displayMetric('metric-paid', formatPrice(paidValue));
    displayMetric('metric-unpaid', formatPrice(awaitingValue));
    displayMetric('metric-commission', formatPrice(paidCommission));

    renderOrders(orders);

    showNotice(
      message,
      'Overview updated. These are marketplace-wide figures, not verified earnings for an individual vendor.',
      'success'
    );
  } catch (error) {
    console.error('Could not load order overview:', error);

    container.innerHTML =
      '<div class="empty-state">Orders could not be loaded. Check the backend and try refreshing.</div>';

    showNotice(
      message,
      error.message || 'Unable to load order activity.',
      'error'
    );
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = 'Refresh overview';
  }
}

/* ---------- Create a product ---------- */

productForm.addEventListener('submit', async event => {
  event.preventDefault();

  formNotice.textContent = '';
  formNotice.className = 'notice';

  const formData = new FormData(productForm);

  const product = {
    name: String(formData.get('name') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    price: Number(formData.get('price')),
    unit: String(formData.get('unit') || 'piece'),
    location: String(formData.get('location') || 'Nigeria').trim(),
    description: String(formData.get('description') || '').trim(),
    image_url: String(formData.get('image_url') || '').trim(),
    stock: Number(formData.get('stock'))
  };

  if (
    !product.name ||
    !product.category ||
    !product.location ||
    !Number.isFinite(product.price) ||
    product.price < 0 ||
    !Number.isInteger(product.stock) ||
    product.stock < 0
  ) {
    showNotice(
      formNotice,
      'Please check the product details, price, location, and stock.',
      'error'
    );
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Saving product...';

  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || 'The product could not be saved.');
    }

    showNotice(
      formNotice,
      `${result.data.name} was saved successfully to MarketLink!`,
      'success'
    );

    productForm.reset();

    await loadProducts();
  } catch (error) {
    console.error('Could not save product:', error);

    showNotice(
      formNotice,
      error.message || 'Could not save the product. Check your connection and try again.',
      'error'
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Save product';
  }
});

/* ---------- Start the page ---------- */

createSalesDashboard();
loadProducts();
loadSalesOverview();
