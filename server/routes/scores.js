const express = require('express');
const Score = require('../models/Score');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { grade, part1, part2, part3, total, answers } = req.body;

    const score = new Score({
      user: req.user._id,
      name: req.user.name,
      grade: grade || 9,
      part1: part1 || 0,
      part2: part2 || 0,
      part3: part3 || 0,
      total: total || 0,
      answers: answers || {}
    });

    await score.save();
    res.status(201).json({ score });
  } catch (err) {
    res.status(500).json({ error: 'Ballarni saqlashda xatolik: ' + err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ scores });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik: ' + err.message });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const grade = req.query.grade;
    const filter = grade ? { grade: parseInt(grade) } : {};
    const scores = await Score.find(filter)
      .sort({ total: -1 })
      .limit(10)
      .select('name grade total part1 part2 part3 createdAt');
    res.json({ leaderboard: scores });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik: ' + err.message });
  }
});

module.exports = router;
