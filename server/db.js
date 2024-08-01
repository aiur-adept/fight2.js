import { MongoClient } from 'mongodb';

const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'fight2';

async function saveFightRecord(fightData) {
  let client;

  const { victor, resultDescription, names } = fightData;

  for (const [name, email] of Object.entries(fightData.emails)) {
    MongoClient.connect(url)
      .then(client => {
        // insert the fight record
        const db = client.db(dbName);
        const collection = db.collection('fightrecords');
        const document = { email, name, victor, resultDescription, names };
        return collection.insertOne(document).then(() => client);
      })
      .then(client => {
        const db = client.db(dbName);
        // determine whether this was a win, loss, or draw for the name
        const result = victor === name ? 'win' : victor === null ? 'draw' : 'loss';
        // update the name's win, loss, or draw count with upsert
        const collection = db.collection('recordsummaries');
        const update = { $inc: { [result]: 1 } };
        const options = { upsert: true }; // Ensure document is created if it doesn't exist
        return collection.updateOne({ email, name }, update, options).then(() => client);
      })
      .then(client => client.close())
      .catch(error => {
        console.error('Failed to insert fight record:', error);
        if (client) {
          client.close();
        }
      });
  }
}

async function getFightsByEmail(email) {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  const collection = db.collection('fightrecords');
  const fights = await collection.find({ email }).toArray();
  return fights;
}

async function getRecordSummaries(email, name) {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  const collection = db.collection('recordsummaries');
  const recordSummaries = await collection.find({ email, name }).toArray();
  return recordSummaries;
}

async function getLeaders() {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  const collection = db.collection('recordsummaries');
  const leaders = await collection.find().sort({ wins: -1 }).limit(10).toArray();
  return leaders;
}

export { saveFightRecord, getFightsByEmail, getRecordSummaries, getLeaders };
