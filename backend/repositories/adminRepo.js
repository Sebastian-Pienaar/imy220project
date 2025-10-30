const User = require('../models/User');


const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Authentication required' });
    }


    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Server error during admin verification' });
  }
};

const isAdmin = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.isAdmin === true;
  } catch (error) {
    console.error('isAdmin check error:', error);
    return false;
  }
};

module.exports = { requireAdmin, isAdmin };
