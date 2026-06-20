// Run this script with: node listContacts.js
// Make sure you have 'mongodb' package installed: npm install mongodb

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'; // Update if needed
const dbName = 'edutrackdb';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const students = await db.collection('students').find({}, { projection: { contact: 1, _id: 0 } }).toArray();
    console.log('All student contact numbers:');
    students.forEach((s, i) => console.log(`${i + 1}: ${s.contact}`));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();
