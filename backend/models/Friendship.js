const mongoose = require('mongoose');

/**
 * Friendship: directional request (requester -> recipient) with status lifecycle.
 * status: 'pending' | 'accepted'
 */
const FriendshipSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending','accepted'], default: 'pending', index: true },
}, { timestamps: true });

// Prevent duplicate same-direction requests
FriendshipSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

module.exports = mongoose.model('Friendship', FriendshipSchema);
