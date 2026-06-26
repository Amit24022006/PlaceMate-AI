/* =============================================
   PlaceMate AI — Login.js
   Admin authentication (client-side / localStorage demo)
   ============================================= */

const LOGIN_KEYS = {
  creds:    'pm_admin_creds',
  auth:     'pm_admin_auth',
  attempts: 'pm_login_attempts',
  theme:    'pm_theme',
};

const MAX_ATTEMPTS   = 5;
const LOCKOUT_MS      = 30 * 1000;       // 30s lockout after too many tries
const SESSION_MS       = 12 * 60 * 60 * 1000; // 12h default session
const REMEMBER_MS      = 7 * 24 * 60 * 60 * 1000; // 7 days if "remember me"
const REDIRECT_TARGET  = new URLSearchParams(window.location.search).get('redirect') || 'index.html';

/* ── THEME (matches admin.js behaviour) ───────── */
(function initTheme() {
  const t = localStorage.getItem(LOGIN_KEYS.theme) || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem(LOGIN_KEYS.theme, next);
}

/* ── SEED DEFAULT CREDENTIALS (first run only) ── */
function seedCredentials() {
  if (!localStorage.getItem(LOGIN_KEYS.creds)) {
    localStorage.setItem(LOGIN_KEYS.creds, JSON.stringify({ username: 'admin', password: 'admin123' }));
  }
}
seedCredentials();

function getCredentials() {
  try { return JSON.parse(localStorage.getItem(LOGIN_KEYS.creds)); }
  catch { return { username: 'admin', password: 'admin123' }; }
}


/* ── ATTEMPT / LOCKOUT TRACKING ───────────────── */
function getAttempts() {
  try { return JSON.parse(localStorage.getItem(LOGIN_KEYS.attempts)) || { count: 0, lockUntil: 0 }; }
  catch { return { count: 0, lockUntil: 0 }; }
}
function saveAttempts(obj) { localStorage.setItem(LOGIN_KEYS.attempts, JSON.stringify(obj)); }
function clearAttempts()   { localStorage.removeItem(LOGIN_KEYS.attempts); }

function getLockRemaining() {
  const a = getAttempts();
  const remaining = a.lockUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

/* ── EXISTING SESSION CHECK ───────────────────── */
function readAuth(storage) {
  try { return JSON.parse(storage.getItem(LOGIN_KEYS.auth)); }
  catch { return null; }
}

function isAuthenticated() {
  const fromLocal   = readAuth(localStorage);
  const fromSession = readAuth(sessionStorage);
  const a = fromLocal || fromSession;
  if (!a) return false;
  return a.expires > Date.now();
}

// If already signed in, skip the form entirely
if (isAuthenticated()) {
  window.location.replace(REDIRECT_TARGET);
}

/* ── DOM REFS ──────────────────────────────────── */
const form         = document.getElementById('loginForm');
const usernameEl    = document.getElementById('username');
const passwordEl    = document.getElementById('password');
const rememberEl    = document.getElementById('rememberMe');
const errorBanner   = document.getElementById('errorBanner');
const errorText     = document.getElementById('errorText');
const loginCard     = document.getElementById('loginCard');
const loginBtn       = document.getElementById('loginBtn');
const loginBtnText  = document.getElementById('loginBtnText');

let lockTimer = null;

/* ── UI HELPERS ────────────────────────────────── */
function showError(msg) {
  errorText.textContent = msg;
  errorBanner.classList.add('show');
  loginCard.classList.remove('shake');
  // restart animation
  void loginCard.offsetWidth;
  loginCard.classList.add('shake');
}

function hideError() {
  errorBanner.classList.remove('show');
}

function setFieldError(hasError) {
  usernameEl.classList.toggle('input-error', hasError);
  passwordEl.classList.toggle('input-error', hasError);
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtnText.innerHTML = isLoading
    ? '<span class="spinner"></span> Signing in…'
    : 'Sign In';
}

function formatSeconds(ms) {
  return Math.ceil(ms / 1000);
}

/* ── LOCKOUT COUNTDOWN ────────────────────────── */
function startLockoutCountdown() {
  clearInterval(lockTimer);
  loginBtn.disabled = true;

  const tick = () => {
    const remaining = getLockRemaining();
    if (remaining <= 0) {
      clearInterval(lockTimer);
      loginBtn.disabled = false;
      hideError();
      return;
    }
    showError(`Too many attempts. Try again in ${formatSeconds(remaining)}s.`);
  };

  tick();
  lockTimer = setInterval(tick, 1000);
}

// If page loads mid-lockout, resume the countdown
if (getLockRemaining() > 0) {
  startLockoutCountdown();
}

/* ── PASSWORD VISIBILITY TOGGLE ───────────────── */
function togglePassword() {
  const isHidden = passwordEl.type === 'password';
  passwordEl.type = isHidden ? 'text' : 'password';
}

/* ── FORM SUBMIT ───────────────────────────────── */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  hideError();
  setFieldError(false);

  // Still locked out?
  if (getLockRemaining() > 0) {
    startLockoutCountdown();
    return;
  }

  const username = usernameEl.value.trim();
  const password = passwordEl.value;

  if (!username || !password) {
    setFieldError(true);
    showError('Please enter both username and password.');
    return;
  }

  setLoading(true);

  // Small delay for perceived feedback (this is a client-side demo check)
  setTimeout(() => {
    const creds = getCredentials();

    if (username === creds.username && password === creds.password) {
      clearAttempts();

      const remember = rememberEl.checked;
      const authPayload = {
        user: username,
        expires: Date.now() + (remember ? REMEMBER_MS : SESSION_MS),
      };

      if (remember) {
        localStorage.setItem(LOGIN_KEYS.auth, JSON.stringify(authPayload));
        sessionStorage.removeItem(LOGIN_KEYS.auth);
      } else {
        sessionStorage.setItem(LOGIN_KEYS.auth, JSON.stringify(authPayload));
        localStorage.removeItem(LOGIN_KEYS.auth);
      }

      loginBtnText.textContent = 'Success ✓';
      window.location.href = REDIRECT_TARGET;
      return;
    }

    // Failed attempt
    const a = getAttempts();
    a.count = (a.count || 0) + 1;

    if (a.count >= MAX_ATTEMPTS) {
      a.lockUntil = Date.now() + LOCKOUT_MS;
      a.count = 0;
      saveAttempts(a);
      setLoading(false);
      startLockoutCountdown();
    } else {
      saveAttempts(a);
      setLoading(false);
      setFieldError(true);
      showError(`Invalid username or password. ${MAX_ATTEMPTS - a.count} attempt(s) left.`);
    }

    passwordEl.value = '';
    passwordEl.focus();
  }, 450);
});

// Clear error state as the person edits the fields
[usernameEl, passwordEl].forEach(el => {
  el.addEventListener('input', () => {
    setFieldError(false);
    if (getLockRemaining() <= 0) hideError();
  });
});