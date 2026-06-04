/* =========================================
   PREPIFY AI – profile.js
   Profile setup wizard – full interactions
   ========================================= */

// Track which steps are done
var completed = { resume: false, basic: false, academic: false, additional: false, settings: false };
var steps = ['resume','basic','academic','additional','settings'];

document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initMobileSidebar();
  initAvatarUpload();
  initDragDrop();
  updateProgress();
});

/* ------------------------------------------
   1. NAVIGATION
------------------------------------------ */
function initNavigation() {
  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      switchSection(item.dataset.section);
    });
  });
}

function switchSection(name) {
  document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
  document.querySelectorAll('.section-panel').forEach(function (s) { s.classList.add('hidden'); });
  var navItem = document.querySelector('.nav-item[data-section="' + name + '"]');
  if (navItem) navItem.classList.add('active');
  var panel = document.getElementById('sec-' + name);
  if (panel) {
    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior:'smooth', block:'start' });
  }
  if (window.innerWidth <= 860) {
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open');
    var toggle = document.querySelector('.sidebar-toggle');
    if (toggle) toggle.textContent = '☰  Navigate Sections';
  }
}

function completeStep(current, next) {
  completed[current] = true;
  markDone(current);
  updateProgress();
  switchSection(next);
}

function goPrev(current, prev) {
  switchSection(prev);
}

function markDone(section) {
  var chk = document.getElementById('chk-' + section);
  if (chk) chk.classList.remove('hidden');
  var nav = document.querySelector('.nav-item[data-section="' + section + '"]');
  if (nav) nav.classList.add('done');
}

function updateProgress() {
  var done = Object.values(completed).filter(Boolean).length;
  var pct  = Math.round((done / steps.length) * 100);
  var mini = document.getElementById('miniBarFill');
  var lbl  = document.getElementById('progressLabel');
  if (mini) mini.style.width = pct + '%';
  if (lbl)  lbl.textContent  = pct + '% complete';
}

/* ------------------------------------------
   2. MOBILE SIDEBAR
------------------------------------------ */
function initMobileSidebar() {
  var sidebar = document.querySelector('.sidebar');
  var content = document.querySelector('.content');
  var toggle  = document.createElement('button');
  toggle.className   = 'sidebar-toggle';
  toggle.textContent = '☰  Navigate Sections';
  content.parentNode.insertBefore(toggle, content);

  toggle.addEventListener('click', function () {
    var open = sidebar.classList.toggle('open');
    toggle.textContent = open ? '✕  Close Menu' : '☰  Navigate Sections';
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) {
      sidebar.classList.remove('open');
      toggle.textContent = '☰  Navigate Sections';
    }
  });
}

/* ------------------------------------------
   3. AVATAR UPLOAD
------------------------------------------ */
function initAvatarUpload() {
  var input  = document.getElementById('avatarInput');
  var circle = document.getElementById('avatarCircle');
  var topAv  = document.getElementById('topAvatar');
  if (!input) return;

  input.addEventListener('change', function () {
    var file = input.files[0];
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      circle.style.backgroundImage    = 'url(' + e.target.result + ')';
      circle.style.backgroundSize     = 'cover';
      circle.style.backgroundPosition = 'center';
      circle.textContent = '';
      circle.classList.add('has-photo');
      if (topAv) { topAv.style.backgroundImage = 'url(' + e.target.result + ')'; topAv.style.backgroundSize = 'cover'; topAv.textContent = ''; }
      showToast('✅ Profile photo updated!', 'success');
    };
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------
   4. DRAG & DROP RESUME
------------------------------------------ */
function initDragDrop() {
  var zone = document.getElementById('resumeZone');
  if (!zone) return;

  zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', function ()  { zone.classList.remove('drag-over'); });
  zone.addEventListener('drop', function (e) {
    e.preventDefault();
    zone.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file) processResumeFile(file);
  });
}

/* ------------------------------------------
   5. RESUME UPLOAD
------------------------------------------ */
function handleResumeUpload(input) {
  var file = input.files[0];
  if (file) processResumeFile(file);
}

function processResumeFile(file) {
  var allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type)) {
    showToast('Only PDF, DOC, DOCX files are allowed.', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('File size must be under 5 MB.', 'error');
    return;
  }
  var ext  = file.name.split('.').pop().toUpperCase();
  var size = file.size < 1024*1024
    ? (file.size/1024).toFixed(0) + ' KB'
    : (file.size/1024/1024).toFixed(1) + ' MB';

  document.getElementById('resumeFileName').textContent = file.name;
  document.getElementById('resumeFileMeta').textContent = ext + ' • ' + size;
  document.getElementById('resumeZone').classList.add('hidden');
  document.getElementById('resumePreview').classList.remove('hidden');
  showToast('✅ Resume uploaded successfully!', 'success');
}

function removeResume() {
  document.getElementById('resumeFileName').textContent = '—';
  document.getElementById('resumeFileMeta').textContent = '—';
  document.getElementById('resumeFile').value = '';
  document.getElementById('resumeZone').classList.remove('hidden');
  document.getElementById('resumePreview').classList.add('hidden');
  showToast('Resume removed.', 'info');
}

/* ------------------------------------------
   6. BASIC INFO FORM
------------------------------------------ */
function submitBasic(e) {
  e.preventDefault();
  var ok = true;
  ok = requireField('b-name',   'Full name is required.')   && ok;
  ok = requireField('b-phone',  'Phone number is required.') && ok;
  ok = requireField('b-dob',    'Date of birth is required.') && ok;
  ok = requireSelect('b-gender','Please select your gender.') && ok;
  if (!ok) { showToast('Please fix the errors above.', 'error'); return; }

  // Update hero name
  var name = document.getElementById('b-name').value.trim();
  var heroName = document.getElementById('heroName');
  if (heroName) heroName.textContent = name;

  // Update avatar initials
  var initials = name.split(' ').map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase();
  var circle   = document.getElementById('avatarCircle');
  var topAv    = document.getElementById('topAvatar');
  if (circle && !circle.classList.contains('has-photo')) circle.textContent = initials;
  if (topAv  && !topAv.style.backgroundImage)            topAv.textContent  = initials;

  completeStep('basic','academic');
  showToast('✅ Basic info saved!', 'success');
}

/* ------------------------------------------
   7. ACADEMIC INFO FORM
------------------------------------------ */
function submitAcademic(e) {
  e.preventDefault();
  var ok = true;
  ok = requireField('a-institute', 'Institute name is required.') && ok;
  ok = requireField('a-batch',     'Batch year is required.')     && ok;
  ok = requireField('a-branch',    'Branch is required.')         && ok;
  ok = requireSelect('a-degree',   'Please select a degree.')     && ok;
  ok = requireField('a-10th',      '10th percentage is required.') && ok;
  ok = requireField('a-12th',      '12th percentage is required.') && ok;
  if (!ok) { showToast('Please fix the errors above.', 'error'); return; }

  // Update hero subtitle
  var institute = document.getElementById('a-institute').value.trim();
  var batch     = document.getElementById('a-batch').value.trim();
  var branch    = document.getElementById('a-branch').value.trim();
  var degree    = document.getElementById('a-degree').value;
  var heroSub   = document.getElementById('heroSub');
  if (heroSub) heroSub.textContent = institute + ' • ' + batch + ' • ' + branch + ' • ' + degree;

  completeStep('academic','additional');
  showToast('✅ Academic info saved!', 'success');
}

/* ------------------------------------------
   8. ADDITIONAL INFO FORM
------------------------------------------ */
function submitAdditional(e) {
  e.preventDefault();
  completeStep('additional','settings');
  showToast('✅ Additional info saved!', 'success');
}

/* ------------------------------------------
   9. SKILL PREVIEW (live tags)
------------------------------------------ */
function previewSkills(val) {
  var preview = document.getElementById('skillPreview');
  if (!preview) return;
  var skills = val.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  preview.innerHTML = skills.map(function(s){
    return '<span class="skill-tag">' + escHtml(s) + '</span>';
  }).join('');
}

/* ------------------------------------------
   10. PASSWORD
------------------------------------------ */
function checkStrength(val) {
  var fill  = document.getElementById('strengthFill');
  var label = document.getElementById('strengthLabel');
  if (!fill) return;
  var score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  var levels = [
    { pct:'0%',   color:'transparent', text:'' },
    { pct:'25%',  color:'#ef4444',     text:'Weak' },
    { pct:'50%',  color:'#f97316',     text:'Fair' },
    { pct:'75%',  color:'#eab308',     text:'Good' },
    { pct:'100%', color:'#22c55e',     text:'Strong ✓' }
  ];
  fill.style.width      = levels[score].pct;
  fill.style.background = levels[score].color;
  label.textContent     = levels[score].text;
  label.style.color     = levels[score].color;
}

function toggleVis(id, btn) {
  var input = document.getElementById(id);
  if (!input) return;
  if (input.type === 'password') { input.type = 'text';     btn.textContent = '🙈'; }
  else                           { input.type = 'password'; btn.textContent = '👁️'; }
}

function submitPassword(e) {
  e.preventDefault();
  var nw = document.getElementById('newPass').value;
  var cn = document.getElementById('conPass').value;
  var ok = true;

  clearErr('err-newPass'); clearErr('err-conPass');
  if (!nw)          { setErr('err-newPass','Password is required.'); ok=false; }
  else if(nw.length<8){ setErr('err-newPass','Minimum 8 characters.'); ok=false; }
  if (!cn)          { setErr('err-conPass','Please confirm your password.'); ok=false; }
  else if(nw !== cn){ setErr('err-conPass','Passwords do not match.'); ok=false; }

  if (!ok) return;
  markDone('settings');
  completed['settings'] = true;
  updateProgress();
  showToast('✅ Password saved!', 'success');
}

/* ------------------------------------------
   11. NOTIFICATIONS
------------------------------------------ */
function toggleNotif(checkbox, label) {
  showToast(
    checkbox.checked ? ('🔔 ' + label + ' notifications enabled.') : ('🔕 ' + label + ' notifications disabled.'),
    'info'
  );
}

/* ------------------------------------------
   12. FINISH PROFILE
------------------------------------------ */
function finishProfile() {
  var allDone = steps.every(function(s){ return completed[s]; });
  if (!allDone) {
    var missing = steps.filter(function(s){ return !completed[s]; })
                       .map(function(s){ return s.charAt(0).toUpperCase()+s.slice(1); });
    showToast('Please complete: ' + missing.join(', '), 'error');
    return;
  }
  showToast('🎉 Profile completed! Redirecting…', 'success');
  setTimeout(function(){ window.location.href = 'index.html'; }, 2000);
}

/* ------------------------------------------
   HELPERS
------------------------------------------ */
function requireField(id, msg) {
  var el = document.getElementById(id);
  var errId = 'err-' + id;
  clearErr(errId);
  if (!el || !el.value.trim()) {
    if (el) el.classList.add('invalid');
    setErr(errId, msg);
    return false;
  }
  el.classList.remove('invalid');
  el.style.borderColor = '#22c55e';
  return true;
}

function requireSelect(id, msg) {
  var el = document.getElementById(id);
  var errId = 'err-' + id;
  clearErr(errId);
  if (!el || !el.value) {
    if (el) el.classList.add('invalid');
    setErr(errId, msg);
    return false;
  }
  el.classList.remove('invalid');
  el.style.borderColor = '#22c55e';
  return true;
}

function setErr(id, msg) {
  var el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErr(id) {
  var el = document.getElementById(id);
  if (el) el.textContent = '';
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showToast(message, type) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className   = 'toast ' + (type || 'info');
  requestAnimationFrame(function(){ toast.classList.add('show'); });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function(){
    toast.classList.remove('show');
  }, 3200);
}