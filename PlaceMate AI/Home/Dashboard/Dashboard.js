// =========================================
//  PlaceMate AI – app.js
// =========================================

/* ---------- State ---------- */
const state = {
  user: null,
  resumeScore: 0,
  mockInterviews: 0,
  testsAttempted: 0,
  atsScore: 0,
  activities: []
};

/* ---------- DOM Helpers ---------- */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ---------- Toast ---------- */
function showToast(msg, icon = '✅') {
  const t = $('toast');
  t.querySelector('.toast-msg').textContent = msg;
  t.querySelector('.toast-icon').textContent = icon;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}




/* ---------- Modal helpers ---------- */
function openModal(id) {
  $(id).classList.add('open');
}
function closeModal(id) {
  $(id).classList.remove('open');
}


/* ---------- Init Dashboard ---------- */
function initDashboard() {
  const user = getUser();
  if (!user) {
    openModal('login-modal');
    return;
  }

  // Update greeting
  $('welcome-name').textContent = `Welcome back, ${user.name}! 👋`;
  $('welcome-sub').textContent  = 'Let\'s continue your preparation journey';

  // Update user avatar & name in sidebar
  $('sidebar-user-name').textContent = user.name;
  $('sidebar-user-email').textContent = user.email;
  $('sidebar-avatar').textContent = user.name.charAt(0).toUpperCase();

  // All numbers stay at 0 for new user (as per requirement)
  animateNumber('stat-resume-score', 0);
  animateNumber('stat-mock',         0);
  animateNumber('stat-tests',        0);

  updateResumeCircle(0);
  updateActivityList([]);
}

/* ---------- Animated Counter ---------- */
function animateNumber(id, target) {
  const el = $(id);
  if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const interval = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(interval);
  }, 30);
}

/* ---------- Resume Circle ---------- */
function updateResumeCircle(score) {
  const circle = document.querySelector('.progress-ring-fill');
  if (!circle) return;
  const r = 40;
  const c = 2 * Math.PI * r;
  const pct = score / 100;
  circle.style.strokeDasharray  = `${c}`;
  circle.style.strokeDashoffset = `${c - c * pct}`;
  $('resume-score-num').textContent = score;
  $('resume-score-num-main').textContent = score;
}

/* ---------- Activity List ---------- */
function updateActivityList(items) {
  const list = $('activity-list');
  if (!list) return;
  if (!items || items.length === 0) {
    list.innerHTML = `<div class="empty-state" style="text-align:center;padding:24px 0;color:var(--muted);font-size:0.88rem;">No recent activity yet. Start practicing! 🚀</div>`;
    return;
  }
  const icons = { chatbot: '💬', resume: '📄', interview: '🎥', test: '✏️' };
  const colors = { chatbot: 'purple', resume: 'green', interview: 'blue', test: 'orange' };
  list.innerHTML = items.map(a => `
    <div class="activity-item">
      <div class="activity-icon ${colors[a.type] || 'purple'}">${icons[a.type] || '📌'}</div>
      <div class="activity-text">
        <strong>${a.label}</strong>
        <span>${a.time}</span>
      </div>
      <span class="activity-time">${a.when}</span>
    </div>
  `).join('');
}

/* ---------- Sidebar Toggle ---------- */
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

/* ---------- Live Session Modal ---------- */
function joinSession(title) {
  const user = getUser();
  if (!user) { openModal('login-modal'); return; }
  $('session-title').textContent = title;
  openModal('session-modal');
}

function confirmJoin() {
  closeModal('session-modal');
  showToast('You have joined the session! 🎓');
  // Add to activity
  addActivity('interview', 'Joined Live Session', 'Just now');
}

/* ---------- Add Activity ---------- */
function addActivity(type, label, when) {
  const user = getUser();
  if (!user) return;
  const key = 'pm_activities_' + user.email;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.unshift({ type, label, when });
  if (existing.length > 10) existing.pop();
  localStorage.setItem(key, JSON.stringify(existing));
  updateActivityList(existing);
}

/* ---------- Quick Card Actions ---------- */
function handleQuickCard(action) {
  const user = getUser();
  if (!user) { openModal('login-modal'); return; }
  const map = {
    resume:    ['resume',    'Analyzed Resume', 'Just now'],
    interview: ['interview', 'Started Mock Interview', 'Just now'],
    test:      ['test',      'Attempted a Test', 'Just now'],
    session:   ['interview', 'Joined Live Session', 'Just now']
  };
  if (map[action]) {
    addActivity(...map[action]);
    showToast(`Opening ${action === 'session' ? 'Live Session' : action.charAt(0).toUpperCase() + action.slice(1)}... 🚀`);
  }
}

/* ---------- Nav active state ---------- */
function setActiveNav(el) {
  $$('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {

  // Sidebar hamburger
  const ham = $('hamburger-btn');
  if (ham) ham.addEventListener('click', toggleSidebar);

  // Close sidebar on overlay click (mobile)
  document.addEventListener('click', e => {
    const sidebar = document.querySelector('.sidebar');
    const ham2 = $('hamburger-btn');
    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) && e.target !== ham2) {
      sidebar.classList.remove('open');
    }
  });

  // Login form
  const loginForm = $('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Register form
  const regForm = $('register-form');
  if (regForm) regForm.addEventListener('submit', handleRegister);

  // Switch modal links
  const toReg = $('switch-to-register');
  if (toReg) toReg.addEventListener('click', () => { closeModal('login-modal'); openModal('register-modal'); });

  const toLogin = $('switch-to-login');
  if (toLogin) toLogin.addEventListener('click', () => { closeModal('register-modal'); openModal('login-modal'); });

  // Close buttons
  $$('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('open');
    });
  });

// Chatbot
// ──────────────────────────────────────────
const chatbotBtn   = document.getElementById('chatbotBtn');
const chatbotPanel = document.getElementById('chatbotPanel');
const chatClose    = document.getElementById('chatClose');
const chatSend     = document.getElementById('chatSend');
const chatInput    = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

chatbotBtn.addEventListener('click', () => {
  chatbotPanel.style.display = chatbotPanel.style.display === 'none' ? 'flex' : 'none';
});

chatClose.addEventListener('click', () => chatbotPanel.style.display = 'none');

chatSend.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage(); });

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';

  appendMsg('user', text);

  // Build messages array
  const systemMsg = analysisResult
    ? `You are an expert resume coach. The user has uploaded a resume and received this analysis: ${JSON.stringify(analysisResult)}. Help them improve their resume based on this analysis. Be concise, practical, and encouraging.`
    : `You are an expert resume coach. Help users improve their resumes. Be concise, practical, and encouraging.`;

  const messages = [
    ...chatContext,
    { role: 'user', content: text }
  ];

  // Typing bubble
  const typingDiv = appendTyping();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemMsg,
        messages: messages
      })
    });

    const data = await response.json();
    const reply = data.content.map(b => b.text || '').join('').trim();

    typingDiv.remove();
    appendMsg('bot', reply);

    // Update context
    chatContext.push({ role: 'user', content: text });
    chatContext.push({ role: 'assistant', content: reply });

    // Keep context manageable
    if (chatContext.length > 12) chatContext = chatContext.slice(-12);

  } catch (err) {
    typingDiv.remove();
    appendMsg('bot', 'Sorry, I had trouble connecting. Please try again.');
  }
}

function appendMsg(role, text) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function appendTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = '<div class="msg-bubble typing">Thinking</div>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

  // Nav links
  $$('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      setActiveNav(this);
      document.querySelector('.sidebar').classList.remove('open');
      const page = this.dataset.page;
      if (page) showToast(`Opening ${page}...`, '📂');
    });
  });

  // Session confirm
  const confirmBtn = $('confirm-join-btn');
  if (confirmBtn) confirmBtn.addEventListener('click', confirmJoin);

  // Init
  initDashboard();
});