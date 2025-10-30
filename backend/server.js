require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const friendshipRoutes = require('./routes/friendships');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 8000;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); //10MB 

app.use(cors());
app.use(upload.array('files', 10));
app.use(express.json());

//Req logging
app.use((req,res,next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});

//API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/friendships', friendshipRoutes);

//initial data met bootstrap
app.get('/api/bootstrap', async (req,res) => {
  try {
    const { listUsers } = require('./repositories/userRepo');
    const { listProjects } = require('./repositories/projectRepo');
    const [users, projects] = await Promise.all([listUsers(), listProjects()]);
    const allFriendships = await require('./models/Friendship').find();
    res.json({ users, projects, friendships: allFriendships });
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.status(500).json({ message: 'Bootstrap failed', error: error.message });
  }
});

app.get('/api/health', async (req,res) => {
  const state = require('mongoose').connection.readyState; //1 connected
  res.json({ status: 'ok', mongoState: state });
});

// if running in production (Docker) or if frontend/public exists for serving static files
const publicPath = path.join(__dirname, '../frontend/public');
const distPath = path.join(__dirname, '../dist');

//Serve die static frontend as dist folder exist (docker) of frontend/public (development fallback)
if (fs.existsSync(distPath)) {
  console.log('Production mode: serving static files from dist/');
  app.use(express.static(distPath));
 
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else if (fs.existsSync(publicPath)) {
  console.log('Development fallback: serving static files from frontend/public/');
  app.use(express.static(publicPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  console.log('Development mode: API only (expecting webpack-dev-server for frontend)');
}


app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ message: 'Server error', detail: err.message });
});


process.on('unhandledRejection', err => { console.error('UNHANDLED REJECTION', err); });
process.on('uncaughtException', err => { console.error('UNCAUGHT EXCEPTION', err); process.exit(1); });

async function start(){
  try {
    console.log('Starting server...');
    await connectDB();
    console.log('DB connected, starting HTTP server...');
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (e) {
    console.error('DB connection failed, but starting server anyway:', e.message);
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port} (DB disconnected)`);
    });
  }
}

start();