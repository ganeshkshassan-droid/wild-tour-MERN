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

  if (!rawUri && process.env.NODE_ENV === 'production') {
    console.error(
      '\n[FATAL STARTUP ERROR]: MONGO_URI environment variable is missing in server configuration!\n' +
      'Action Required: Please navigate to your Render Dashboard -> Service Settings -> Environment -> Add Environment Variable:\n' +
      '  Key: MONGO_URI\n' +
      '  Value: mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/wildtour_db?retryWrites=true&w=majority\n'
    );
    process.exit(1);
  }

  const uri = rawUri || 'mongodb://localhost:27017/wildtour_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB Connected]: Host=${conn.connection.host}, DB=${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[MongoDB Atlas Setup]: Ensure Network Access in MongoDB Atlas is configured to 0.0.0.0/0 (Allow access from anywhere for cloud deployment).'
      );
      process.exit(1);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
