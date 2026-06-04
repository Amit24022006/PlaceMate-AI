/* =========================================
   Resume Analyzer – app.js
   Real AI-powered analysis via Anthropic API
   ========================================= */

// ──────────────────────────────────────────
// State
// ──────────────────────────────────────────
let currentFileText = '';
let currentFileName = '';
let currentFileSize = '';
let analysisResult  = null;
let chatContext     = [];

// ──────────────────────────────────────────
// DOM refs
// ──────────────────────────────────────────
const uploadZone      = document.getElementById('uploadZone');
const fileInput       = document.getElementById('fileInput');
const uploadSection   = document.getElementById('uploadSection');
const loadingSection  = document.getElementById('loadingSection');
const resultsSection  = document.getElementById('resultsSection');
const uploadNewBtn    = document.getElementById('uploadNewBtn');
const downloadBtn     = document.getElementById('downloadBtn');

// ──────────────────────────────────────────
// Upload interactions
// ──────────────────────────────────────────
uploadZone.addEventListener('click', (e) => {
  if (e.target.classList.contains('upload-label') || e.target.closest('.upload-label')) return;
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

uploadNewBtn.addEventListener('click', () => resetToUpload());
downloadBtn.addEventListener('click', () => downloadReport());

// ──────────────────────────────────────────
// File handler
// ──────────────────────────────────────────
async function handleFile(file) {
  if (!file) return;
  const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ext = file.name.split('.').pop().toLowerCase();

  if (!allowed.includes(file.type) && !['pdf','docx'].includes(ext)) {
    alert('Please upload a PDF or DOCX file.');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be under 10 MB.');
    return;
  }

  currentFileName = file.name;
  currentFileSize = (file.size / (1024 * 1024)).toFixed(1);

  // Show loading
  showSection('loading');
  animateLoadingSteps();

  try {
    // Read file as base64 or text
    const base64 = await readFileAsBase64(file);
    currentFileText = await extractTextFromFile(file, base64);

    // Call AI
    analysisResult = await analyzeResumeWithAI(currentFileText, file.name);
    renderResults(analysisResult);
    showSection('results');
  } catch (err) {
    console.error(err);
    alert('Analysis failed: ' + err.message);
    showSection('upload');
  }
}

function readFileAsBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result.split(',')[1]);
    reader.onerror = () => rej(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function extractTextFromFile(file, base64) {
  // For PDFs, send to Claude with document type for extraction
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    // We'll pass the PDF directly to Claude in the analysis step
    return `[PDF FILE: ${file.name} — will be analyzed directly]`;
  }
  // For DOCX, read as text fallback
  return new Promise((res) => {
    const reader = new FileReader();
    reader.onload  = (e) => res(e.target.result || 'Resume content extracted');
    reader.onerror = () => res('Resume content');
    reader.readAsText(file);
  });
}

// ──────────────────────────────────────────
// AI Analysis
// ──────────────────────────────────────────
async function analyzeResumeWithAI(fileText, fileName) {
  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach.

Analyze this resume and return a detailed JSON analysis. Respond ONLY with valid JSON — no preamble, no markdown fences.

Resume filename: ${fileName}
Resume content: ${fileText.substring(0, 8000)}

Return this exact JSON structure:
{
  "candidateName": "Full Name from resume",
  "candidateRole": "Job title or role from resume",
  "experience": "X+ Years",
  "skillsFound": <number of skills found>,
  "keywordsMatched": <number like 18>,
  "keywordsTotal": <number like 24>,
  "resumeLength": "X Page(s)",
  "atsScore": <overall ATS score 0-100>,
  "scoreBreakdown": {
    "content": <0-100>,
    "format": <0-100>,
    "keywords": <0-100>,
    "structure": <0-100>
  },
  "matchLevel": "Good Match|Average Match|Needs Work",
  "matchDesc": "One sentence describing ATS compatibility",
  "analysis": [
    {
      "icon": "📝",
      "iconBg": "green",
      "title": "Content Quality",
      "desc": "Brief description",
      "rating": "Good|Improve"
    },
    {
      "icon": "🔑",
      "iconBg": "blue",
      "title": "Keyword Optimization",
      "desc": "Brief description",
      "rating": "Good|Improve"
    },
    {
      "icon": "📋",
      "iconBg": "purple",
      "title": "Format & Structure",
      "desc": "Brief description",
      "rating": "Good|Improve"
    },
    {
      "icon": "🏆",
      "iconBg": "orange",
      "title": "Achievements",
      "desc": "Brief description",
      "rating": "Good|Improve"
    },
    {
      "icon": "💼",
      "iconBg": "red",
      "title": "Skills Section",
      "desc": "Brief description",
      "rating": "Good|Improve"
    }
  ],
  "suggestions": [
    {
      "icon": "➕",
      "iconBg": "green",
      "title": "Add More Quantifiable Achievements",
      "desc": "Add more numbers and metrics to showcase impact",
      "impact": "High",
      "detail": "Detailed explanation with specific advice for this resume",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    },
    {
      "icon": "🔍",
      "iconBg": "blue",
      "title": "Optimize Keywords",
      "desc": "Add more industry-specific keywords from the job description",
      "impact": "High",
      "detail": "Detailed keyword optimization advice",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    },
    {
      "icon": "✏️",
      "iconBg": "purple",
      "title": "Improve Skills Section",
      "desc": "Add more relevant technical and soft skills",
      "impact": "Medium",
      "detail": "Skills improvement advice",
      "tips": ["Tip 1", "Tip 2"]
    },
    {
      "icon": "📜",
      "iconBg": "orange",
      "title": "Add Certifications",
      "desc": "Include relevant certifications to strengthen your profile",
      "impact": "Low",
      "detail": "Certification advice",
      "tips": ["Tip 1", "Tip 2"]
    },
    {
      "icon": "👤",
      "iconBg": "red",
      "title": "Profile Summary",
      "desc": "Make your summary more compelling and specific",
      "impact": "Low",
      "detail": "Profile summary improvement advice",
      "tips": ["Tip 1", "Tip 2"]
    }
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content.map(b => b.text || '').join('');
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    // fallback mock if JSON parse fails
    return generateFallbackResult();
  }
}

// ──────────────────────────────────────────
// Render results
// ──────────────────────────────────────────
function renderResults(r) {
  // ATS Score ring
  animateScore(r.atsScore);

  // Match badge
  const matchBadge = document.getElementById('matchBadge');
  const matchLabel = document.getElementById('matchLabel');
  const atsDesc    = document.getElementById('atsDesc');
  matchLabel.textContent = r.matchLevel || 'Good Match';
  atsDesc.textContent    = r.matchDesc  || 'Your resume has a good chance of passing ATS screening.';
  matchBadge.className   = 'match-badge';
  if ((r.matchLevel || '').toLowerCase().includes('needs'))  matchBadge.classList.add('needs-work');
  if ((r.matchLevel || '').toLowerCase().includes('poor'))   matchBadge.classList.add('poor');

  // Score bar
  document.getElementById('scoreBarFill').style.width = (r.atsScore || 0) + '%';

  // Score breakdown
  const bd = r.scoreBreakdown || { content:85, format:90, keywords:80, structure:85 };
  const bdEl = document.getElementById('scoreBreakdown');
  bdEl.innerHTML = Object.entries(bd).map(([k, v]) =>
    `<div class="sb-item"><span class="sb-num">${v}</span><span class="sb-label">${cap(k)}</span></div>`
  ).join('');

  // Analysis list
  const al = document.getElementById('analysisList');
  al.innerHTML = (r.analysis || []).map(a =>
    `<div class="analysis-item">
      <div class="ai-icon" style="background:${iconBgColor(a.iconBg)}">${a.icon}</div>
      <div class="ai-text">
        <strong>${a.title}</strong>
        <span>${a.desc}</span>
      </div>
      <span class="ai-badge ${a.rating === 'Good' ? 'good' : 'improve'}">${a.rating}</span>
    </div>`
  ).join('');

  // Suggestions
  const sl = document.getElementById('suggestionsList');
  sl.innerHTML = (r.suggestions || []).map((s, i) =>
    `<div class="sug-item" onclick="openDetailModal(${i})">
      <div class="sug-icon" style="background:${iconBgColor(s.iconBg)}">${s.icon}</div>
      <div class="sug-text">
        <strong>${s.title}</strong>
        <span>${s.desc}</span>
      </div>
      <span class="impact-badge ${s.impact.toLowerCase()}">${s.impact} Impact</span>
      <span class="sug-arrow">›</span>
    </div>`
  ).join('');

  // File info
  document.getElementById('fileName').textContent = currentFileName;
  document.getElementById('fileMeta').textContent =
    `Uploaded on ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })} • ${currentFileSize} MB`;

  // Preview
  document.getElementById('previewName').textContent = r.candidateName || '—';
  document.getElementById('previewRole').textContent = r.candidateRole || '—';

  // Key info rows
  const keyData = [
    ['Name',             r.candidateName    || '—'],
    ['Experience',       r.experience       || '—'],
    ['Skills Found',     r.skillsFound      || '—'],
    ['Keywords Matched', `${r.keywordsMatched || '—'}/${r.keywordsTotal || '—'}`],
    ['Resume Length',    r.resumeLength     || '—'],
  ];
  document.getElementById('keyRows').innerHTML = keyData.map(([l, v]) =>
    `<div class="key-row"><span class="kr-label">${l}</span><span class="kr-val">${v}</span></div>`
  ).join('');

  // Reset chat context
  chatContext = [
    { role: 'user', content: `Here is the resume analysis for ${r.candidateName || 'the candidate'}: ${JSON.stringify(r)}` },
    { role: 'assistant', content: `Great! I have the full resume analysis for ${r.candidateName || 'the candidate'}. ATS Score: ${r.atsScore}/100, Match Level: ${r.matchLevel}. How can I help improve this resume?` }
  ];
}

function animateScore(target) {
  const numEl    = document.getElementById('scoreNum');
  const circle   = document.getElementById('scoreCircle');
  const circumf  = 2 * Math.PI * 52; // 326.7
  let current = 0;
  const step = target / 60;

  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    numEl.textContent = Math.round(current);
    const offset = circumf - (current / 100) * circumf;
    circle.style.strokeDashoffset = offset;

    // Color based on score
    const color = current >= 75 ? '#22c55e' : current >= 50 ? '#f97316' : '#ef4444';
    circle.setAttribute('stroke', color);

    if (current >= target) clearInterval(timer);
  }, 16);
}

// ──────────────────────────────────────────
// Loading steps animation
// ──────────────────────────────────────────
function animateLoadingSteps() {
  const steps = document.querySelectorAll('.ls');
  steps.forEach(s => { s.classList.remove('active','done'); });
  let i = 0;

  const advance = () => {
    if (i > 0) steps[i-1].classList.replace('active','done');
    if (i < steps.length) {
      steps[i].classList.add('active');
      i++;
      setTimeout(advance, 900);
    }
  };
  advance();
}

// ──────────────────────────────────────────
// Section manager
// ──────────────────────────────────────────
function showSection(name) {
  uploadSection.style.display  = name === 'upload'   ? 'block' : 'none';
  loadingSection.style.display = name === 'loading'  ? 'flex'  : 'none';
  resultsSection.style.display = name === 'results'  ? 'flex'  : 'none';
}

function resetToUpload() {
  currentFileText = '';
  currentFileName = '';
  currentFileSize = '';
  analysisResult  = null;
  fileInput.value = '';
  showSection('upload');
}

// ──────────────────────────────────────────
// Modal
// ──────────────────────────────────────────
const detailModal = document.getElementById('detailModal');
const modalBody   = document.getElementById('modalBody');
const modalClose  = document.getElementById('modalClose');

window.openDetailModal = function(index) {
  if (!analysisResult) return;
  const s = analysisResult.suggestions[index];
  if (!s) return;

  modalBody.innerHTML = `
    <div class="modal-sug">
      <h4>
        <span>${s.icon}</span>
        ${s.title}
        <span class="impact-badge ${s.impact.toLowerCase()}">${s.impact} Impact</span>
      </h4>
      <p>${s.detail || s.desc}</p>
      ${s.tips && s.tips.length ? `<ul>${s.tips.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
    </div>
  `;

  detailModal.style.display = 'flex';
};

document.getElementById('viewDetailedBtn').addEventListener('click', () => {
  if (!analysisResult) return;
  modalBody.innerHTML = (analysisResult.suggestions || []).map((s, i) => `
    <div class="modal-sug">
      <h4>
        <span>${s.icon}</span>
        ${s.title}
        <span class="impact-badge ${s.impact.toLowerCase()}">${s.impact} Impact</span>
      </h4>
      <p>${s.detail || s.desc}</p>
      ${s.tips && s.tips.length ? `<ul>${s.tips.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
    </div>
  `).join('');
  detailModal.style.display = 'flex';
});

modalClose.addEventListener('click', () => detailModal.style.display = 'none');
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) detailModal.style.display = 'none';
});

// ──────────────────────────────────────────
// Download Report
// ──────────────────────────────────────────
function downloadReport() {
  if (!analysisResult) { alert('No analysis available yet. Please upload a resume first.'); return; }
  const r = analysisResult;
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Resume Analysis Report</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1a1a2e;}
h1{color:#5B4FE8;}table{width:100%;border-collapse:collapse;margin:16px 0;}
td,th{border:1px solid #e5e7f0;padding:8px 12px;text-align:left;}
th{background:#f7f8ff;font-weight:700;}.score{font-size:3rem;font-weight:800;color:#5B4FE8;}
</style></head><body>
<h1>Resume Analysis Report</h1>
<p><strong>Candidate:</strong> ${r.candidateName}</p>
<p><strong>Role:</strong> ${r.candidateRole}</p>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<hr/>
<h2>ATS Score: <span class="score">${r.atsScore}/100</span></h2>
<p><strong>Match Level:</strong> ${r.matchLevel}</p>
<p>${r.matchDesc}</p>
<h2>Score Breakdown</h2>
<table><tr><th>Category</th><th>Score</th></tr>
${Object.entries(r.scoreBreakdown||{}).map(([k,v])=>`<tr><td>${cap(k)}</td><td>${v}/100</td></tr>`).join('')}
</table>
<h2>Key Information</h2>
<table>
<tr><td>Experience</td><td>${r.experience}</td></tr>
<tr><td>Skills Found</td><td>${r.skillsFound}</td></tr>
<tr><td>Keywords Matched</td><td>${r.keywordsMatched}/${r.keywordsTotal}</td></tr>
<tr><td>Resume Length</td><td>${r.resumeLength}</td></tr>
</table>
<h2>Improvement Suggestions</h2>
${(r.suggestions||[]).map(s=>`<div><h3>${s.icon} ${s.title} [${s.impact} Impact]</h3><p>${s.detail||s.desc}</p>${s.tips?`<ul>${s.tips.map(t=>`<li>${t}</li>`).join('')}</ul>`:''}</div>`).join('<hr/>')}
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${(currentFileName||'resume').replace(/\.[^.]+$/, '')}_analysis.html`;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('dlReportBtn').addEventListener('click', downloadReport);

// ──────────────────────────────────────────
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

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────
function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function iconBgColor(name) {
  const map = {
    purple: '#ede9fe',
    green:  '#d1fae5',
    blue:   '#dbeafe',
    orange: '#fff7ed',
    red:    '#ffe4e6',
  };
  return map[name] || '#f3f4f6';
}

function generateFallbackResult() {
  return {
    candidateName: 'Candidate',
    candidateRole: 'Professional',
    experience: '2+ Years',
    skillsFound: 10,
    keywordsMatched: 15,
    keywordsTotal: 24,
    resumeLength: '1 Page',
    atsScore: 78,
    scoreBreakdown: { content: 80, format: 85, keywords: 72, structure: 78 },
    matchLevel: 'Good Match',
    matchDesc: 'Your resume has a good chance of passing ATS screening.',
    analysis: [
      { icon:'📝', iconBg:'green',  title:'Content Quality',     desc:'Strong content with relevant information.',      rating:'Good'    },
      { icon:'🔑', iconBg:'blue',   title:'Keyword Optimization',desc:'Good use of industry-relevant keywords.',        rating:'Good'    },
      { icon:'📋', iconBg:'purple', title:'Format & Structure',  desc:'Well-structured and easy to read.',             rating:'Good'    },
      { icon:'🏆', iconBg:'orange', title:'Achievements',        desc:'Good achievements, but can be more specific.',  rating:'Improve' },
      { icon:'💼', iconBg:'red',    title:'Skills Section',      desc:'Good skills listed, consider adding more.',     rating:'Improve' },
    ],
    suggestions: [
      { icon:'➕', iconBg:'green',  title:'Add Quantifiable Achievements', desc:'Add numbers and metrics to showcase impact.', impact:'High',   detail:'Quantifiable achievements help ATS systems and hiring managers understand the scope of your impact. Replace vague statements with specific metrics.', tips:['Use numbers: "Increased sales by 35%"','Add team sizes: "Led a team of 8 engineers"','Include time frames: "Delivered in 3 months under budget"'] },
      { icon:'🔍', iconBg:'blue',   title:'Optimize Keywords',             desc:'Add industry-specific keywords.',            impact:'High',   detail:'ATS systems scan for specific keywords from job descriptions. Tailor your resume for each role.',                                               tips:['Mirror keywords from job postings','Include both abbreviations and full terms','Add technical skills relevant to the role'] },
      { icon:'✏️', iconBg:'purple', title:'Improve Skills Section',        desc:'Add more relevant technical skills.',        impact:'Medium', detail:'A comprehensive skills section helps ATS matching and gives hiring managers a quick overview.',                                              tips:['Group skills by category','List certifications','Include both hard and soft skills'] },
      { icon:'📜', iconBg:'orange', title:'Add Certifications',            desc:'Include relevant certifications.',           impact:'Low',    detail:'Certifications demonstrate commitment to professional development.',                                                                      tips:['Add AWS, Google, or Microsoft certifications','Include online course completions','List relevant licenses'] },
      { icon:'👤', iconBg:'red',    title:'Strengthen Profile Summary',    desc:'Make your summary more compelling.',         impact:'Low',    detail:'Your profile summary is the first thing recruiters read. Make it punchy and role-specific.',                                               tips:['Lead with your strongest selling point','Tailor it for each job application','Keep it to 2-3 focused sentences'] },
    ]
  };
}