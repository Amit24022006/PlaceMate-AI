/* =============================================
   PlaceMate AI — admin.js
   Full admin panel logic
   ============================================= */

/* ─────────────────────────────────────────────
   THEME
───────────────────────────────────────────── */
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('pm_theme', next);
}
(function initTheme() {
  const t = localStorage.getItem('pm_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
let toastTimer;
function showToast(msg, icon='✅') {
  const t = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ─────────────────────────────────────────────
   TABS
───────────────────────────────────────────── */
function switchTab(name, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

/* ─────────────────────────────────────────────
   STATS
───────────────────────────────────────────── */
function refreshStats() {
  animCount('statSubjects',  getSubjects().length);
  animCount('statQuestions', getQuestions().length);
  animCount('statSessions',  getSessions().length);
  animCount('statExams',     getExams().length);
}
function animCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 20));
  const iv = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(iv);
  }, 40);
}

/* ─────────────────────────────────────────────
   SUBJECTS TAB
───────────────────────────────────────────── */
function addSubject() {
  const name  = document.getElementById('newSubjectName').value.trim();
  const desc  = document.getElementById('newSubjectDesc').value.trim();
  const icon  = document.getElementById('newSubjectIcon').value.trim() || '📘';
  const color = document.getElementById('newSubjectColor').value;
  if (!name) { showToast('Enter a subject name', '⚠️'); return; }

  addSubjectData({ name, desc, icon, color, createdAt: new Date().toISOString() });

  // clear form
  ['newSubjectName','newSubjectDesc','newSubjectIcon'].forEach(id => document.getElementById(id).value = '');

  renderSubjectList();
  populateSubjectDropdowns();
  refreshStats();
  showToast(`"${name}" subject added!`);
}

function renderSubjectList() {
  const list = document.getElementById('adminSubjectList');
  const subs = getSubjects();
  document.getElementById('subjectCount').textContent = subs.length;

  if (!subs.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📚</div><p>No subjects yet — add one above.</p></div>`;
    return;
  }

  list.innerHTML = subs.map(s => `
    <div class="session-item" id="sub-${s.id}">
      <div class="session-item__avatar" style="background:var(--${s.color}-wash,var(--blue-wash))">${s.icon}</div>
      <div class="session-item__body">
        <div class="session-item__title">${esc(s.name)}</div>
        <div class="session-item__meta">
          <span class="badge badge--${s.color || 'blue'}">${s.color || 'blue'}</span>
          ${s.desc ? `<span>${esc(s.desc)}</span>` : ''}
          <span>${getQuestionsBySubject(s.id).length} questions</span>
        </div>
      </div>
      <div class="session-item__actions">
        <button class="btn btn--danger btn--sm" onclick="removeSubject('${s.id}')">🗑</button>
      </div>
    </div>`).join('');
}

function removeSubject(id) {
  if (!confirm('Delete this subject and ALL its questions?')) return;
  deleteSubjectData(id);
  // also remove linked questions
  saveQuestions(getQuestions().filter(q => q.subjectId !== id));
  renderSubjectList();
  renderQuestionList();
  populateSubjectDropdowns();
  refreshStats();
  showToast('Subject deleted', '🗑️');
}

/* ─────────────────────────────────────────────
   QUESTIONS TAB
───────────────────────────────────────────── */
function toggleOptions() {
  const sec = document.getElementById('qSection').value;
  document.getElementById('optionsArea').style.display = sec === 'A' ? 'block' : 'none';
}

function addQuestion() {
  const subjectId = document.getElementById('qSubject').value;
  const section   = document.getElementById('qSection').value;
  const text      = document.getElementById('qText').value.trim();
  const marks     = parseInt(document.getElementById('qMarks').value) || 1;

  if (!subjectId) { showToast('Select a subject first', '⚠️'); return; }
  if (!text)      { showToast('Enter question text', '⚠️');    return; }

  const q = { subjectId, section, text, marks, createdAt: new Date().toISOString() };

  if (section === 'A') {
    const opts = [
      document.getElementById('qOpt1').value.trim(),
      document.getElementById('qOpt2').value.trim(),
      document.getElementById('qOpt3').value.trim(),
      document.getElementById('qOpt4').value.trim(),
    ];
    if (opts.some(o => !o)) { showToast('Fill all four options', '⚠️'); return; }
    q.options  = opts;
    q.correct  = parseInt(document.getElementById('qCorrect').value);
  }

  addQuestionData(q);

  // reset form
  document.getElementById('qText').value = '';
  ['qOpt1','qOpt2','qOpt3','qOpt4'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });

  renderQuestionList();
  renderSubjectList(); // update question counts
  refreshStats();
  showToast('Question added!');
}

function renderQuestionList() {
  const container = document.getElementById('questionsBySubject');
  const filter    = document.getElementById('filterSubject').value;
  let   questions = getQuestions();

  if (filter !== 'all') questions = questions.filter(q => q.subjectId === filter);

  const subjects = getSubjects();

  if (!questions.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">❓</div><p>No questions match the filter.</p></div>`;
    return;
  }

  container.innerHTML = questions.map(q => {
    const sub   = subjects.find(s => s.id === q.subjectId);
    const label = ['Sec A — MCQ','Sec B — Short','Sec C — Long'][['A','B','C'].indexOf(q.section)] || q.section;
    return `
    <div class="q-item" id="qi-${q.id}">
      <div style="flex-shrink:0;font-size:1.2rem">${sub ? sub.icon : '❓'}</div>
      <div class="q-item__body">
        <div class="q-item__text">${esc(q.text)}</div>
        <div class="q-item__meta">
          <span class="badge badge--${sub ? sub.color : 'blue'}">${sub ? sub.name : '—'}</span>
          <span class="badge badge--purple">${label}</span>
          <span>${q.marks} mark${q.marks>1?'s':''}</span>
          ${q.options ? `<span>Options: ${q.options.map(esc).join(' / ')}</span>` : ''}
        </div>
      </div>
      <button class="btn btn--danger btn--sm" style="flex-shrink:0" onclick="removeQuestion('${q.id}')">🗑</button>
    </div>`;
  }).join('');
}

function removeQuestion(id) {
  deleteQuestionData(id);
  renderQuestionList();
  renderSubjectList();
  refreshStats();
  showToast('Question deleted', '🗑️');
}

function filterQList() {
  renderQuestionList();
  // also sync form dropdown
  const fv = document.getElementById('filterSubject').value;
  const qs = document.getElementById('qSubject');
  if (fv !== 'all') qs.value = fv;
}

/* ─────────────────────────────────────────────
   LIVE SESSIONS TAB
───────────────────────────────────────────── */
function updateChips() {
  document.querySelectorAll('.radio-chip').forEach(chip => {
    const input = chip.querySelector('input');
    chip.classList.toggle('checked', input.checked);
  });
}

let sessionFilter = 'all';

function addLiveSession() {
  const title    = document.getElementById('lsTitle').value.trim();
  const host     = document.getElementById('lsHost').value.trim();
  const platform = document.getElementById('lsPlatform').value;
  const link     = document.getElementById('lsLink').value.trim();
  const dateTime = document.getElementById('lsDateTime').value;
  const duration = document.getElementById('lsDuration').value;
  const desc     = document.getElementById('lsDesc').value.trim();
  const status   = document.querySelector('input[name="lsStatus"]:checked')?.value || 'upcoming';

  if (!title) { showToast('Enter a session title', '⚠️'); return; }
  if (!link)  { showToast('Paste the meeting link', '⚠️'); return; }

  const PLATFORM_ICONS = {
    'Google Meet': '🎥', 'Zoom': '💻',
    'Microsoft Teams': '💼', 'YouTube Live': '▶️', 'Other': '🔗'
  };

  addSessionData({
    title, host, platform, link, dateTime, duration, desc, status,
    icon: PLATFORM_ICONS[platform] || '🔗',
    createdAt: new Date().toISOString()
  });

  // clear form
  ['lsTitle','lsHost','lsLink','lsDesc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('lsDateTime').value = '';
  document.getElementById('lsDuration').value = '60';
  document.querySelector('input[name="lsStatus"][value="upcoming"]').checked = true;
  updateChips();

  renderSessionList();
  refreshStats();
  showToast('Live session saved & shared! 📡');
}

function renderSessionList() {
  const list     = document.getElementById('sessionList');
  let   sessions = getSessions();
  if (sessionFilter !== 'all') sessions = sessions.filter(s => s.status === sessionFilter);

  if (!sessions.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📡</div><p>No sessions found.</p></div>`;
    return;
  }

  list.innerHTML = sessions.slice().reverse().map(s => {
    const badgeClass = s.status === 'live' ? 'badge--live' : s.status === 'upcoming' ? 'badge--teal' : 'badge--blue';
    const badgeText  = s.status === 'live'
      ? '<span class="pulse-dot"></span>LIVE NOW'
      : s.status === 'upcoming' ? '⏰ Upcoming' : '✅ Done';
    const dtStr = s.dateTime ? new Date(s.dateTime).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}) : '—';
    return `
    <div class="session-item" id="ses-${s.id}">
      <div class="session-item__avatar" style="background:var(--teal-wash)">${s.icon}</div>
      <div class="session-item__body">
        <div class="session-item__title">${esc(s.title)}</div>
        <div class="session-item__meta">
          <span class="badge ${badgeClass}">${badgeText}</span>
          ${s.host ? `<span>🎓 ${esc(s.host)}</span>` : ''}
          <span>${esc(s.platform)}</span>
          ${s.dateTime ? `<span>📅 ${dtStr}</span>` : ''}
          ${s.duration ? `<span>⏱ ${s.duration} min</span>` : ''}
        </div>
        ${s.desc ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(s.desc)}</div>` : ''}
      </div>
      <div class="session-item__actions">
        <a href="${esc(s.link)}" target="_blank" class="btn btn--teal btn--sm">🔗 Join</a>
        <button class="btn btn--ghost btn--sm" onclick="copySessionLink('${s.id}')">📋 Copy</button>
        <button class="btn btn--danger btn--sm" onclick="removeSession('${s.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function filterSessions(status) {
  sessionFilter = status;
  renderSessionList();
  document.querySelectorAll('[id^="sf-"]').forEach(b => b.classList.remove('btn--primary'));
  const active = document.getElementById('sf-' + status);
  if (active) active.classList.add('btn--primary');
}

function copySessionLink(id) {
  const ses = getSessions().find(s => s.id === id);
  if (!ses) return;
  navigator.clipboard.writeText(ses.link).then(() => showToast('Session link copied!', '📋'));
}

function removeSession(id) {
  if (!confirm('Delete this live session?')) return;
  deleteSessionData(id);
  renderSessionList();
  refreshStats();
  showToast('Session deleted', '🗑️');
}

/* ─────────────────────────────────────────────
   EXAM LINKS TAB
───────────────────────────────────────────── */
function createExamLink() {
  const title        = document.getElementById('examTitle').value.trim();
  const subjectId    = document.getElementById('examSubject').value;
  const duration     = parseInt(document.getElementById('examDuration').value) || 60;
  const instructions = document.getElementById('examInstructions').value.trim();
  const showResult   = document.getElementById('examShowResult').checked;
  const examLink     = document.getElementById('examLink').value.trim();

  if (!title)     { showToast('Enter exam title', '⚠️');        return; }
  if (!subjectId) { showToast('Select a subject', '⚠️');        return; }

  const id   = uid();
  const qCount = getQuestionsBySubject(subjectId).length;

  addExamData({
    id, title, subjectId, duration, instructions, showResult,
    examLink, qCount,
    createdAt: new Date().toISOString(),
  });

  // Show generated link
  const generatedURL = examLink || `${window.location.origin}/exam.html?id=${id}`;
  document.getElementById('generatedLinkInput').value = generatedURL;
  document.getElementById('linkPreview').style.display = 'block';

  // clear form
  document.getElementById('examTitle').value = '';
  document.getElementById('examInstructions').value = '';
  document.getElementById('examLink').value = '';

  renderExamList();
  refreshStats();
  showToast('Exam link created! 🔗');
}

function renderExamList() {
  const list    = document.getElementById('examList');
  const exams   = getExams();
  const subjects = getSubjects();
  document.getElementById('examCountBadge').textContent = exams.length + (exams.length === 1 ? ' exam' : ' exams');

  if (!exams.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🔗</div><p>No exams created yet.</p></div>`;
    return;
  }

  list.innerHTML = exams.slice().reverse().map(e => {
    const sub = subjects.find(s => s.id === e.subjectId);
    const url = `${window.location.origin}/Exam.html?id=${e.id}`;
    const dt  = new Date(e.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
    return `
    <div class="exam-item" id="exam-${e.id}">
      <div style="font-size:1.6rem;flex-shrink:0">${sub ? sub.icon : '📝'}</div>
      <div class="exam-item__body">
        <div class="exam-item__title">${esc(e.title)}</div>
        <div class="exam-item__meta">
          ${sub ? `<span class="badge badge--${sub.color}">${esc(sub.name)}</span>` : ''}
          <span>⏱ ${e.duration} min</span>
          <span>❓ ${e.qCount} Qs</span>
          <span>📅 ${dt}</span>
          ${e.showResult ? '<span class="badge badge--teal">Results Shown</span>' : ''}
        </div>
        <div style="margin-top:6px;">
          <div class="link-box" style="max-width:100%;">
            <input type="text" value="${esc(url)}" readonly id="elink-${e.id}"/>
            <button class="btn btn--ghost btn--sm" onclick="copyExamLink('${e.id}','${escAttr(url)}')">Copy</button>
            <a href="${esc(url)}" target="_blank" class="btn btn--primary btn--sm">Open</a>
          </div>
        </div>
      </div>
      <div class="exam-item__actions">
        <button class="btn btn--danger btn--sm" onclick="removeExam('${e.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

function copyExamLink(id, url) {
  navigator.clipboard.writeText(url).then(() => showToast('Exam link copied!', '📋'));
}
function copyLink() {
  const val = document.getElementById('generatedLinkInput').value;
  navigator.clipboard.writeText(val).then(() => showToast('Link copied!', '📋'));
}
function openLink() {
  const val = document.getElementById('generatedLinkInput').value;
  if (val) window.open(val, '_blank');
}

function removeExam(id) {
  if (!confirm('Delete this exam?')) return;
  deleteExamData(id);
  renderExamList();
  refreshStats();
  showToast('Exam deleted', '🗑️');
}

/* ─────────────────────────────────────────────
   RESULTS TAB
───────────────────────────────────────────── */
function renderResults() {
  const container = document.getElementById('resultsContainer');
  const query     = (document.getElementById('resultSearch')?.value || '').toLowerCase();
  let   results   = getResults();

  if (query) results = results.filter(r =>
    r.name?.toLowerCase().includes(query) || r.examTitle?.toLowerCase().includes(query));

  if (!results.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📊</div><p>No results yet.</p></div>`;
    return;
  }

  container.innerHTML = results.slice().reverse().map(r => `
    <div class="result-row">
      <div style="width:36px;height:36px;border-radius:10px;background:var(--purple-wash);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">👤</div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:var(--font-display);font-weight:800;font-size:.87rem;">${esc(r.name || 'Anonymous')}</div>
        <div style="font-size:11.5px;color:var(--text-secondary);">${esc(r.examTitle || '—')} · ${r.date ? new Date(r.date).toLocaleDateString('en-IN') : ''}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:900;color:${r.pct>=60?'var(--accent-teal)':'var(--accent-coral)'};">${r.score}/${r.total}</div>
        <div style="font-size:11.5px;color:var(--text-secondary);">${r.pct}%</div>
      </div>
    </div>`).join('');
}

function filterResults() { renderResults(); }
function clearAllResults() {
  if (!confirm('Clear all results? This cannot be undone.')) return;
  clearResultsData();
  renderResults();
  showToast('All results cleared', '🗑️');
}

/* ─────────────────────────────────────────────
   SUBJECT DROPDOWNS
───────────────────────────────────────────── */
function populateSubjectDropdowns() {
  const subs = getSubjects();
  const opt  = s => `<option value="${s.id}">${s.icon} ${esc(s.name)}</option>`;
  const blank = '<option value="">— Select Subject —</option>';

  ['qSubject','examSubject'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value;
    el.innerHTML = blank + subs.map(opt).join('');
    if (subs.find(s => s.id === cur)) el.value = cur;
  });

  // filter dropdown
  const fd = document.getElementById('filterSubject');
  if (fd) {
    const cur2 = fd.value;
    fd.innerHTML = '<option value="all">All Subjects</option>' + subs.map(opt).join('');
    if (subs.find(s => s.id === cur2)) fd.value = cur2;
  }
}

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
function escAttr(str) { return esc(str); }

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Seed sample subject if empty
  if (!getSubjects().length) {
    addSubjectData({ name:'Data Structures', desc:'Arrays, Trees, Graphs & more', icon:'🧮', color:'blue' });
    addSubjectData({ name:'Aptitude',        desc:'Quantitative & Logical Reasoning', icon:'🧠', color:'purple' });
    addSubjectData({ name:'JavaScript',      desc:'Web & Node.js fundamentals', icon:'⚡', color:'amber' });
  }

  populateSubjectDropdowns();
  renderSubjectList();
  renderQuestionList();
  renderSessionList();
  renderExamList();
  renderResults();
  refreshStats();
  toggleOptions();
});
