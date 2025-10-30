/**
 Script to create or update an admin user
node backend/createAdmin.js <username> <password>
Eg node backend/createAdmin.js admin AdminPassword123
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/imy220';

async function createAdmin(username, password) {
  try {

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

   
    let user = await User.findOne({ username });

    if (user) {
   
      user.isAdmin = true;
      await user.save();
      console.log(`User '${username}' updated to admin`);
    } else {

      user = await User.create({
        username,
        name: 'Administrator',
        email: `${username}@admin.local`,
        passwordHash: password,
        isAdmin: true,
        role: 'admin',
        bio: 'System Administrator',
        location: 'System',
        languages: []
      });
      console.log(`Admin user '${username}' created successfully`);
    }

    console.log(`
Admin User Details:
-------------------
Username: ${user.username}
Name: ${user.name}
Email: ${user.email}
Admin: ${user.isAdmin}
ID: ${user._id}
    `);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}


const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node backend/createAdmin.js <username> <password>');
  console.error('Example: node backend/createAdmin.js admin AdminPassword123');
  process.exit(1);
}

const [username, password] = args;
createAdmin(username, password);
