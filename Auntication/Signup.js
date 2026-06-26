/* =========================================
   PREPIFY AI – signup.js
   Sign Up page JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {
  initTogglePassword();
  initPasswordStrength();
  initPasswordMatch();
  initFormValidation();
  initSocialButtons();
  initInputFocusEffect();
  initPageEntrance();
  initCharCounter();
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
   2. PASSWORD STRENGTH METER
------------------------------------------ */
function initPasswordStrength() {
  const passEl = document.getElementById('password');
  if (!passEl) return;

  // Expose globally (used by oninput in HTML)
  window.checkStrength = function (val) {
    const fill  = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');
    if (!fill || !label) return;

    let score = 0;
    if (val.length >= 8)           score++;
    if (/[A-Z]/.test(val))         score++;
    if (/[0-9]/.test(val))         score++;
    if (/[^A-Za-z0-9]/.test(val))  score++;

    const levels = [
      { pct: '0%',   color: 'transparent', text: '' },
      { pct: '25%',  color: '#ef4444',     text: '🔴 Weak – add uppercase & numbers' },
      { pct: '50%',  color: '#f97316',     text: '🟠 Fair – add a special character' },
      { pct: '75%',  color: '#eab308',     text: '🟡 Good – almost there!' },
      { pct: '100%', color: '#22c55e',     text: '🟢 Strong password!' },
    ];

    fill.style.width      = levels[score].pct;
    fill.style.background = levels[score].color;
    label.textContent     = levels[score].text;
    label.style.color     = levels[score].color === 'transparent' ? '' : levels[score].color;

    // Also trigger match check if confirm has a value
    const confirm = document.getElementById('confirm');
    if (confirm && confirm.value) checkPasswordMatch();
  };
}


/* ------------------------------------------
   3. CONFIRM PASSWORD MATCH
------------------------------------------ */
function initPasswordMatch() {
  const confirmEl = document.getElementById('confirm');
  if (!confirmEl) return;

  confirmEl.addEventListener('input', checkPasswordMatch);
}

function checkPasswordMatch() {
  const pass    = document.getElementById('password');
  const confirm = document.getElementById('confirm');
  if (!pass || !confirm || !confirm.value) return;

  if (pass.value === confirm.value) {
    confirm.style.borderColor = '#22c55e';
    confirm.style.background  = '#f0fdf4';
    removeMatchError(confirm);
  } else {
    confirm.style.borderColor = '#ef4444';
    confirm.style.background  = '#fff5f5';
    showMatchError(confirm, 'Passwords do not match.');
  }
}

function showMatchError(input, msg) {
  removeMatchError(input);
  const err = document.createElement('small');
  err.className = 'match-error';
  err.textContent = msg;
  err.style.cssText = 'color:#ef4444;font-size:0.78rem;margin-top:4px;display:block;';
  const wrap = input.closest('.input-wrap') || input;
  wrap.parentNode.appendChild(err);
}

function removeMatchError(input) {
  const group = input.closest('.field-group');
  if (!group) return;
  const err = group.querySelector('.match-error');
  if (err) err.remove();
}


/* ------------------------------------------
   4. FULL FORM VALIDATION & SUBMIT
------------------------------------------ */
function initFormValidation() {
  const form      = document.querySelector('.auth-form');
  const submitBtn = document.querySelector('.btn-submit');
  if (!form) return;

  // Blur validations
  const fnameEl   = document.getElementById('fname');
  const lnameEl   = document.getElementById('lname');
  const emailEl   = document.getElementById('email');
  const passEl    = document.getElementById('password');
  const confirmEl = document.getElementById('confirm');
  const termsEl   = document.querySelector('input[type="checkbox"]');

  const fields = [fnameEl, lnameEl, emailEl, passEl, confirmEl].filter(Boolean);

  fields.forEach(function (input) {
    input.addEventListener('blur',  function () { validateField(input); });
    input.addEventListener('input', function () { clearFieldError(input); });
  });

  // Submit handler
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const allValid = fields.every(function (input) { return validateField(input); });

    if (!allValid) {
      shakeForm(form);
      showToast('⚠️ Please fix the errors above.', 'error');
      return;
    }

    if (passEl.value !== confirmEl.value) {
      showToast('⚠️ Passwords do not match.', 'error');
      return;
    }

    if (termsEl && !termsEl.checked) {
      showToast('⚠️ Please accept the Terms of Service.', 'error');
      return;
    }

    // Loading state
    submitBtn.textContent = 'Creating Account…';
    submitBtn.disabled    = true;
    submitBtn.style.opacity = '0.8';

    // Simulate account creation (replace with real API)
    setTimeout(function () {
      showToast('🎉 Account created! Welcome to PlaceMate AI.', 'success');
      setTimeout(function () {
        window.location.href = '../Profile/Profile.html';
      }, 1600);
    }, 1500);
  });
}

function validateField(input) {
  const val = input.value.trim();
  const id  = input.id;

  if (id === 'fname' || id === 'lname') {
    if (!val) {
      showFieldError(input, (id === 'fname' ? 'First' : 'Last') + ' name is required.');
      return false;
    }
    if (val.length < 2) {
      showFieldError(input, 'Name must be at least 2 characters.');
      return false;
    }
  }

  if (id === 'email') {
    if (!val) { showFieldError(input, 'Email is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      showFieldError(input, 'Enter a valid email address.');
      return false;
    }
  }

  if (id === 'password') {
    if (!val) { showFieldError(input, 'Password is required.'); return false; }
    if (val.length < 8) {
      showFieldError(input, 'Password must be at least 8 characters.');
      return false;
    }
  }

  if (id === 'confirm') {
    const pass = document.getElementById('password');
    if (!val) { showFieldError(input, 'Please confirm your password.'); return false; }
    if (pass && val !== pass.value) {
      showFieldError(input, 'Passwords do not match.');
      return false;
    }
  }

  clearFieldError(input);
  markFieldValid(input);
  return true;
}

function showFieldError(input, message) {
  clearFieldError(input);
  input.style.borderColor = '#ef4444';
  input.style.background  = '#fff5f5';

  const err = document.createElement('small');
  err.className = 'field-error';
  err.textContent = message;
  err.style.cssText = 'color:#ef4444;font-size:0.78rem;margin-top:4px;display:block;';

  const wrap = input.closest('.input-wrap') || input;
  wrap.parentNode.appendChild(err);
}

function clearFieldError(input) {
  input.style.borderColor = '';
  input.style.background  = '';
  const group = input.closest('.field-group');
  if (!group) return;
  const err = group.querySelector('.field-error');
  if (err) err.remove();
}

function markFieldValid(input) {
  input.style.borderColor = '#22c55e';
}

function shakeForm(form) {
  form.style.animation = 'none';
  form.offsetHeight; // reflow
  form.style.animation = 'shakeForm 0.4s ease';

  const s = document.getElementById('shake-style');
  if (!s) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.textContent = `
      @keyframes shakeForm {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-8px); }
        40%       { transform: translateX( 8px); }
        60%       { transform: translateX(-5px); }
        80%       { transform: translateX( 5px); }
      }
    `;
    document.head.appendChild(style);
  }
}


/* ------------------------------------------
   5. SOCIAL BUTTONS
------------------------------------------ */
function initSocialButtons() {
  document.querySelectorAll('.social-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const label    = btn.textContent.trim();
      const provider = label.includes('Google') ? 'Google' : 'LinkedIn';
      showToast('🔗 Redirecting to ' + provider + ' sign up…', 'info');
    });
  });
}


/* ------------------------------------------
   6. INPUT FOCUS EFFECT
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
   7. PAGE ENTRANCE ANIMATION
------------------------------------------ */
function initPageEntrance() {
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
   8. NAME FIELD CHARACTER COUNTER
------------------------------------------ */
function initCharCounter() {
  ['fname', 'lname'].forEach(function (id) {
    const input = document.getElementById(id);
    if (!input) return;
    const counter = document.createElement('small');
    counter.style.cssText = 'float:right;color:#9ca3af;font-size:0.72rem;';
    counter.textContent = '0 / 30';
    input.closest('.field-group').querySelector('label').appendChild(counter);

    input.addEventListener('input', function () {
      const len = input.value.length;
      counter.textContent = len + ' / 30';
      if (len > 25) counter.style.color = '#f97316';
      else          counter.style.color = '#9ca3af';
      if (input.value.length > 30) input.value = input.value.slice(0, 30);
    });
  });
}


/* ------------------------------------------
   HELPERS – Toast notification
------------------------------------------ */
function showToast(message, type) {
  injectToastStyles();

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('toast-show');
  });

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
    .toast.toast-show    { opacity: 1; transform: translateX(-50%) translateY(0); }
    .toast.toast-success { background: #166534; }
    .toast.toast-error   { background: #991b1b; }
    .toast.toast-info    { background: #1e3a8a; }
  `;
  document.head.appendChild(s);
}


/* ------------------------------------------
   HANDLE SIGNUP – called by Create Account button
------------------------------------------ */
function handleSignup() {
  const fnameEl   = document.getElementById('fname');
  const lnameEl   = document.getElementById('lname');
  const emailEl   = document.getElementById('email');
  const passEl    = document.getElementById('password');
  const confirmEl = document.getElementById('confirm');
  const termsEl   = document.querySelector('input[type="checkbox"]');
  const btn       = document.querySelector('.btn-submit');

  const fields = [fnameEl, lnameEl, emailEl, passEl, confirmEl].filter(Boolean);

  // Run validation on all fields
  const allValid = fields.every(function (input) { return validateField(input); });

  if (!allValid) {
    const form = document.querySelector('.auth-form');
    if (form) shakeForm(form);
    showToast('⚠️ Please fix the errors above.', 'error');
    return;
  }

  if (passEl && confirmEl && passEl.value !== confirmEl.value) {
    showToast('⚠️ Passwords do not match.', 'error');
    return;
  }

  if (termsEl && !termsEl.checked) {
    showToast('⚠️ Please accept the Terms of Service.', 'error');
    return;
  }

  // Loading state
  if (btn) {
    btn.textContent  = 'Creating Account…';
    btn.disabled     = true;
    btn.style.opacity = '0.8';
  }

  // Redirect to Profile after short delay
  setTimeout(function () {
    showToast('🎉 Account created! Welcome to PlaceMate AI.', 'success');
    setTimeout(function () {
      window.location.href = '../Profile/Profile.html';
    }, 1600);
  }, 1500);
}