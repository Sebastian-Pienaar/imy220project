const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imy220';
let client; let db; let connecting;

async function connect() {
  if (db) return db;
  if (connecting) return connecting;
  connecting = (async () => {
    client = new MongoClient(uri, {});
    await client.connect();
    // Derive db name; default to 'imy220' if implicit 'test'
    db = client.db();
    if (db.databaseName === 'test') db = client.db('imy220');
    await ensureIndexes();
    return db;
  })();
  return connecting;
}

async function ensureIndexes() {
  const u = db.collection('users');
  await u.createIndex({ username: 1 }, { unique: true });
  await u.createIndex({ email: 1 }, { unique: true });

  const p = db.collection('projects');
  await p.createIndex({ name: 1 });
  await p.createIndex({ type: 1 });
  await p.createIndex({ hashtags: 1 });

  const f = db.collection('friendships');
  await f.createIndex({ requesterId: 1, recipientId: 1 }, { unique: true });
  await f.createIndex({ status: 1 });
}

function getDb() { if (!db) throw new Error('DB not connected yet'); return db; }
function toObjectId(id) { try { return new ObjectId(id); } catch { return null; } }

module.exports = { connect, getDb, toObjectId, ObjectId };
