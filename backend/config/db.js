const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://mongo:27017/imy220';
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set, falling back to default mongodb://mongo:27017/imy220');
  }

  const maxRetries = 10;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`🗄️  Connecting to MongoDB (attempt ${attempt}/${maxRetries})...`);
      await mongoose.connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 8000
      });
      console.log('✅ MongoDB connected');
      return;
    } catch (err) {
      console.error(`Mongo connection error (attempt ${attempt}):`, err.message);
      if (attempt >= maxRetries) {
        console.error('Exceeded maximum MongoDB connection attempts. Staying alive for diagnostics.');
        return; // Do not exit; container remains running.
      }
      const delay = Math.min(5000, 500 * attempt); // simple backoff up to 5s
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

module.exports = { connectDB };
