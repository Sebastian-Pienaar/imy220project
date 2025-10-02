const express = require('express');
const router = express.Router();
const { createUser, listUsers, getUserById, updateUser, searchUsers, getUserByUsername } = require('../repositories/userRepo');
const User = require('../models/User');

router.get('/', async (req,res,next) => { try { const users = await listUsers(); res.json(users); } catch(e){ next(e);} });
router.get('/search', async (req,res,next) => { try { const q = req.query.q || ''; const users = await searchUsers(q); res.json(users); } catch(e){ next(e);} });

// GET /api/users/by-username/:username (case-insensitive)
router.get('/by-username/:username', async (req,res,next) => {
	try {
		const username = req.params.username;
		// Simple case-insensitive match - exact username
		const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch(e){ next(e); }
});
router.get('/:id', async (req,res,next) => { try { const user = await getUserById(req.params.id); if (!user) return res.status(404).json({ message: 'User not found' }); res.json(user); } catch(e){ next(e);} });
router.post('/', async (req,res,next) => { try { const user = await createUser(req.body); res.status(201).json(user); } catch(e){ next(e);} });
router.patch('/:id', async (req,res,next) => { try { const updated = await updateUser(req.params.id, req.body); res.json(updated); } catch(e){ next(e);} });

module.exports = router;
