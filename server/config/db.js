const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records across local ISPs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fail-soft if custom DNS cannot be configured in environment
}

const connectDB = async () => {
  const rawUri = (process.env.MONGO_URI || '').trim().replace(/^["']|["']$/g, '');
  const uri = rawUri || 'mongodb://localhost:27017/wildtour_db';

  if (!rawUri && process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL CONFIG ERROR]: MONGO_URI is not set in Render Environment Variables! Please add MONGO_URI in the Render dashboard.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB Connected]: Host=${conn.connection.host}, DB=${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('[MongoDB Atlas Tip]: Ensure Network Access in Atlas is set to 0.0.0.0/0 (Allow access from anywhere).');
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
