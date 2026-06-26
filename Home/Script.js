// =============================================
//   PLACEMATE AI — Profile.js
// =============================================

// ── Navigation ──────────────────────────────
const navItems = document.querySelectorAll('.nav-item[data-page]');
const pages = document.querySelectorAll('.page');

function navigateTo(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  navItems.forEach(n => n.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  const navTarget = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (target) target.classList.add('active');
  if (navTarget) navTarget.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('mobile-open');
  }
}

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

// Quick access cards on dashboard
document.querySelectorAll('.qa-item[data-page]').forEach(item => {
  item.addEventListener('click', () => navigateTo(item.dataset.page));
});

// View all links with data-page
document.querySelectorAll('[data-page]').forEach(el => {
  if (el.tagName === 'A') {
    el.addEventListener('click', e => {
      e.preventDefault();
      if (el.dataset.page) navigateTo(el.dataset.page);
    });
  }
});

// ── Hamburger / Mobile Sidebar ───────────────
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// ── Compact Sidebar (Settings) ───────────────
const compactToggle = document.getElementById('compactSidebar');
compactToggle.addEventListener('change', () => {
  sidebar.classList.toggle('collapsed', compactToggle.checked);
  document.body.classList.toggle('sidebar-collapsed', compactToggle.checked);
});

// ── Dark Mode ────────────────────────────────
const darkToggle = document.getElementById('darkModeToggle');
darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkToggle.checked);
  localStorage.setItem('darkMode', darkToggle.checked);
});
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
  darkToggle.checked = true;
}

// ── Resume Analyzer ──────────────────────────
const uploadZone = document.getElementById('uploadZone');
const resumeFile = document.getElementById('resumeFile');
const uploadedFile = document.getElementById('uploadedFile');
const fileNameEl = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFile');
const analyzeBtn = document.getElementById('analyzeBtn');
const scoreCircle = document.getElementById('scoreCircle');
const scoreNumber = document.getElementById('scoreNumber');
const feedbackEmpty = document.getElementById('feedbackEmpty');
const feedbackList = document.getElementById('feedbackList');

uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});

resumeFile.addEventListener('change', () => {
  if (resumeFile.files[0]) handleFileSelect(resumeFile.files[0]);
});

function handleFileSelect(file) {
  fileNameEl.textContent = file.name;
  uploadZone.classList.add('hidden');
  uploadedFile.classList.remove('hidden');
  analyzeBtn.disabled = false;
}

removeFileBtn.addEventListener('click', () => {
  uploadZone.classList.remove('hidden');
  uploadedFile.classList.add('hidden');
  analyzeBtn.disabled = true;
  resumeFile.value = '';
  resetScore();
});

analyzeBtn.addEventListener('click', () => {
  analyzeBtn.textContent = 'Analyzing...';
  analyzeBtn.disabled = true;
  setTimeout(() => {
    const score = Math.floor(Math.random() * 30) + 60; // 60–90
    animateScore(score);
    showFeedback(score);
    analyzeBtn.textContent = 'Re-analyze';
    analyzeBtn.disabled = false;
  }, 2000);
});

function animateScore(target) {
  scoreNumber.textContent = '0';
  const dashArray = 314;
  const offset = dashArray - (target / 100) * dashArray;
  scoreCircle.style.strokeDashoffset = offset;

  let current = 0;
  const step = target / 60;
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    scoreNumber.textContent = Math.round(current);
    if (current >= target) clearInterval(interval);
  }, 16);

  document.getElementById('kwScore').textContent = Math.floor(Math.random() * 20 + 70) + '%';
  document.getElementById('fmtScore').textContent = Math.floor(Math.random() * 20 + 65) + '%';
  document.getElementById('skillScore').textContent = Math.floor(Math.random() * 20 + 60) + '%';
  document.getElementById('expScore').textContent = Math.floor(Math.random() * 20 + 55) + '%';
}

function resetScore() {
  scoreNumber.textContent = '0';
  scoreCircle.style.strokeDashoffset = 314;
  ['kwScore','fmtScore','skillScore','expScore'].forEach(id => { document.getElementById(id).textContent = '—'; });
  feedbackEmpty.classList.remove('hidden');
  feedbackList.classList.add('hidden');
  feedbackList.innerHTML = '';
}

function showFeedback(score) {
  feedbackEmpty.classList.add('hidden');
  feedbackList.classList.remove('hidden');
  const feedbacks = [
    { type: 'good', icon: '✅', title: 'Strong Work Experience Section', desc: 'Your work experience is well-described with clear impact metrics and action verbs.' },
    { type: score > 75 ? 'warn' : 'bad', icon: score > 75 ? '⚠️' : '❌', title: 'Missing Keywords', desc: 'Add more industry-specific keywords like "Agile", "CI/CD", "REST APIs" to improve ATS match.' },
    { type: 'good', icon: '✅', title: 'Good Contact Information', desc: 'Your contact details are clearly presented at the top of the resume.' },
    { type: 'warn', icon: '⚠️', title: 'Skills Section Could Be Stronger', desc: 'Consider grouping your skills into categories (Languages, Frameworks, Tools) for better readability.' },
    { type: score > 70 ? 'good' : 'bad', icon: score > 70 ? '✅' : '❌', title: 'Summary/Objective', desc: score > 70 ? 'Your professional summary effectively highlights your key strengths.' : 'Add a professional summary to immediately capture the recruiter\'s attention.' },
  ];
  feedbackList.innerHTML = feedbacks.map(f => `
    <div class="feedback-item ${f.type}">
      <span class="fb-icon">${f.icon}</span>
      <div class="fb-text">
        <strong>${f.title}</strong>
        <small>${f.desc}</small>
      </div>
    </div>
  `).join('');
}

// ── AI Mock Interview ────────────────────────
const questionBank = {
  technical: [
    "Explain the difference between == and === in JavaScript.",
    "What is the time complexity of a binary search algorithm?",
    "What is a closure in JavaScript? Provide an example.",
    "Explain the concept of RESTful APIs.",
    "What is the difference between SQL and NoSQL databases?",
  ],
  hr: [
    "Tell me about yourself.",
    "Why do you want to work at our company?",
    "What are your greatest strengths and weaknesses?",
    "Where do you see yourself in 5 years?",
    "Describe a challenging situation and how you handled it.",
  ],
  behavioral: [
    "Tell me about a time you worked in a team.",
    "Describe a situation where you had to meet a tight deadline.",
    "How do you handle conflict with a coworker?",
    "Give an example of a time you showed leadership.",
    "Tell me about a failure and what you learned from it.",
  ],
  system: [
    "Design a URL shortening service like bit.ly.",
    "How would you design a scalable chat application?",
    "Design a rate limiter for an API.",
    "Explain CAP theorem and how it applies to distributed systems.",
    "How would you design a ride-sharing system like Uber?",
  ]
};

const aiFeedbacks = [
  "Good answer! You covered the key concepts clearly. Consider adding a real-world example next time to make it more memorable.",
  "Solid response. Your explanation was structured well. Try to be more specific about edge cases to show deeper understanding.",
  "Great start! You demonstrated good foundational knowledge. Expand on the practical implications to impress senior interviewers.",
  "Nice work. Your answer shows understanding of the concept. Adding complexity analysis or trade-offs would strengthen it.",
  "Well done! Clear and concise. Consider mentioning alternative approaches to show breadth of knowledge.",
];

let currentQuestions = [];
let currentQIndex = 0;
let timerInterval = null;
let elapsedSeconds = 0;
let selectedType = 'technical';

document.querySelectorAll('.type-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.type-item').forEach(t => t.classList.remove('active'));
    item.classList.add('active');
    selectedType = item.dataset.type;
  });
});

document.getElementById('startInterview').addEventListener('click', () => {
  const role = document.getElementById('jobRole').value || 'Software Engineer';
  document.getElementById('arenaRole').textContent = role + ' · ' + selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
  currentQuestions = [...questionBank[selectedType]].sort(() => Math.random() - 0.5);
  currentQIndex = 0;
  showQuestion();
  document.querySelector('.interview-setup').classList.add('hidden');
  document.getElementById('interviewArena').classList.remove('hidden');
  startTimer();
});

document.getElementById('endInterview').addEventListener('click', () => {
  clearInterval(timerInterval);
  elapsedSeconds = 0;
  document.getElementById('arenaTimer').textContent = '00:00';
  document.getElementById('interviewArena').classList.add('hidden');
  document.querySelector('.interview-setup').classList.remove('hidden');
  document.getElementById('inlineFeedback').classList.add('hidden');
  document.getElementById('answerBox').value = '';
});

document.getElementById('submitAnswer').addEventListener('click', () => {
  const answer = document.getElementById('answerBox').value.trim();
  if (!answer) { alert('Please write your answer before submitting.'); return; }
  const fb = aiFeedbacks[Math.floor(Math.random() * aiFeedbacks.length)];
  const score = Math.floor(Math.random() * 4) + 6; // 6–10
  document.getElementById('feedbackText').textContent = fb;
  document.getElementById('fbScoreNum').textContent = score + '/10';
  document.getElementById('fbScoreBar').style.width = (score * 10) + '%';
  document.getElementById('inlineFeedback').classList.remove('hidden');
  currentQIndex++;
  setTimeout(() => {
    document.getElementById('inlineFeedback').classList.add('hidden');
    document.getElementById('answerBox').value = '';
    if (currentQIndex < currentQuestions.length) {
      showQuestion();
    } else {
      showQuestion(true);
    }
  }, 4000);
});

document.getElementById('skipQ').addEventListener('click', () => {
  currentQIndex++;
  document.getElementById('answerBox').value = '';
  document.getElementById('inlineFeedback').classList.add('hidden');
  if (currentQIndex < currentQuestions.length) showQuestion();
  else showQuestion(true);
});

function showQuestion(done = false) {
  if (done) {
    document.getElementById('qNumber').textContent = 'Complete!';
    document.getElementById('qText').textContent = '🎉 Interview complete! Great job. Click End to return.';
    return;
  }
  document.getElementById('qNumber').textContent = `Q${currentQIndex + 1} / ${currentQuestions.length}`;
  document.getElementById('qText').textContent = currentQuestions[currentQIndex];
}

function startTimer() {
  elapsedSeconds = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    document.getElementById('arenaTimer').textContent = `${m}:${s}`;
  }, 1000);
}

// ── Tests ────────────────────────────────────
const testData = [
  { name: 'JavaScript Basics', category: 'technical', tag: 'tech', qs: 20, icon: '💻', bg: '#e8f4ff', color: '#45aaf2' },
  { name: 'Quantitative Aptitude', category: 'aptitude', tag: 'apt', qs: 25, icon: '🔢', bg: '#fff4e6', color: '#fd9644' },
  { name: 'Verbal Reasoning', category: 'verbal', tag: 'verbal', qs: 15, icon: '📖', bg: '#edfdf5', color: '#26de81' },
  { name: 'Python Programming', category: 'coding', tag: 'coding', qs: 30, icon: '🐍', bg: '#ede9ff', color: '#6c63ff' },
  { name: 'Data Structures', category: 'technical', tag: 'tech', qs: 20, icon: '🌲', bg: '#e8f4ff', color: '#45aaf2' },
  { name: 'Logical Reasoning', category: 'aptitude', tag: 'apt', qs: 20, icon: '🧩', bg: '#fff4e6', color: '#fd9644' },
  { name: 'English Grammar', category: 'verbal', tag: 'verbal', qs: 20, icon: '✍️', bg: '#edfdf5', color: '#26de81' },
  { name: 'SQL Queries', category: 'coding', tag: 'coding', qs: 15, icon: '🗄️', bg: '#ede9ff', color: '#6c63ff' },
  { name: 'Operating Systems', category: 'technical', tag: 'tech', qs: 20, icon: '⚙️', bg: '#e8f4ff', color: '#45aaf2' },
  { name: 'React.js Concepts', category: 'coding', tag: 'coding', qs: 20, icon: '⚛️', bg: '#ede9ff', color: '#6c63ff' },
];

let currentFilter = 'all';

function renderTests(filter) {
  const grid = document.getElementById('testsGrid');
  const filtered = filter === 'all' ? testData : testData.filter(t => t.category === filter);
  grid.innerHTML = filtered.map(t => `
    <div class="test-card" data-category="${t.category}">
      <div class="tc-icon" style="background:${t.bg};color:${t.color}">${t.icon}</div>
      <span class="tc-name">${t.name}</span>
      <div class="tc-meta">
        <span class="tc-tag ${t.tag}">${t.tag.charAt(0).toUpperCase()+t.tag.slice(1)}</span>
        <span class="tc-qs">${t.qs} Questions</span>
      </div>
      <button class="tc-start" onclick="startTest('${t.name}', ${t.qs})">Start Test →</button>
    </div>
  `).join('');
}

renderTests('all');

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTests(currentFilter);
  });
});

window.startTest = function(name, qs) {
  alert(`Starting "${name}" test with ${qs} questions!\n\n(Full test engine would launch here.)`);
};

// ── Live Sessions ─────────────────────────────
const liveSessions = [
  { initials: 'JS', bg: '#45aaf2', title: 'JavaScript Fundamentals', host: 'Priya Sharma', status: 'live', time: 'Today, 4:00 PM', desc: 'Dive deep into JS closures, promises, and async/await patterns.' },
  { initials: 'DS', bg: '#6c63ff', title: 'Data Structures & Algorithms', host: 'Rahul Mehta', status: 'upcoming', time: 'Tomorrow, 10:00 AM', desc: 'Crack coding interviews with tree, graph, and DP problems.' },
  { initials: 'SY', bg: '#48cfad', title: 'System Design Interview Prep', host: 'Anika Patel', status: 'upcoming', time: 'Jun 10, 2:00 PM', desc: 'Learn to design scalable systems for top tech company interviews.' },
  { initials: 'ML', bg: '#fd9644', title: 'Machine Learning Basics', host: 'Vikram Singh', status: 'upcoming', time: 'Jun 11, 6:00 PM', desc: 'Introduction to supervised and unsupervised learning for interviews.' },
  { initials: 'RE', bg: '#fc5c65', title: 'React.js Deep Dive', host: 'Sneha Iyer', status: 'live', time: 'Today, 5:30 PM', desc: 'Hooks, context, and performance optimization in React.' },
  { initials: 'SQ', bg: '#4b7bec', title: 'SQL for Data Interviews', host: 'Arjun Das', status: 'upcoming', time: 'Jun 12, 3:00 PM', desc: 'Complex SQL queries, window functions, and query optimization.' },
];

function renderLiveSessions() {
  document.getElementById('liveGrid').innerHTML = liveSessions.map(s => `
    <div class="live-card">
      <div class="lc-header">
        <div class="lc-avatar" style="background:${s.bg}">${s.initials}</div>
        <div>
          <div class="lc-title">${s.title}</div>
          <div class="lc-host">by ${s.host}</div>
        </div>
      </div>
      <div class="lc-meta">
        <span class="lc-tag ${s.status}">${s.status === 'live' ? '🔴 LIVE' : '⏰ Upcoming'}</span>
      </div>
      <div class="lc-desc">${s.desc}</div>
      <div class="lc-time"><i class="fas fa-clock"></i> ${s.time}</div>
      <button class="lc-join">${s.status === 'live' ? 'Join Now →' : 'Set Reminder'}</button>
    </div>
  `).join('');
}

renderLiveSessions();

// ── Notifications ────────────────────────────
const notifData = [
  { icon: '🎯', bg: '#ede9ff', title: 'Resume Score Updated', desc: 'Your resume scored 78/100. Check the full report.', time: '2 min ago', unread: true },
  { icon: '📡', bg: '#e8f4ff', title: 'Live Session Starting', desc: '"JavaScript Fundamentals" starts in 30 minutes.', time: '28 min ago', unread: true },
  { icon: '🏆', bg: '#fff4e6', title: 'Test Result Available', desc: 'You scored 85% on the Data Structures test!', time: '2 hrs ago', unread: true },
  { icon: '🤖', bg: '#edfdf5', title: 'Interview Complete', desc: 'Your mock interview analysis is ready.', time: 'Yesterday', unread: false },
  { icon: '🎉', bg: '#ede9ff', title: 'New Feature: AI Chatbox', desc: 'Ask our AI anything about your career prep!', time: '2 days ago', unread: false },
];

function renderNotifications() {
  const list = document.getElementById('notifList');
  list.innerHTML = notifData.map((n, i) => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-index="${i}">
      <div class="notif-icon-wrap" style="background:${n.bg}">${n.icon}</div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.desc}</div>
      </div>
      <div class="notif-time">${n.time}</div>
      ${n.unread ? '<div class="unread-dot"></div>' : ''}
    </div>
  `).join('');

  document.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      const i = parseInt(item.dataset.index);
      notifData[i].unread = false;
      item.classList.remove('unread');
      item.querySelector('.unread-dot')?.remove();
      updateBadge();
    });
  });
}

function updateBadge() {
  const count = notifData.filter(n => n.unread).length;
  const badge = document.querySelector('.nav-item[data-page="notification"] .badge');
  if (badge) badge.textContent = count || '';
  if (!count && badge) badge.style.display = 'none';
}

document.getElementById('markAllRead').addEventListener('click', () => {
  notifData.forEach(n => n.unread = false);
  renderNotifications();
  updateBadge();
});

document.getElementById('clearAll').addEventListener('click', () => {
  notifData.length = 0;
  renderNotifications();
  updateBadge();
});

renderNotifications();

// ── Profile ──────────────────────────────────
document.getElementById('saveProfile').addEventListener('click', () => {
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || 'U';
  document.getElementById('profileAvatar').textContent = initials;
  document.querySelector('.user-avatar').textContent = initials[0] || 'U';
  document.querySelector('.user-name').textContent = (firstName + ' ' + lastName).trim() || 'Guest';
  if (firstName || lastName) document.querySelector('.user-status').textContent = 'Member';
  const msg = document.getElementById('saveMsg');
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 3000);
});

// ── Chat ─────────────────────────────────────
const chatFab = document.getElementById('chatFab');
const chatModal = document.getElementById('chatModal');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');

chatFab.addEventListener('click', () => chatModal.classList.toggle('hidden'));
chatClose.addEventListener('click', () => chatModal.classList.add('hidden'));

const botReplies = [
  "Great question! For interview prep, I'd recommend focusing on data structures and system design first.",
  "Resume tip: Use strong action verbs like 'architected', 'optimized', and 'delivered' with measurable impact.",
  "Practice makes perfect! Try doing at least one mock interview every day.",
  "For ATS optimization, make sure your resume includes keywords from the job description.",
  "Common interview topics include arrays, linked lists, trees, dynamic programming, and system design.",
  "Behavioral questions: Use the STAR method (Situation, Task, Action, Result) to structure your answers.",
  "I recommend practicing on LeetCode, HackerRank, or InterviewBit for coding interview prep!",
];

function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  addChatMsg(msg, 'user');
  chatInput.value = '';
  const typingEl = addChatMsg('Thinking...', 'bot typing');
  setTimeout(() => {
    typingEl.remove();
    addChatMsg(botReplies[Math.floor(Math.random() * botReplies.length)], 'bot');
  }, 1200);
}

function addChatMsg(text, type) {
  const div = document.createElement('div');
  div.className = 'chat-msg ' + type;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

chatSend.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });

// ── Init ─────────────────────────────────────
navigateTo('dashboard');