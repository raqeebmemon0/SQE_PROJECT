/**
 * ============================================================
 *  SW426 - Software Quality Engineering | PBL Project
 *  Cricketer API: CRUD REST API (Node.js + Express + MongoDB)
 *  Tested with Postman (API integration testing)
 * ============================================================
 *
 *  SETUP (run once in an empty folder containing this file):
 *    1. Install Node.js and MongoDB Community Server (or use a free MongoDB Atlas URI)
 *    2. npm init -y
 *    3. npm install express mongoose
 *    4. node server.js
 *
 *  Optional: use Atlas instead of local MongoDB
 *    set MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cricketerdb
 *
 *  BASE URL : http://localhost:3000/api/cricketers
 *
 *  ENDPOINTS
 *    POST   /api/cricketers       -> 201 Created   (400 invalid, 409 duplicate jerseyNo)
 *    GET    /api/cricketers       -> 200 OK        (array)
 *    GET    /api/cricketers/:id   -> 200 OK        (400 bad id, 404 not found)
 *    PUT    /api/cricketers/:id   -> 200 OK        (400, 404, 409)
 *    DELETE /api/cricketers/:id   -> 200 OK        (400, 404)
 *
 *  SAMPLE BODY (JSON)
 *    { "name": "Babar Azam", "jerseyNo": 56, "team": "Pakistan",
 *      "role": "Batsman", "matches": 120 }
 *    role: Batsman | Bowler | All-rounder | Wicket-keeper
 *
 *  POSTMAN: import Cricketer_API.postman_collection.json and run the collection.
 * ============================================================
 */

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// ---------------- Database connection ----------------
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cricketerdb';
const PORT = process.env.PORT || 3000;

// ---------------- Schema & Model ----------------
const ROLES = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'];

const cricketerSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    jerseyNo: { type: Number, required: true, unique: true, min: 1 },
    team:     { type: String, required: true, trim: true },
    role:     { type: String, required: true, enum: ROLES },
    matches:  { type: Number, required: true, min: 0, default: 0 },
  },
  { versionKey: false }
);

const Cricketer = mongoose.model('Cricketer', cricketerSchema);

// ---------------- Helpers ----------------
function validate(body) {
  const errors = [];
  const { name, jerseyNo, team, role, matches } = body || {};
  if (typeof name !== 'string' || !name.trim()) errors.push('name is required (non-empty string)');
  if (!Number.isInteger(jerseyNo) || jerseyNo <= 0) errors.push('jerseyNo is required (positive integer)');
  if (typeof team !== 'string' || !team.trim()) errors.push('team is required (non-empty string)');
  if (!ROLES.includes(role)) errors.push(`role must be one of: ${ROLES.join(', ')}`);
  if (!Number.isInteger(matches) || matches < 0) errors.push('matches is required (integer >= 0)');
  return errors;
}

const validId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

const pick = ({ name, jerseyNo, team, role, matches }) => ({ name, jerseyNo, team, role, matches });

// ---------------- Routes ----------------

// CREATE
app.post('/api/cricketers', async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
  try {
    const created = await Cricketer.create(pick(req.body));
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'jerseyNo already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ ALL
app.get('/api/cricketers', async (req, res) => {
  try {
    res.status(200).json(await Cricketer.find());
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ ONE
app.get('/api/cricketers/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  try {
    const doc = await Cricketer.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Cricketer not found' });
    res.status(200).json(doc);
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE
app.put('/api/cricketers/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });
  try {
    const updated = await Cricketer.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Cricketer not found' });
    res.status(200).json(updated);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'jerseyNo already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE
app.delete('/api/cricketers/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid ID format' });
  try {
    const deleted = await Cricketer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Cricketer not found' });
    res.status(200).json({ message: 'Cricketer deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Malformed JSON body -> 400
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------- Start ----------------
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    await Cricketer.init(); // make sure the unique index on jerseyNo exists
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}/api/cricketers`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
