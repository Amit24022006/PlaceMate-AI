/* =========================================
   PlaceMate AI – main.js
   Home page JavaScript
   ========================================= */

// ── Run everything after DOM is ready ──
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initCounterAnimation();
  initFeatureCardHover();
  initNavActiveLink();
  initStickyNavShadow();
  initCTAButtons();
});


/* ------------------------------------------
   1. NAVBAR – Log In / Sign Up links
------------------------------------------ */
function initNavbar() {
  const loginBtn  = document.querySelector('.nav-actions .btn-outline');
  const signupBtn = document.querySelector('.nav-actions .btn-primary');

  if (loginBtn)  loginBtn.setAttribute('href', 'Auntication/login.html');
  if (signupBtn) signupBtn.setAttribute('href', 'Auntication/signup.html');

  // "Get Started Free" hero button → signup
  const heroStart = document.querySelector('.hero-btns .btn-primary');
  if (heroStart) heroStart.setAttribute('href', 'Auntication/signup.html');

  // CTA banner button → signup
  const ctaBtn = document.querySelector('.cta-banner .btn-primary');
  if (ctaBtn) ctaBtn.setAttribute('href', 'Auntication/signup.html');
}


/* ------------------------------------------
   2. MOBILE HAMBURGER MENU
------------------------------------------ */
function initMobileMenu() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');

  // Create hamburger button
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.setAttribute('aria-label', 'Toggle menu');
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  navbar.appendChild(hamburger);

  // Inject hamburger styles
  const style = document.createElement('style');
  style.textContent = `
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }
    .hamburger span {
      display: block;
      width: 24px;
      height: 2px;
      background: #1a1a2e;
      border-radius: 2px;
      transition: all 0.3s ease;
    }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    .nav-links.open {
      display: flex !important;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: #fff;
      padding: 16px 24px 24px;
      border-top: 1px solid #e5e7f0;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      z-index: 99;
      gap: 16px;
    }
    @media (max-width: 768px) {
      .hamburger { display: flex; }
    }
  `;
  document.head.appendChild(style);

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}


/* ------------------------------------------
   3. SMOOTH SCROLL for anchor links
------------------------------------------ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}


/* ------------------------------------------
   4. SCROLL REVEAL – fade-in on scroll
------------------------------------------ */
function initScrollReveal() {
  // Add hidden class to animatable elements
  const targets = document.querySelectorAll(
    '.feature-card, .step, .hero-left, .hero-right, .cta-banner'
  );

  const revealStyle = document.createElement('style');
  revealStyle.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(revealStyle);

  targets.forEach(function (el, i) {
    el.classList.add('reveal');
    // stagger feature cards
    if (el.classList.contains('feature-card') || el.classList.contains('step')) {
      el.style.transitionDelay = (i % 5) * 80 + 'ms';
    }
  });

  // Observer
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function (el) { observer.observe(el); });
}


/* ------------------------------------------
   5. ANIMATED COUNTER for stats
------------------------------------------ */
function initCounterAnimation() {
  const stats = document.querySelectorAll('.hero-stats .stat strong');

  // Map display text → numeric end value + suffix
  const parseTarget = function (text) {
    if (text.includes('10,000')) return { end: 10000, suffix: '+', prefix: '' };
    if (text.includes('95'))     return { end: 95,    suffix: '%', prefix: '' };
    if (text.includes('4.8'))    return { end: 4.8,   suffix: '/5', prefix: '', decimal: true };
    return null;
  };

  const animateCounter = function (el, end, suffix, decimal) {
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;

      if (decimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else if (end >= 1000) {
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      } else {
        el.textContent = Math.floor(current) + suffix;
      }

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el   = entry.target;
      const data = parseTarget(el.textContent);
      if (!data) return;
      animateCounter(el, data.end, data.suffix, data.decimal);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(function (el) { observer.observe(el); });
}


/* ------------------------------------------
   6. FEATURE CARD – subtle tilt on hover
------------------------------------------ */
function initFeatureCardHover() {
  document.querySelectorAll('.feature-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -4;
      const rotateY = ((x - cx) / cx) *  4;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });
}


/* ------------------------------------------
   7. ACTIVE NAV LINK on scroll
------------------------------------------ */
function initNavActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', function () {
    let current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });

    links.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}


/* ------------------------------------------
   8. STICKY NAV – add shadow on scroll
------------------------------------------ */
function initStickyNavShadow() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      navbar.style.boxShadow = '0 2px 20px rgba(91,79,232,0.10)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });
}


/* ------------------------------------------
   9. CTA / FEATURE CARD BUTTONS – ripple
------------------------------------------ */
function initCTAButtons() {
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    .btn-primary, .btn-ghost {
      position: relative;
      overflow: hidden;
    }
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      transform: scale(0);
      animation: rippleAnim 0.55s linear;
      pointer-events: none;
    }
    @keyframes rippleAnim {
      to { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);

  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const circle = document.createElement('span');
      const diameter = Math.max(btn.clientWidth, btn.clientHeight);
      const rect = btn.getBoundingClientRect();
      circle.className = 'ripple';
      circle.style.width  = circle.style.height = diameter + 'px';
      circle.style.left   = (e.clientX - rect.left  - diameter / 2) + 'px';
      circle.style.top    = (e.clientY - rect.top   - diameter / 2) + 'px';
      btn.appendChild(circle);
      circle.addEventListener('animationend', function () { circle.remove(); });
    });
  });
}