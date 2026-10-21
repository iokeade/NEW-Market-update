
const API_BASE_URL = 'http://localhost:4001/api';

const token = localStorage.getItem('marketlink_rider_token');
const notice = document.getElementById('notice');

function showNotice(message, isError = false) {
  notice.textContent = message;
  notice.classList.toggle('error', isError);
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

function logout() {
  localStorage.removeItem('marketlink_rider_token');
  window.location.href = 'auth.html';
}

document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('refresh-btn').addEventListener('click', loadDashboard);

async function apiRequest(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error?.message || 'Request failed.');
  }

  return data;
}

async function loadDashboard() {
  if (!token) {
    showNotice('Please log in to your rider account first.', true);
    document.getElementById('available-list').innerHTML =
      '<p class="empty">Log in to view your dashboard.</p>';
    document.getElementById('assigned-list').innerHTML =
      '<p class="empty">Log in to view your deliveries.</p>';
    return;
  }

  try {
    const data = await apiRequest('/riders/me');
    const rider = data.rider;

    document.getElementById('rider-name').textContent = rider.full_name;
    document.getElementById('welcome-name').textContent = rider.full_name;
    document.getElementById('account-status').textContent = rider.status;

    // Delivery listing will be connected after the assignment API is built.
    document.getElementById('available-count').textContent = '0';
    document.getElementById('assigned-count').textContent = '0';

    document.getElementById('available-list').innerHTML =
      '<p class="empty">Delivery jobs are not connected yet. We will add the delivery API next.</p>';

    document.getElementById('assigned-list').innerHTML =
      '<p class="empty">You have no delivery list connected yet.</p>';

    showNotice('Your rider profile loaded successfully.');
  } catch (error) {
    showNotice(`${error.message} Please log in again if your session has expired.`, true);
  }
}

loadDashboard();
