/* =========================================
   Test Panel – panel.js
   All scores start at 0%, fully functional
   ========================================= */

"use strict";

// ─── DATA ──────────────────────────────────────────────
const TESTS = [
  {
    id: 1,
    name: "JavaScript Fundamentals Test",
    category: "Technical",
    iconClass: "js",
    iconText: "JS",
    score: 0,
    total: 30,
    timeTaken: "45 min",
    date: "June 02, 2026",
    time: "10:30 AM",
  },
  {
    id: 2,
    name: "React.js Assessment",
    category: "Technical",
    iconClass: "react",
    iconText: "⚛",
    score: 0,
    total: 25,
    timeTaken: "60 min",
    date: "June 01, 2026",
    time: "03:15 PM",
  },
  {
    id: 3,
    name: "Python Basics Test",
    category: "Technical",
    iconClass: "py",
    iconText: "🐍",
    score: 0,
    total: 30,
    timeTaken: "40 min",
    date: "May 31, 2026",
    time: "11:20 AM",
  },
  {
    id: 4,
    name: "Quantitative Aptitude Test",
    category: "Aptitude",
    iconClass: "green",
    iconText: "📊",
    score: 0,
    total: 25,
    timeTaken: "35 min",
    date: "May 30, 2026",
    time: "09:45 AM",
  },
  {
    id: 5,
    name: "Communication Skills Test",
    category: "Language",
    iconClass: "orange",
    iconText: "💬",
    score: 0,
    total: 25,
    timeTaken: "25 min",
    date: "May 29, 2026",
    time: "02:10 PM",
  },
  {
    id: 6,
    name: "Database Concepts Test",
    category: "Technical",
    iconClass: "purple",
    iconText: "🗄",
    score: 0,
    total: 25,
    timeTaken: "50 min",
    date: "May 28, 2026",
    time: "04:05 PM",
  },
  {
    id: 7,
    name: "English Grammar Test",
    category: "Language",
    iconClass: "pink",
    iconText: "📝",
    score: 0,
    total: 25,
    timeTaken: "30 min",
    date: "May 27, 2026",
    time: "10:00 AM",
  },
  {
    id: 8,
    name: "DSA Fundamentals Test",
    category: "Technical",
    iconClass: "indigo",
    iconText: "</>",
    score: 0,
    total: 20,
    timeTaken: "55 min",
    date: "May 26, 2026",
    time: "01:30 PM",
  },
  {
    id: 9,
    name: "Operating Systems Test",
    category: "Technical",
    iconClass: "teal",
    iconText: "💻",
    score: 0,
    total: 30,
    timeTaken: "45 min",
    date: "May 25, 2026",
    time: "11:00 AM",
  },
  {
    id: 10,
    name: "Verbal Reasoning Test",
    category: "Aptitude",
    iconClass: "red",
    iconText: "🔤",
    score: 0,
    total: 20,
    timeTaken: "20 min",
    date: "May 24, 2026",
    time: "02:45 PM",
  },
  {
    id: 11,
    name: "Cloud Computing Basics",
    category: "Domain Knowledge",
    iconClass: "blue",
    iconText: "☁",
    score: 0,
    total: 25,
    timeTaken: "40 min",
    date: "May 23, 2026",
    time: "09:15 AM",
  },
  {
    id: 12,
    name: "Machine Learning Intro",
    category: "Domain Knowledge",
    iconClass: "green",
    iconText: "🤖",
    score: 0,
    total: 30,
    timeTaken: "60 min",
    date: "May 22, 2026",
    time: "03:30 PM",
  },
];

// ─── STATE ─────────────────────────────────────────────
const PER_PAGE = 8;
let state = {
  filter: "all",
  search: "",
  sort: "recent",
  page: 1,
};

// ─── HELPERS ───────────────────────────────────────────
function getScorePct(t) {
  return t.total > 0 ? Math.round((t.score / t.total) * 100) : 0;
}

function scoreClass(pct) {
  if (pct >= 75) return "high";
  if (pct >= 50) return "medium";
  return "low";
}

function badgeClass(cat) {
  const map = {
    "Technical": "badge-technical",
    "Aptitude": "badge-aptitude",
    "Language": "badge-language",
    "Domain Knowledge": "badge-domain",
  };
  return map[cat] || "badge-technical";
}

function filteredTests() {
  let list = [...TESTS];

  if (state.filter !== "all") {
    list = list.filter(t => t.category === state.filter);
  }

  if (state.search.trim()) {
    const q = state.search.toLowerCase();
    list = list.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }

  switch (state.sort) {
    case "score-high": list.sort((a, b) => getScorePct(b) - getScorePct(a)); break;
    case "score-low":  list.sort((a, b) => getScorePct(a) - getScorePct(b)); break;
    case "name":       list.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "recent":     // default order (by date, newest first – already ordered)
    default: break;
  }

  return list;
}

function pagedTests(list) {
  const start = (state.page - 1) * PER_PAGE;
  return list.slice(start, start + PER_PAGE);
}

// ─── RENDER TABLE ──────────────────────────────────────
function renderTable() {
  const all = filteredTests();
  const paged = pagedTests(all);
  const tbody = document.getElementById("tableBody");
  const empty = document.getElementById("emptyState");

  if (!all.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    document.getElementById("showingText").textContent = "No tests found";
    renderPagination(0);
    return;
  }

  empty.style.display = "none";
  const start = (state.page - 1) * PER_PAGE + 1;
  const end = Math.min(state.page * PER_PAGE, all.length);
  document.getElementById("showingText").textContent =
    `Showing ${start}–${end} of ${all.length} tests`;

  tbody.innerHTML = paged.map(t => {
    const pct = getScorePct(t);
    return `
      <tr>
        <td>
          <div class="test-name-cell">
            <div class="test-icon ${t.iconClass}">${t.iconText}</div>
            <div class="test-name-info">
              <strong>${t.name}</strong>
              <small>${t.category} Test</small>
            </div>
          </div>
        </td>
        <td><span class="type-badge ${badgeClass(t.category)}">${t.category}</span></td>
        <td>
          <div class="score-cell">
            <span class="score-pct ${scoreClass(pct)}">${pct}%</span>
            <span class="score-fraction">(${t.score}/${t.total})</span>
          </div>
        </td>
        <td>${t.timeTaken}</td>
        <td>
          <div class="date-cell">
            <span class="date-main">${t.date}</span>
            <span class="date-time">${t.time}</span>
          </div>
        </td>
        <td>
          <div class="action-cell">
            <button class="btn-view" onclick="openModal(${t.id})">View Results</button>
            <button class="btn-dl" title="Download Report" onclick="downloadReport(${t.id})">⬇</button>
          </div>
        </td>
      </tr>`;
  }).join("");

  renderPagination(all.length);
  updateStats();
}

// ─── RENDER PAGINATION ─────────────────────────────────
function renderPagination(total) {
  const pages = Math.ceil(total / PER_PAGE);
  const container = document.getElementById("pagination");
  if (pages <= 1) { container.innerHTML = ""; return; }

  let html = `<button class="page-btn" onclick="goPage(${state.page - 1})" ${state.page === 1 ? "disabled" : ""}>‹</button>`;

  const range = getPageRange(state.page, pages);
  range.forEach(p => {
    if (p === "...") {
      html += `<span class="page-ellipsis">…</span>`;
    } else {
      html += `<button class="page-btn ${p === state.page ? "active" : ""}" onclick="goPage(${p})">${p}</button>`;
    }
  });

  html += `<button class="page-btn" onclick="goPage(${state.page + 1})" ${state.page === pages ? "disabled" : ""}>›</button>`;
  container.innerHTML = html;
}

function getPageRange(cur, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 3) return [1, 2, 3, "...", total];
  if (cur >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", cur, "...", total];
}

function goPage(p) {
  const all = filteredTests();
  const pages = Math.ceil(all.length / PER_PAGE);
  if (p < 1 || p > pages) return;
  state.page = p;
  renderTable();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStats() {
  document.getElementById("totalAttempted").textContent = "0";
  document.getElementById("avgScore").textContent = "0%";
  document.getElementById("totalTime").textContent = "0h 0m";
}

// ─── MODAL ─────────────────────────────────────────────
function openModal(id) {
  const t = TESTS.find(x => x.id === id);
  if (!t) return;

  const pct = getScorePct(t);
  document.getElementById("modalIcon").className = `modal-icon ${t.iconClass}`;
  document.getElementById("modalIcon").textContent = t.iconText;
  document.getElementById("modalTitle").textContent = t.name;

  const typeEl = document.getElementById("modalType");
  typeEl.textContent = t.category;
  typeEl.className = `modal-type ${badgeClass(t.category)}`;

  document.getElementById("modalStats").innerHTML = `
    <div class="modal-stat">
      <span class="modal-stat-val">${pct}%</span>
      <span class="modal-stat-lbl">Score</span>
    </div>
    <div class="modal-stat">
      <span class="modal-stat-val">${t.score}/${t.total}</span>
      <span class="modal-stat-lbl">Correct</span>
    </div>
    <div class="modal-stat">
      <span class="modal-stat-val">${t.timeTaken}</span>
      <span class="modal-stat-lbl">Time Taken</span>
    </div>
  `;

  document.getElementById("modalBarFill").style.width = "0%";
  document.getElementById("modalBarPct").textContent = pct + "%";

  document.getElementById("modalDownload").onclick = () => downloadReport(id);
  document.getElementById("modalOverlay").classList.add("open");

  setTimeout(() => {
    document.getElementById("modalBarFill").style.width = pct + "%";
  }, 100);
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

// ─── DOWNLOAD REPORT ───────────────────────────────────
function downloadReport(id) {
  const t = TESTS.find(x => x.id === id);
  if (!t) return;

  const pct = getScorePct(t);
  const content = [
    "═══════════════════════════════════════════",
    "          PLACEMATE – TEST REPORT           ",
    "═══════════════════════════════════════════",
    "",
    `Test Name  : ${t.name}`,
    `Category   : ${t.category}`,
    `Date       : ${t.date} at ${t.time}`,
    `Time Taken : ${t.timeTaken}`,
    "",
    "───────────── SCORE SUMMARY ───────────────",
    `Score      : ${t.score} / ${t.total}`,
    `Percentage : ${pct}%`,
    `Grade      : ${pct >= 75 ? "A – Excellent" : pct >= 50 ? "B – Good" : "C – Needs Improvement"}`,
    "",
    "───────────────────────────────────────────",
    "Generated by PlaceMate AI Test Panel",
    `Report Date: ${new Date().toLocaleString()}`,
    "═══════════════════════════════════════════",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${t.name.replace(/\s+/g, "_")}_Report.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── EVENT LISTENERS ───────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // Tabs
  document.getElementById("tabs").addEventListener("click", e => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    state.filter = btn.dataset.filter;
    state.page = 1;
    renderTable();
  });

  // Search
  let debounceTimer;
  document.getElementById("searchInput").addEventListener("input", e => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    }, 220);
  });

  // Sort
  document.getElementById("sortSelect").addEventListener("change", e => {
    state.sort = e.target.value;
    state.page = 1;
    renderTable();
  });

  // Modal close
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });

  // Keyboard ESC
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // Initial render
  renderTable();
  updateStats();
});