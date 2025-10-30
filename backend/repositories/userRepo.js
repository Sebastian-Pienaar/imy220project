const User = require('../models/User');

async function createUser(data) { return User.create(data); }
async function getUserById(id) { return User.findById(id); }
async function getUserByUsername(username) { return User.findOne({ username }); }
async function searchUsers(q) {
  if (!q) return [];
  const regex = new RegExp(q, 'i');
  return User.find({ $or: [{ name: regex }, { username: regex }, { email: regex }] }).limit(25);
}
async function listUsers() { return User.find().limit(100); }
async function updateUser(id, patch) { return User.findByIdAndUpdate(id, patch, { new: true }); }
async function deleteUser(id) { return User.findByIdAndDelete(id); }

module.exports = { createUser, getUserById, getUserByUsername, searchUsers, listUsers, updateUser, deleteUser };
