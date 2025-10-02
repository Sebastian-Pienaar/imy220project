const Friendship = require('../models/Friendship');
const mongoose = require('mongoose');

async function createRequest(requesterId, recipientId) {
  if (requesterId.toString() === recipientId.toString()) throw new Error('Cannot friend yourself');
  // Check if reversed already accepted or pending
  const existing = await Friendship.findOne({
    $or: [
      { requesterId, recipientId },
      { requesterId: recipientId, recipientId: requesterId }
    ]
  });
  if (existing) return existing; // idempotent
  return Friendship.create({ requesterId, recipientId });
}

async function acceptRequest(id) {
  return Friendship.findOneAndUpdate({ _id: id, status: 'pending' }, { status: 'accepted' }, { new: true });
}

async function deleteFriendship(id) {
  return Friendship.findByIdAndDelete(id);
}

async function listForUser(userId) {
  const uid = new mongoose.Types.ObjectId(userId);
  return Friendship.find({ $or: [ { requesterId: uid }, { recipientId: uid } ] });
}

async function getBetween(a,b) {
  return Friendship.findOne({
    $or: [
      { requesterId: a, recipientId: b },
      { requesterId: b, recipientId: a }
    ]
  });
}

module.exports = { createRequest, acceptRequest, deleteFriendship, listForUser, getBetween };
