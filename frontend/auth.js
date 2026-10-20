
const API_BASE_URL = 'http://localhost:4001/api';

const form = document.getElementById('auth-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const businessField = document.getElementById('business-field');
const businessNameInput = document.getElementById('businessName');
const passwordInput = document.getElementById('password');
const title = document.getElementById('form-title');
const subtitle = document.getElementById('form-subtitle');
const submitButton = document.getElementById('submit-button');
const message = document.getElementById('form-message');

let mode = 'login';

function setMessage(text, type = '') {
  message.textContent = text;
  message.className = `message ${type}`;
}

function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === 'register';

  businessField.hidden = !registering;
  businessNameInput.required = registering;
  passwordInput.autocomplete = registering ? 'new-password' : 'current-password';

  loginTab.classList.toggle('active', !registering);
  registerTab.classList.toggle('active', registering);
  loginTab.setAttribute('aria-selected', String(!registering));
  registerTab.setAttribute('aria-selected', String(registering));

  title.textContent = registering ? 'Create your vendor account' : 'Welcome back';
  subtitle.textContent = registering
    ? 'Register your business to start using MarketLink.'
    : 'Sign in to manage your vendor account.';
  submitButton.textContent = registering ? 'Create Account' : 'Sign In';

  setMessage('');
}

loginTab.addEventListener('click', () => setMode('login'));
registerTab.addEventListener('click', () => setMode('register'));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('');

  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value;

  const payload = { email, password };

  if (mode === 'register') {
    payload.businessName = businessNameInput.value.trim();
  }

  submitButton.disabled = true;
  submitButton.textContent = mode === 'register' ? 'Creating account…' : 'Signing in…';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/${mode === 'register' ? 'register' : 'login'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Something went wrong. Please try again.');
    }

    sessionStorage.setItem('marketlinkVendorToken', result.token);
    sessionStorage.setItem('marketlinkVendor', JSON.stringify(result.vendor));

    setMessage('Success! Opening your vendor dashboard…', 'success');

    // The dashboard still needs its own token validation and protected API routes.
    window.location.href = 'vendor.html';
  } catch (error) {
    if (error instanceof TypeError) {
      setMessage('Cannot connect to MarketLink. Check that the backend is running on port 4001.', 'error');
    } else {
      setMessage(error.message, 'error');
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = mode === 'register' ? 'Create Account' : 'Sign In';
  }
});
