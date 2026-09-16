const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB connection (cached for serverless) ---
let cached = null;
async function connectDB() {
  if (cached) return cached;
  cached = await mongoose.connect(process.env.MONGODB_URI);
  return cached;
}

// --- Models ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = async function(pw) { return bcrypt.compare(pw, this.password); };
const User = mongoose.models.User || mongoose.model('User', userSchema);

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  grade: { type: Number, enum: [9, 11], required: true },
  part1: { type: Number, default: 0 },
  part2: { type: Number, default: 0 },
  part3: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
scoreSchema.index({ total: -1 });
const Score = mongoose.models.Score || mongoose.model('Score', scoreSchema);

// --- Auth middleware ---
const SECRET = process.env.JWT_SECRET || 'fallback_secret';
const auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Token topilmadi' });
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Foydalanuvchi topilmadi' });
    req.user = user;
    next();
  } catch { res.status(401).json({ error: 'Noto\'g\'ri token' }); }
};

const genToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: '30d' });

// --- Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    const user = new User({ name, email, password });
    await user.save();
    const token = genToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: 'Server xatosi: ' + err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email va parolni kiriting' });
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
    const token = genToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: 'Server xatosi: ' + err.message }); }
});

app.get('/api/auth/me', auth, (req, res) => { res.json({ user: req.user }); });

app.post('/api/scores', auth, async (req, res) => {
  try {
    await connectDB();
    const { grade, part1, part2, part3, total, answers } = req.body;
    const score = new Score({
      user: req.user._id, name: req.user.name, grade: grade || 9,
      part1: part1||0, part2: part2||0, part3: part3||0, total: total||0, answers: answers||{}
    });
    await score.save();
    res.status(201).json({ score });
  } catch (err) { res.status(500).json({ error: 'Xatolik: ' + err.message }); }
});

app.get('/api/scores', auth, async (req, res) => {
  try {
    await connectDB();
    const scores = await Score.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ scores });
  } catch (err) { res.status(500).json({ error: 'Xatolik: ' + err.message }); }
});

app.get('/api/scores/leaderboard', async (req, res) => {
  try {
    await connectDB();
    const grade = req.query.grade;
    const filter = grade ? { grade: parseInt(grade) } : {};
    const scores = await Score.find(filter).sort({ total: -1 }).limit(10).select('name grade total part1 part2 part3 createdAt');
    res.json({ leaderboard: scores });
  } catch (err) { res.status(500).json({ error: 'Xatolik: ' + err.message }); }
});

// For Vercel serverless - export the app
module.exports = app;
