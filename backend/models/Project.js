const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  // Make version optional so non-checkin events (checkout/return) can be stored without forcing a value.
  version: { type: String },
  addedFiles: [{ name: String, size: Number, mime: String }],
  type: { type: String, enum: ['checkin','checkout','return'], default: 'checkin' },
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, index: true },
  version: { type: String, default: '1.0.0' },
  hashtags: [{ type: String, index: true }],
  files: [{ name: String, size: Number, mime: String }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  image: { type: String }, // base64 or CDN reference
  isAvailable: { type: Boolean, default: true },
  checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  activity: [CheckInSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
