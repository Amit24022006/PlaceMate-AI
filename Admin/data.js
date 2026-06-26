/* =============================================
   PlaceMate AI — data.js
   Shared localStorage data layer
   ============================================= */

// ── Keys ──────────────────────────────────────
const KEYS = {
  subjects:  'pm_subjects',
  questions: 'pm_questions',
  sessions:  'pm_sessions',
  exams:     'pm_exams',
  results:   'pm_results',
};

// ── Generic helpers ───────────────────────────
function load(key)        { try { return JSON.parse(localStorage.getItem(key)) || []; } catch{ return []; } }
function save(key, data)  { localStorage.setItem(key, JSON.stringify(data)); }
function uid()            { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

// ── Subjects ──────────────────────────────────
function getSubjects()       { return load(KEYS.subjects); }
function saveSubjects(arr)   { save(KEYS.subjects, arr); }
function addSubjectData(obj) {
  const arr = getSubjects();
  obj.id = obj.id || uid();
  arr.push(obj);
  saveSubjects(arr);
  return obj;
}
function deleteSubjectData(id) {
  saveSubjects(getSubjects().filter(s => s.id !== id));
}

// ── Questions ─────────────────────────────────
function getQuestions()            { return load(KEYS.questions); }
function saveQuestions(arr)        { save(KEYS.questions, arr); }
function addQuestionData(obj)      {
  const arr = getQuestions();
  obj.id = obj.id || uid();
  arr.push(obj);
  saveQuestions(arr);
  return obj;
}
function deleteQuestionData(id)    { saveQuestions(getQuestions().filter(q => q.id !== id)); }
function getQuestionsBySubject(subjectId) {
  return getQuestions().filter(q => q.subjectId === subjectId);
}

// ── Live Sessions ─────────────────────────────
function getSessions()       { return load(KEYS.sessions); }
function saveSessions(arr)   { save(KEYS.sessions, arr); }
function addSessionData(obj) {
  const arr = getSessions();
  obj.id = obj.id || uid();
  arr.push(obj);
  saveSessions(arr);
  return obj;
}
function deleteSessionData(id)  { saveSessions(getSessions().filter(s => s.id !== id)); }
function updateSessionData(id, patch) {
  const arr = getSessions().map(s => s.id === id ? { ...s, ...patch } : s);
  saveSessions(arr);
}

// ── Exams ─────────────────────────────────────
function getExams()       { return load(KEYS.exams); }
function saveExams(arr)   { save(KEYS.exams, arr); }
function addExamData(obj) {
  const arr = getExams();
  obj.id = obj.id || uid();
  arr.push(obj);
  saveExams(arr);
  return obj;
}
function deleteExamData(id)  { saveExams(getExams().filter(e => e.id !== id)); }
function getExamById(id)     { return getExams().find(e => e.id === id); }

// ── Results ───────────────────────────────────
function getResults()       { return load(KEYS.results); }
function saveResults(arr)   { save(KEYS.results, arr); }
function addResultData(obj) {
  const arr = getResults();
  obj.id = obj.id || uid();
  arr.push(obj);
  saveResults(arr);
  return obj;
}
function clearResultsData() { saveResults([]); }
