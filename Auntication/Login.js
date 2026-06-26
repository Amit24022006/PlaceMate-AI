/* =========================================
   PlaceMate AI – login.js
   Login page JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {
  initTogglePassword();
  initFormValidation();
  initSocialButtons();
  initInputFocusEffect();
  initForgotPassword();
  initPageEntrance();
});


/* ------------------------------------------
   1. SHOW / HIDE PASSWORD
------------------------------------------ */
function initTogglePassword() {
  window.togglePass = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
      btn.setAttribute('aria-label', 'Hide password');
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
      btn.setAttribute('aria-label', 'Show password');
    }
  };
}


/* ------------------------------------------
   2. FORM VALIDATION & SUBMIT
------------------------------------------ */
function initFormValidation() {
  const form     = document.querySelector('.auth-form');
  const emailEl  = document.getElementById('email');
  const passEl   = document.getElementById('password');
  const submitBtn = document.querySelector('.btn-submit');

  if (!form) return;

  // Real-time email validation
  emailEl.addEventListener('blur', function () {
    validateEmail(emailEl);
  });

  // Real-time password validation
  passEl.addEventListener('blur', function () {
    validatePassword(passEl);
  });

  // Clear error on input
  [emailEl, passEl].forEach(function (input) {
    input.addEventListener('input', function () {
      clearError(input);
    });
  });

  // Submit
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const emailOk = validateEmail(emailEl);
    const passOk  = validatePassword(passEl);

    if (!emailOk || !passOk) return;

    // Show loading state
    submitBtn.textContent = 'Logging in…';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.8';

    // Simulate login (replace with real API call)
    setTimeout(function () {
      showToast('✅ Logged in successfully! Redirecting…', 'success');
      setTimeout(function () {
        window.location.href = 'index.html';
      }, 1500);
    }, 1400);
  });
}

function validateEmail(input) {
  const val = input.value.trim();
  if (!val) {
    showError(input, 'Email address is required.');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    showError(input, 'Please enter a valid email address.');
    return false;
  }
  clearError(input);
  markValid(input);
  return true;
}

function validatePassword(input) {
  const val = input.value;
  if (!val) {
    showError(input, 'Password is required.');
    return false;
  }
  if (val.length < 6) {
    showError(input, 'Password must be at least 6 characters.');
    return false;
  }
  clearError(input);
  markValid(input);
  return true;
}


/* ------------------------------------------
   3. SOCIAL BUTTONS
------------------------------------------ */
function initSocialButtons() {
  const socialBtns = document.querySelectorAll('.social-btn');

  socialBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const label = btn.textContent.trim();
      const provider = label.includes('Google') ? 'Google' : 'LinkedIn';
      showToast('🔗 Redirecting to ' + provider + ' login…', 'info');
    });
  });
}


/* ------------------------------------------
   4. INPUT FOCUS EFFECT
------------------------------------------ */
function initInputFocusEffect() {
  document.querySelectorAll('.field-group input').forEach(function (input) {
    input.addEventListener('focus', function () {
      const group = input.closest('.field-group');
      if (group) group.style.transform = 'scale(1.01)';
    });
    input.addEventListener('blur', function () {
      const group = input.closest('.field-group');
      if (group) group.style.transform = '';
    });
  });
}


/* ------------------------------------------
   5. FORGOT PASSWORD MODAL
------------------------------------------ */
function initForgotPassword() {
  const forgotLink = document.querySelector('.forgot-link');
  if (!forgotLink) return;

  forgotLink.addEventListener('click', function (e) {
    e.preventDefault();
    showForgotModal();
  });
}

function showForgotModal() {
  // Build modal
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>Reset Password</h3>
      <p>Enter your email and we'll send you a reset link.</p>
      <div class="field-group" style="margin: 16px 0;">
        <label for="reset-email">Email Address</label>
        <input type="email" id="reset-email" placeholder="you@example.com" />
      </div>
      <div class="modal-actions">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-send">Send Reset Link</button>
      </div>
    </div>
  `;

  injectModalStyles();
  document.body.appendChild(overlay);

  // Focus input
  setTimeout(function () {
    document.getElementById('reset-email').focus();
  }, 100);

  // Cancel
  overlay.querySelector('.btn-cancel').addEventListener('click', function () {
    overlay.remove();
  });

  // Close on overlay click
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });

  // Send link
  overlay.querySelector('.btn-send').addEventListener('click', function () {
    const email = document.getElementById('reset-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('⚠️ Please enter a valid email.', 'error');
      return;
    }
    overlay.remove();
    showToast('📧 Reset link sent to ' + email, 'success');
  });
}

function injectModalStyles() {
  if (document.getElementById('modal-styles')) return;
  const s = document.createElement('style');
  s.id = 'modal-styles';
  s.textContent = `
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 999;
      animation: fadeIn 0.2s ease;
    }
    .modal-box {
      background: #fff;
      border-radius: 16px;
      padding: 32px 28px;
      width: 90%; max-width: 380px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      animation: slideUp 0.25s ease;
    }
    .modal-box h3 {
      font-family: 'Sora', sans-serif;
      font-size: 1.2rem; font-weight: 700;
      color: #1a1a2e; margin-bottom: 6px;
    }
    .modal-box p { font-size: 0.88rem; color: #6b7280; margin-bottom: 4px; }
    .modal-actions { display: flex; gap: 10px; margin-top: 6px; }
    .btn-cancel {
      flex: 1; padding: 10px; border: 1.5px solid #e5e7f0;
      border-radius: 8px; background: #fff; font-size: 0.9rem;
      font-weight: 600; cursor: pointer; color: #1a1a2e;
    }
    .btn-cancel:hover { border-color: #5B4FE8; color: #5B4FE8; }
    .btn-send {
      flex: 2; padding: 10px; border: none;
      border-radius: 8px; background: #5B4FE8; color: #fff;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
    }
    .btn-send:hover { background: #4840c7; }
    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `;
  document.head.appendChild(s);
}


/* ------------------------------------------
   6. PAGE ENTRANCE ANIMATION
------------------------------------------ */
function initPageEntrance() {
  const left  = document.querySelector('.auth-left');
  const right = document.querySelector('.auth-right');

  const s = document.createElement('style');
  s.textContent = `
    .auth-left  { animation: slideInLeft  0.5s ease both; }
    .auth-right { animation: slideInRight 0.5s ease 0.1s both; }
    @keyframes slideInLeft  { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: none; } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX( 24px); } to { opacity: 1; transform: none; } }
  `;
  document.head.appendChild(s);
}


/* ------------------------------------------
   HELPERS – showError, clearError, toast
------------------------------------------ */
function showError(input, message) {
  clearError(input);
  input.style.borderColor = '#ef4444';
  input.style.background  = '#fff5f5';

  const err = document.createElement('small');
  err.className = 'field-error';
  err.textContent = message;
  err.style.cssText = 'color:#ef4444;font-size:0.78rem;margin-top:4px;display:block;';

  const wrap = input.closest('.input-wrap') || input;
  wrap.parentNode.appendChild(err);
}

function clearError(input) {
  input.style.borderColor = '';
  input.style.background  = '';

  const group = input.closest('.field-group');
  if (group) {
    const err = group.querySelector('.field-error');
    if (err) err.remove();
  }
}

function markValid(input) {
  input.style.borderColor = '#22c55e';
}

function showToast(message, type) {
  injectToastStyles();

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger show
  requestAnimationFrame(function () {
    toast.classList.add('toast-show');
  });

  // Remove after 3s
  setTimeout(function () {
    toast.classList.remove('toast-show');
    toast.addEventListener('transitionend', function () { toast.remove(); });
  }, 3000);
}

function injectToastStyles() {
  if (document.getElementById('toast-styles')) return;
  const s = document.createElement('style');
  s.id = 'toast-styles';
  s.textContent = `
    .toast {
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #1a1a2e; color: #fff;
      padding: 12px 22px; border-radius: 50px;
      font-size: 0.88rem; font-weight: 500;
      opacity: 0; transition: opacity 0.3s, transform 0.3s;
      z-index: 9999; white-space: nowrap;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    }
    .toast.toast-show   { opacity: 1; transform: translateX(-50%) translateY(0); }
    .toast.toast-success { background: #166534; }
    .toast.toast-error   { background: #991b1b; }
    .toast.toast-info    { background: #1e3a8a; }
  `;
  document.head.appendChild(s);
}