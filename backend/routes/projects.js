const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { createProject, listProjects, getProjectById, addCheckIn, updateProject, deleteProject, searchCheckIns, checkoutProject, returnProjectRepo } = require('../repositories/projectRepo');
const { getUserByUsername } = require('../repositories/userRepo');
const { isAdmin } = require('../repositories/adminRepo');

router.get('/', async (req,res,next) => { try { const projects = await listProjects(); res.json(projects); } catch(e){ next(e);} });
router.get('/search/checkins', async (req,res,next) => { try { const q = req.query.q || ''; const results = await searchCheckIns(q); res.json(results); } catch(e){ next(e);} });
router.get('/:id', async (req,res,next) => { try { const project = await getProjectById(req.params.id); if (!project) return res.status(404).json({ message: 'Project not found' }); res.json(project); } catch(e){ next(e);} });
router.post('/', async (req,res,next) => { try { const project = await createProject(req.body); res.status(201).json(project); } catch(e){ next(e);} });
router.post('/:id/checkins', async (req,res,next) => { try { const { message, version, addedFiles, userId } = req.body; if (!message || !version || !userId) return res.status(400).json({ message: 'Missing fields' }); const updated = await addCheckIn(req.params.id, { message, version, addedFiles, userId }); res.json(updated); } catch(e){ next(e);} });
router.patch('/:id', async (req,res,next) => { 
	try { 
		const projectId = req.params.id;
		const { userId } = req.body; //userId van requester
		
	
		let resolvedUserId = userId;
		if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
			const userDoc = await getUserByUsername(userId);
			if (userDoc) resolvedUserId = userDoc._id.toString();
		}
		
		//check of admin is
		const userIsAdmin = resolvedUserId ? await isAdmin(resolvedUserId) : false;
		
		if (!userIsAdmin) {
			
			const project = await getProjectById(projectId);
			if (!project) return res.status(404).json({ message: 'Project not found' });
			
			const ownerId = project.ownerId._id ? project.ownerId._id.toString() : project.ownerId.toString();
			if (ownerId !== resolvedUserId) {
				return res.status(403).json({ message: 'Only project owner or admin can edit project' });
			}
		}
		
		const updated = await updateProject(projectId, req.body); 
		res.json(updated); 
	} catch(e){ next(e);} 
});
router.delete('/:id', async (req,res,next) => { 
	try { 
		const projectId = req.params.id;
		const { userId } = req.query; 
		
		
		let resolvedUserId = userId;
		if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
			const userDoc = await getUserByUsername(userId);
			if (userDoc) resolvedUserId = userDoc._id.toString();
		}
		
		
		const userIsAdmin = resolvedUserId ? await isAdmin(resolvedUserId) : false;
		
		if (!userIsAdmin) {
			
			const project = await getProjectById(projectId);
			if (!project) return res.status(404).json({ message: 'Project not found' });
			
			const ownerId = project.ownerId._id ? project.ownerId._id.toString() : project.ownerId.toString();
			if (ownerId !== resolvedUserId) {
				return res.status(403).json({ message: 'Only project owner or admin can delete project' });
			}
		}
		
		await deleteProject(projectId); 
		res.status(204).end(); 
	} catch(e){ next(e);} 
});


router.patch('/:id/checkout', async (req,res,next) => { 
	try { 
		let { userId } = req.body; 
		if (!userId) return res.status(400).json({ message: 'userId required' });
		
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


router.patch('/:id/version', async (req,res,next) => { 
	try { 
		const projectId = req.params.id;
		const { version, userId } = req.body; 
		
		if (!version) return res.status(400).json({ message: 'version required' });
		if (!userId) return res.status(400).json({ message: 'userId required' });

		let resolvedUserId = userId;
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			const userDoc = await getUserByUsername(userId);
			if (!userDoc) return res.status(400).json({ message: 'Unknown user identifier' });
			resolvedUserId = userDoc._id.toString();
		}
		
	
		const project = await getProjectById(projectId);
		if (!project) return res.status(404).json({ message: 'Project not found' });
		
		
		const userIsAdmin = await isAdmin(resolvedUserId);
		const ownerId = project.ownerId._id ? project.ownerId._id.toString() : project.ownerId.toString();
		const isOwner = ownerId === resolvedUserId;
		
		if (!userIsAdmin && !isOwner) {
			return res.status(403).json({ message: 'Only project owner or admin can update version' });
		}
		
	
		const updated = await updateProject(projectId, { version });
		res.json(updated);
	} catch(e){ next(e);} 
});

//Add member
router.post('/:id/members', async (req,res,next) => {
	try {
		const projectId = req.params.id;
		let { userId, requesterId } = req.body;
		
		if (!userId) return res.status(400).json({ message: 'userId required' });
		
	
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			const userDoc = await getUserByUsername(userId);
			if (!userDoc) return res.status(400).json({ message: 'Unknown user identifier' });
			userId = userDoc._id.toString();
		}
		
		
		let resolvedRequesterId = requesterId;
		if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
			const userDoc = await getUserByUsername(requesterId);
			if (userDoc) resolvedRequesterId = userDoc._id.toString();
		}
		
	
		const project = await getProjectById(projectId);
		if (!project) return res.status(404).json({ message: 'Project not found' });
		
	
		const userIsAdmin = resolvedRequesterId ? await isAdmin(resolvedRequesterId) : false;
		const ownerId = project.ownerId._id ? project.ownerId._id.toString() : project.ownerId.toString();
		const isOwner = ownerId === resolvedRequesterId;
		const isMember = project.members.some(m => {
			const memberId = m._id ? m._id.toString() : m.toString();
			return memberId === resolvedRequesterId;
		});
		

		const isSelfJoin = userId === resolvedRequesterId;

		if (!userIsAdmin && !isOwner && !isMember && !isSelfJoin) {
			return res.status(403).json({ message: 'Only admin, owner, members, or self can add members' });
		}
		
	
		const alreadyMember = project.members.some(m => {
			const memberId = m._id ? m._id.toString() : m.toString();
			return memberId === userId;
		});
		
		if (alreadyMember) {
			return res.status(409).json({ message: 'User is already a member' });
		}
		
		
		const updated = await updateProject(projectId, { $addToSet: { members: userId } });
		res.json(updated);
	} catch(e){ next(e); }
});


router.delete('/:id/members/:userId', async (req,res,next) => {
	try {
		const projectId = req.params.id;
		let { userId } = req.params;
		const { requesterId } = req.query; 
		
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			const userDoc = await getUserByUsername(userId);
			if (!userDoc) return res.status(400).json({ message: 'Unknown user identifier' });
			userId = userDoc._id.toString();
		}
		
	
		let resolvedRequesterId = requesterId;
		if (requesterId && !mongoose.Types.ObjectId.isValid(requesterId)) {
			const userDoc = await getUserByUsername(requesterId);
			if (userDoc) resolvedRequesterId = userDoc._id.toString();
		}
		

		const project = await getProjectById(projectId);
		if (!project) return res.status(404).json({ message: 'Project not found' });
		
	
		const userIsAdmin = resolvedRequesterId ? await isAdmin(resolvedRequesterId) : false;
		const ownerId = project.ownerId._id ? project.ownerId._id.toString() : project.ownerId.toString();
		const isOwner = ownerId === resolvedRequesterId;
		
		if (!userIsAdmin && !isOwner) {
			return res.status(403).json({ message: 'Only admin or owner can remove members' });
		}
		if (userId === ownerId) {
			return res.status(400).json({ message: 'Cannot remove project owner' });
		}
		
	
		const updated = await updateProject(projectId, { $pull: { members: userId } });
		res.json(updated);
	} catch(e){ next(e); }
});


router.post('/:id/files', async (req,res,next) => {
	try {
		const projectId = req.params.id;
		
		console.log('[Files Upload] req.body:', req.body);
		console.log('[Files Upload] req.files:', req.files?.length || 0);
		
	
		let { userId } = req.body || {};
		if (!userId) {
			console.log('[Files Upload] No userId provided in request');
			return res.status(400).json({ message: 'userId required' });
		}

		console.log('[Files Upload] userId from request:', userId);


		if (!mongoose.Types.ObjectId.isValid(userId)) {
			const userDoc = await getUserByUsername(userId);
			if (!userDoc) return res.status(400).json({ message: 'Unknown user identifier' });
			userId = userDoc._id.toString();
		}

		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: 'No files provided' });
		}

	
		const project = await getProjectById(projectId);
		if (!project) return res.status(404).json({ message: 'Project not found' });

		console.log('[Files Upload] Project checkedOutBy:', project.checkedOutBy);
		console.log('[Files Upload] Uploading user:', userId);

	
		const checkedOutBy = project.checkedOutBy ? (project.checkedOutBy._id ? project.checkedOutBy._id.toString() : project.checkedOutBy.toString()) : null;
		if (!checkedOutBy || checkedOutBy !== userId) {
			console.log('[Files Upload] Authorization failed - checkedOutBy:', checkedOutBy, 'userId:', userId);
			return res.status(403).json({ message: 'Check out to add files' });
		}

		console.log('[Files Upload] Authorization passed, adding files');

		const newFiles = req.files.map(file => ({
			name: file.originalname || file.name,
			size: file.size,
			mime: file.mimetype || 'application/octet-stream'
		}));

		const updated = await updateProject(projectId, { $push: { files: { $each: newFiles } } });
		if (!updated) return res.status(404).json({ message: 'Project not found' });

		res.json({ message: 'Files added successfully', files: updated.files });
	} catch(e){ next(e);}
});


router.post('/:id/messages', async (req,res,next) => {
	try {
		const projectId = req.params.id;
		let { userId, message } = req.body;
		
		if (!userId || !message) {
			return res.status(400).json({ message: 'userId and message required' });
		}

		
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			const userDoc = await getUserByUsername(userId);
			if (!userDoc) return res.status(400).json({ message: 'Unknown user identifier' });
			userId = userDoc._id.toString();
		}

		
		const project = await getProjectById(projectId);
		if (!project) return res.status(404).json({ message: 'Project not found' });

		
		const userIsAdmin = await isAdmin(userId);
		const isMember = project.members.some(m => m._id.toString() === userId || m.toString() === userId);
		const isOwner = project.ownerId._id ? project.ownerId._id.toString() === userId : project.ownerId.toString() === userId;
		
		if (!userIsAdmin && !isMember && !isOwner) {
			return res.status(403).json({ message: 'Must be a project member or admin to post messages' });
		}

	
		const updated = await updateProject(projectId, { 
			$push: { 
				activity: { 
					userId, 
					message, 
					type: 'message',
					createdAt: new Date(),
					addedFiles: []
				} 
			} 
		});

		if (!updated) return res.status(404).json({ message: 'Project not found' });

		res.json({ message: 'Message posted successfully', activity: updated.activity });
	} catch(e){ next(e);}
});

module.exports = router;
