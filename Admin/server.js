const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'PlaceMateSecretKey123!';
const TOKEN_EXPIRY = '12h';

app.use(cors());
app.use(express.json());

function initDb() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      users: [
        {
          id: uuidv4(),
          username: 'admin',
          email: 'admin@placemate.ai',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ],
      subjects: [],
      questions: [],
      sessions: [],
      exams: [],
      results: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
  }
}

function readDb() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Unable to read db.json:', error);
    return null;
  }
}

function writeDb(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'PlaceMate AI backend is running.' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const db = readDb();
  const user = db.users.find(u => u.username === username || u.email === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.get('/api/subjects', authMiddleware, (req, res) => {
  const db = readDb();
  res.json(db.subjects);
});

app.post('/api/subjects', authMiddleware, (req, res) => {
  const { name, desc, icon, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Subject name is required.' });
  const db = readDb();
  const subject = { id: uuidv4(), name, desc: desc || '', icon: icon || '📘', color: color || 'blue', createdAt: new Date().toISOString() };
  db.subjects.push(subject);
  writeDb(db);
  res.status(201).json(subject);
});

app.delete('/api/subjects/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.subjects = db.subjects.filter(subject => subject.id !== id);
  db.questions = db.questions.filter(question => question.subjectId !== id);
  writeDb(db);
  res.status(204).send();
});

app.get('/api/questions', authMiddleware, (req, res) => {
  const db = readDb();
  res.json(db.questions);
});

app.post('/api/questions', authMiddleware, (req, res) => {
  const { subjectId, section, text, marks, options, correct } = req.body;
  if (!subjectId || !text || !section) {
    return res.status(400).json({ error: 'subjectId, section, and text are required.' });
  }
  const db = readDb();
  const question = {
    id: uuidv4(),
    subjectId,
    section,
    text,
    marks: Number.isInteger(marks) ? marks : 1,
    options: options || null,
    correct: typeof correct !== 'undefined' ? correct : null,
    createdAt: new Date().toISOString()
  };
  db.questions.push(question);
  writeDb(db);
  res.status(201).json(question);
});

app.delete('/api/questions/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.questions = db.questions.filter(question => question.id !== id);
  writeDb(db);
  res.status(204).send();
});

app.get('/api/sessions', authMiddleware, (req, res) => {
  const db = readDb();
  res.json(db.sessions);
});

app.post('/api/sessions', authMiddleware, (req, res) => {
  const { title, host, platform, link, dateTime, duration, desc, status, icon } = req.body;
  if (!title || !link) return res.status(400).json({ error: 'Title and link are required.' });
  const db = readDb();
  const session = { id: uuidv4(), title, host: host || '', platform: platform || 'Other', link, dateTime: dateTime || '', duration: duration || '', desc: desc || '', status: status || 'upcoming', icon: icon || '🔗', createdAt: new Date().toISOString() };
  db.sessions.push(session);
  writeDb(db);
  res.status(201).json(session);
});

app.delete('/api/sessions/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.sessions = db.sessions.filter(session => session.id !== id);
  writeDb(db);
  res.status(204).send();
});

app.get('/api/exams', authMiddleware, (req, res) => {
  const db = readDb();
  res.json(db.exams);
});

app.get('/api/exams/:id', (req, res) => {
  const db = readDb();
  const exam = db.exams.find(e => e.id === req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found.' });
  res.json(exam);
});

app.post('/api/exams', authMiddleware, (req, res) => {
  const { title, subjectId, duration, instructions, showResult, examLink } = req.body;
  if (!title || !subjectId) return res.status(400).json({ error: 'Title and subjectId are required.' });
  const db = readDb();
  const qCount = db.questions.filter(q => q.subjectId === subjectId).length;
  const exam = { id: uuidv4(), title, subjectId, duration: Number.isInteger(duration) ? duration : 60, instructions: instructions || '', showResult: Boolean(showResult), examLink: examLink || '', qCount, createdAt: new Date().toISOString() };
  db.exams.push(exam);
  writeDb(db);
  res.status(201).json(exam);
});

app.delete('/api/exams/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.exams = db.exams.filter(exam => exam.id !== id);
  writeDb(db);
  res.status(204).send();
});

app.get('/api/results', authMiddleware, (req, res) => {
  const db = readDb();
  res.json(db.results);
});

app.post('/api/results', (req, res) => {
  const { examId, examTitle, score, total, pct, name } = req.body;
  if (!examId || typeof score !== 'number' || typeof total !== 'number') {
    return res.status(400).json({ error: 'examId, score and total are required.' });
  }
  const db = readDb();
  const result = { id: uuidv4(), examId, examTitle: examTitle || '', score, total, pct: pct || 0, name: name || 'Anonymous', date: new Date().toISOString() };
  db.results.push(result);
  writeDb(db);
  res.status(201).json(result);
});

app.delete('/api/results', authMiddleware, (req, res) => {
  const db = readDb();
  db.results = [];
  writeDb(db);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

initDb();
app.listen(PORT, () => {
  console.log(`PlaceMate AI backend listening on http://localhost:${PORT}`);
});
