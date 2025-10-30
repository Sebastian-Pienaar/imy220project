const express = require('express');
const router = express.Router();
const { createRequest, acceptRequest, deleteFriendship, listForUser } = require('../repositories/friendshipRepo');

router.get('/user/:userId', async (req,res,next) => {
  try {
    const items = await listForUser(req.params.userId);
    res.json(items);
  } catch(e){ next(e);} 
});

//Create req
router.post('/', async (req,res,next) => {
  try {
    const { requesterId, recipientId } = req.body;
    if (!requesterId || !recipientId) return res.status(400).json({ message: 'requesterId & recipientId required' });
    const fr = await createRequest(requesterId, recipientId);
    res.status(201).json(fr);
  } catch(e){ next(e);} 
});

//Accept request
router.patch('/:id/accept', async (req,res,next) => {
  try {
    const updated = await acceptRequest(req.params.id);
    if (!updated) return res.status(404).json({ message: 'Request not found or already accepted' });
    res.json(updated);
  } catch(e){ next(e);} 
});

//Delete/cancle
router.delete('/:id', async (req,res,next) => {
  try {
    await deleteFriendship(req.params.id);
    res.status(204).end();
  } catch(e){ next(e);} 
});

module.exports = router;
