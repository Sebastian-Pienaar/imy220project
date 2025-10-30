const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { createUser, listUsers, getUserById, updateUser, searchUsers, getUserByUsername, deleteUser } = require('../repositories/userRepo');
const User = require('../models/User');
const { isAdmin } = require('../repositories/adminRepo');

router.get('/', async (req,res,next) => { try { const users = await listUsers(); res.json(users); } catch(e){ next(e);} });
router.get('/search', async (req,res,next) => { try { const q = req.query.q || ''; const users = await searchUsers(q); res.json(users); } catch(e){ next(e);} });

// GET /api/users/by-username/:username
router.get('/by-username/:username', async (req,res,next) => {
	try {
		const username = req.params.username;
		
		const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch(e){ next(e); }
});
router.get('/:id', async (req,res,next) => { try { const user = await getUserById(req.params.id); if (!user) return res.status(404).json({ message: 'User not found' }); res.json(user); } catch(e){ next(e);} });
router.post('/', async (req,res,next) => { try { const user = await createUser(req.body); res.status(201).json(user); } catch(e){ next(e);} });
router.patch('/:id', async (req,res,next) => { 
	try { 
		const targetUserId = req.params.id;
		const { requesterId } = req.body; 
		
	
		let resolvedRequesterId = requesterId;
		if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
			const userDoc = await getUserByUsername(requesterId);
			if (userDoc) resolvedRequesterId = userDoc._id.toString();
		}
		
		
		const userIsAdmin = resolvedRequesterId ? await isAdmin(resolvedRequesterId) : false;
		
	
		if (!userIsAdmin && targetUserId !== resolvedRequesterId) {
			return res.status(403).json({ message: 'Only the user or admin can edit this profile' });
		}
		
		const updated = await updateUser(targetUserId, req.body); 
		res.json(updated); 
	} catch(e){ next(e);} 
});

//DELETE user -admin
router.delete('/:id', async (req,res,next) => { 
	try { 
		const targetUserId = req.params.id;
		const { requesterId } = req.query;
		
	
		let resolvedRequesterId = requesterId;
		if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
			const userDoc = await getUserByUsername(requesterId);
			if (userDoc) resolvedRequesterId = userDoc._id.toString();
		}
		
		
		const userIsAdmin = resolvedRequesterId ? await isAdmin(resolvedRequesterId) : false;
		
		if (!userIsAdmin) {
			return res.status(403).json({ message: 'Only admin can delete users' });
		}
		
		await deleteUser(targetUserId); 
		res.status(204).end(); 
	} catch(e){ next(e);} 
});

module.exports = router;
