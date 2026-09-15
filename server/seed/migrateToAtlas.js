const mongoose = require('mongoose');
const dns = require('dns');

// DNS server fallback for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const LOCAL_URI = 'mongodb://localhost:27017/wildtour_db';
const ATLAS_URI = process.env.ATLAS_URI || 'mongodb+srv://ganeshrc544_db_user:uCW8MeM8vCnL8sHi@cluster0.3uaskzq.mongodb.net/wildtour_db?retryWrites=true&w=majority&appName=Cluster0';

async function migrateData() {
  console.log('🚀 Starting Data Migration: Local MongoDB -> MongoDB Atlas...\n');

  let localConn, atlasConn;

  try {
    console.log('1. Connecting to Local MongoDB...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('   ✅ Connected to Local MongoDB');

    console.log('2. Connecting to MongoDB Atlas...');
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('   ✅ Connected to MongoDB Atlas\n');

    const collections = await localConn.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate:\n`);

    for (const colInfo of collections) {
      const colName = colInfo.name;
      if (colName.startsWith('system.')) continue;

      const localCol = localConn.db.collection(colName);
      const atlasCol = atlasConn.db.collection(colName);

      const docs = await localCol.find({}).toArray();
      const count = docs.length;

      if (count > 0) {
        // Clear destination collection first
        await atlasCol.deleteMany({});
        // Insert all documents preserving exact _id, timestamps, and relations
        await atlasCol.insertMany(docs);
        console.log(`   📦 [${colName}]: Migrated ${count} documents successfully`);
      } else {
        console.log(`   ⚪ [${colName}]: 0 documents (empty collection)`);
      }
    }

    console.log('\n🎉 ALL DATA MIGRATED TO MONGODB ATLAS SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    process.exit(0);
  }
}

migrateData();
