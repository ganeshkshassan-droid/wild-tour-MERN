const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Safari = require('../models/Safari');
const Stay = require('../models/Stay');
const Package = require('../models/Package');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wildtour_db';

const updatePhotos = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[MongoDB Connected for Card Photos Update]');

    // 1. Update Safaris
    // - Jeep / Savanna Safari -> /images/savanna-wildlife-safari.jpg
    // - Riverboat Safari -> /images/lagoon-boat-safari.jpg
    // - Night / Sunset Safari -> /images/sunset-acacia-trail.jpg
    const resJeep = await Safari.updateMany(
      { $or: [{ category: 'Jeep' }, { name: /jeep/i }] },
      { $set: { image_url: '/images/savanna-wildlife-safari.jpg' } }
    );
    console.log(`✔ Updated Jeep Safaris with Savanna photo (${resJeep.modifiedCount} updated)`);

    const resBoat = await Safari.updateMany(
      { $or: [{ category: 'Boat' }, { name: /boat/i }] },
      { $set: { image_url: '/images/lagoon-boat-safari.jpg' } }
    );
    console.log(`✔ Updated Boat Safaris with Lagoon photo (${resBoat.modifiedCount} updated)`);

    const resNight = await Safari.updateMany(
      { $or: [{ category: 'Night' }, { name: /night|buffer/i }] },
      { $set: { image_url: '/images/sunset-acacia-trail.jpg' } }
    );
    console.log(`✔ Updated Night Safaris with Sunset photo (${resNight.modifiedCount} updated)`);

    // 2. Update Stays
    // - Luxury overwater bungalow / villa -> /images/luxury-overwater-bungalow.jpg
    // - Waterfront villa / Serai -> /images/waterfront-villa-stay.jpg
    const resStay1 = await Stay.updateMany(
      { name: /evolve|luxury|hut|pool/i },
      { $set: { image_url: '/images/luxury-overwater-bungalow.jpg' } }
    );
    console.log(`✔ Updated Evolve Back / Overwater Stays with Bungalow photo (${resStay1.modifiedCount} updated)`);

    const resStay2 = await Stay.updateMany(
      { name: /serai|waterfront|estate/i },
      { $set: { image_url: '/images/waterfront-villa-stay.jpg' } }
    );
    console.log(`✔ Updated Serai / Waterfront Stays with Villa photo (${resStay2.modifiedCount} updated)`);

    // 3. Update Packages
    const resPkg1 = await Package.updateMany(
      { name: /maharaja|royal|luxury/i },
      { $set: { image_url: '/images/luxury-overwater-bungalow.jpg' } }
    );
    console.log(`✔ Updated Royal Packages with Overwater photo (${resPkg1.modifiedCount} updated)`);

    const resPkg2 = await Package.updateMany(
      { name: /weekend|cat|trek/i },
      { $set: { image_url: '/images/sunset-acacia-trail.jpg' } }
    );
    console.log(`✔ Updated Weekend Packages with Sunset photo (${resPkg2.modifiedCount} updated)`);

    console.log('\n=================================================');
    console.log('🎉 ALL DATABASE CARDS UPDATED WITH NEW PHOTOS!');
    console.log('=================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update photos:', error);
    process.exit(1);
  }
};

updatePhotos();
