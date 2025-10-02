const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { createUser, getUserByUsername, getUserById } = require('../repositories/userRepo');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_TTL = '2h';

function signToken(user){
  return jwt.sign({ sub: user._id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

// POST /api/auth/signup
router.post('/signup', async (req,res,next) => {
  try {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password) return res.status(400).json({ message:'Missing fields' });
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ message:'Username or email already taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, name, email, passwordHash, role:'member', languages:[] });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, username: user.username, name: user.name, email: user.email } });
  } catch(e){ next(e); }
});

// POST /api/auth/login
router.post('/login', async (req,res,next) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) return res.status(400).json({ message:'Missing credentials' });
    const user = await User.findOne({ $or: [ { username: usernameOrEmail }, { email: usernameOrEmail } ] });
    if (!user) return res.status(401).json({ message:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message:'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, username: user.username, name: user.name, email: user.email } });
  } catch(e){ next(e); }
});

// Middleware example (not auto-used here)
function authMiddleware(req,res,next){
  const hdr = req.headers.authorization;
  if (!hdr || !hdr.startsWith('Bearer ')) return res.status(401).json({ message:'Missing token' });
  const token = hdr.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, username, iat, exp }
    next();
  } catch(e){
    return res.status(401).json({ message:'Invalid token' });
  }
}

module.exports = router;
