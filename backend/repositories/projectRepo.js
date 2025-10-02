const Project = require('../models/Project');

async function createProject(data) { return Project.create(data); }
async function getProjectById(id) { return Project.findById(id).populate('ownerId members checkedOutBy activity.userId'); }
async function listProjects() { return Project.find().sort({ createdAt: -1 }).limit(100); }
async function addCheckIn(projectId, checkIn) {
  // Ensure event is labeled as a checkin
  return Project.findByIdAndUpdate(projectId, { $push: { activity: { ...checkIn, type: 'checkin' } } }, { new: true });
}
async function updateProject(id, patch) { return Project.findByIdAndUpdate(id, patch, { new: true }); }
async function deleteProject(id) { return Project.findByIdAndDelete(id); }

async function checkoutProject(id, userId) {
  return Project.findOneAndUpdate(
    { _id: id, isAvailable: true },
    { 
      $set: { isAvailable: false, checkedOutBy: userId },
      $push: { activity: { userId, message: 'Checked out project', type: 'checkout', createdAt: new Date(), addedFiles: [] } }
    },
    { new: true }
  );
}

async function returnProjectRepo(id, userId) {
  return Project.findOneAndUpdate(
    { _id: id, checkedOutBy: userId },
    { 
      $set: { isAvailable: true, checkedOutBy: null },
      $push: { activity: { userId, message: 'Returned project', type: 'return', createdAt: new Date(), addedFiles: [] } }
    },
    { new: true }
  );
}
async function searchCheckIns(q) {
  if (!q) return [];
  const regex = new RegExp(q, 'i');
  // Search within nested activity messages OR project type OR hashtags
  return Project.aggregate([
    { $match: { $or: [ { type: regex }, { hashtags: regex }, { 'activity.message': regex } ] } },
    { $project: { name: 1, type:1, hashtags:1, activity:1, version:1 } },
    { $limit: 50 }
  ]);
}

module.exports = { createProject, getProjectById, listProjects, addCheckIn, updateProject, deleteProject, searchCheckIns, checkoutProject, returnProjectRepo };
