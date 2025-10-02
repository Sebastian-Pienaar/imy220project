const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { createProject, listProjects, getProjectById, addCheckIn, updateProject, deleteProject, searchCheckIns, checkoutProject, returnProjectRepo } = require('../repositories/projectRepo');
const { getUserByUsername } = require('../repositories/userRepo');

router.get('/', async (req,res,next) => { try { const projects = await listProjects(); res.json(projects); } catch(e){ next(e);} });
router.get('/search/checkins', async (req,res,next) => { try { const q = req.query.q || ''; const results = await searchCheckIns(q); res.json(results); } catch(e){ next(e);} });
router.get('/:id', async (req,res,next) => { try { const project = await getProjectById(req.params.id); if (!project) return res.status(404).json({ message: 'Project not found' }); res.json(project); } catch(e){ next(e);} });
router.post('/', async (req,res,next) => { try { const project = await createProject(req.body); res.status(201).json(project); } catch(e){ next(e);} });
router.post('/:id/checkins', async (req,res,next) => { try { const { message, version, addedFiles, userId } = req.body; if (!message || !version || !userId) return res.status(400).json({ message: 'Missing fields' }); const updated = await addCheckIn(req.params.id, { message, version, addedFiles, userId }); res.json(updated); } catch(e){ next(e);} });
router.patch('/:id', async (req,res,next) => { try { const updated = await updateProject(req.params.id, req.body); res.json(updated); } catch(e){ next(e);} });
router.delete('/:id', async (req,res,next) => { try { await deleteProject(req.params.id); res.status(204).end(); } catch(e){ next(e);} });

// Checkout project
router.patch('/:id/checkout', async (req,res,next) => { 
	try { 
		let { userId } = req.body; 
		if (!userId) return res.status(400).json({ message: 'userId required' });
		// Accept either a Mongo ObjectId or a username slug; resolve if necessary
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			const userDoc = await getUserByUsername(userId);
			if (!userDoc) return res.status(400).json({ message: 'Unknown user identifier' });
			userId = userDoc._id.toString();
		}
		const updated = await checkoutProject(req.params.id, userId);
		if (!updated) return res.status(409).json({ message: 'Project not available for checkout' });
		res.json(updated);
	} catch(e){ next(e);} 
});

// Return project
router.patch('/:id/return', async (req,res,next) => { 
	try { 
		let { userId } = req.body; 
		if (!userId) return res.status(400).json({ message: 'userId required' });
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			const userDoc = await getUserByUsername(userId);
			if (!userDoc) return res.status(400).json({ message: 'Unknown user identifier' });
			userId = userDoc._id.toString();
		}
		const updated = await returnProjectRepo(req.params.id, userId);
		if (!updated) return res.status(409).json({ message: 'Project not checked out by this user' });
		res.json(updated);
	} catch(e){ next(e);} 
});

module.exports = router;
