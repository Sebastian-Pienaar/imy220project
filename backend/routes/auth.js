const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { createUser, getUserByUsername, getUserById } = require('../repositories/userRepo');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const TOKEN_TTL = '2h';

function signToken(user){
  return jwt.sign({ sub: user._id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

//POST /api/auth/signup
router.post('/signup', async (req,res,next) => {
  try {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password) return res.status(400).json({ message:'Missing fields' });
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ message:'Username or email already taken' });
    
    const user = await User.create({ username, name, email, passwordHash: password, role:'member', languages:[] });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, username: user.username, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch(e){ next(e); }
});

//POST /api/auth/login
router.post('/login', async (req,res,next) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) return res.status(400).json({ message:'Missing credentials' });
    const user = await User.findOne({ $or: [ { username: usernameOrEmail }, { email: usernameOrEmail } ] });
    if (!user) return res.status(401).json({ message:'Invalid credentials' });

    if (password !== user.passwordHash) return res.status(401).json({ message:'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, username: user.username, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch(e){ next(e); }
});

module.exports = router;
