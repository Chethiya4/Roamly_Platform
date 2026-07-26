const mongoose = require('mongoose');

// Enable global buffering so queries queue safely during connection setup
mongoose.set('bufferCommands', true);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roamly';

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('MongoDB Connected Successfully');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;