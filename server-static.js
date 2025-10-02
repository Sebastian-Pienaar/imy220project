// server-static.js
// Production entrypoint: serves built frontend (dist) and mounts API.
require('dotenv').config();
const path = require('path');
const express = require('express');
const { connectDB } = require('./backend/config/db');
const authRoutes = require('./backend/routes/auth');
const userRoutes = require('./backend/routes/users');
const projectRoutes = require('./backend/routes/projects');
const friendshipRoutes = require('./backend/routes/friendships');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

// Simple request log (concise)
app.use((req,res,next) => { const start=Date.now(); res.on('finish',()=>console.log(`${req.method} ${req.url} -> ${res.statusCode} ${Date.now()-start}ms`)); next(); });

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/friendships', friendshipRoutes);
app.get('/api/health', (req,res) => { const state = require('mongoose').connection.readyState; res.json({ status:'ok', mongoState: state }); });

// Bootstrap route to fetch initial data
app.get('/api/bootstrap', async (req,res) => {
  try {
    const { listUsers } = require('./backend/repositories/userRepo');
    const { listProjects } = require('./backend/repositories/projectRepo');
    const [users, projects] = await Promise.all([listUsers(), listProjects()]);
    const allFriendships = await require('./backend/models/Friendship').find();
    res.json({ users, projects, friendships: allFriendships });
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.status(500).json({ message: 'Bootstrap failed', error: error.message });
  }
});

// Serve static frontend (built bundle)
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback for client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

process.on('unhandledRejection', err => { console.error('UNHANDLED REJECTION', err); });
process.on('uncaughtException', err => { console.error('UNCAUGHT EXCEPTION', err); process.exit(1); });

(async () => {
  try {
    console.log('Starting server...');
    await connectDB();
    console.log('DB connected, starting HTTP server...');
    app.listen(port, () => console.log(`🚀 Server listening on :${port}`));
  } catch (e) {
    console.error('DB connection failed, but starting server anyway:', e.message);
    app.listen(port, () => console.log(`🚀 Server listening on :${port} (DB disconnected)`));
  }
})();
