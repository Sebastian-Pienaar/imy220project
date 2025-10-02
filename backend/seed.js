require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const bcrypt = require('bcryptjs');

async function run() {
  await connectDB();
  console.log('Seeding data...');

  // Clear existing minimal sets (CAREFUL in real environment)
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const users = await User.insertMany([
    { username:'seb-pienaar', name:'Seb Pienaar', email:'seb@example.com', passwordHash, role:'student', bio:'React & collaboration focused dev.', languages:['JavaScript','React','CSS'] },
    { username:'jane-doe', name:'Jane Doe', email:'jane@example.com', passwordHash, role:'full-stack dev', bio:'Full-stack explorer. Loves refactoring.', languages:['Java','Spring','SQL'] }
  ]);

  const seb = users.find(u=>u.username==='seb-pienaar');
  const jane = users.find(u=>u.username==='jane-doe');

  const projects = await Project.insertMany([
    {
      name:'project_1',
      description:'Demo seeded project 1',
      ownerId: seb._id,
      type:'web-app',
      version:'1.0.0',
      hashtags:['#javascript','#react'],
      members:[seb._id],
      isAvailable:true,
      activity:[]
    },
    {
      name:'project_2',
      description:'Demo seeded project 2',
      ownerId: jane._id,
      type:'library',
      version:'0.3.2',
      hashtags:['#java','#spring'],
      members:[jane._id],
      isAvailable:true,
      activity:[]
    }
  ]);

  // Add three check-ins mixed across projects
  const now = Date.now();
  await Project.findByIdAndUpdate(projects[0]._id, { $push: { activity: { userId: seb._id, message:'Initial scaffold commit', version:'1.0.1', addedFiles:[{ name:'index.js', size:1234, mime:'text/javascript' }], createdAt: new Date(now-600000) } } });
  await Project.findByIdAndUpdate(projects[0]._id, { $push: { activity: { userId: seb._id, message:'Added auth flow', version:'1.0.2', addedFiles:[{ name:'auth.js', size:680, mime:'text/javascript' }], createdAt: new Date(now-300000) } } });
  await Project.findByIdAndUpdate(projects[1]._id, { $push: { activity: { userId: jane._id, message:'Refactored data layer', version:'0.3.3', addedFiles:[{ name:'repository.java', size:2048, mime:'text/plain' }], createdAt: new Date(now-120000) } } });

  console.log('Seed complete.');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
