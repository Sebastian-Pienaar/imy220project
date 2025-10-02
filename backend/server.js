require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const friendshipRoutes = require('./routes/friendships');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());


app.use((req,res,next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
});


app.use('/api/auth', authRoutes);

//Routers
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/friendships', friendshipRoutes);

//Bootstrap route to fetch initial data
app.get('/api/bootstrap', async (req,res) => {
  const { listUsers } = require('./repositories/userRepo');
  const { listProjects } = require('./repositories/projectRepo');
  // For bootstrap we don't know current user id (no auth yet); return all friendships instead
  const [users, projects] = await Promise.all([listUsers(), listProjects()]);
  const allFriendships = await require('./models/Friendship').find();
  res.json({ users, projects, friendships: allFriendships });
});


app.get('/api/health', async (req,res) => {
  const state = require('mongoose').connection.readyState; //1 connected
  res.json({ status: 'ok', mongoState: state });
});

// Global error handler (keep last)
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ message: 'Server error', detail: err.message });
});


async function start(){
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

start();