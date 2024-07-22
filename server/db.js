import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017'; 
const dbName = 'fight2'; 
const collectionName = 'fightrecords'; 

async function saveFightRecord(email, name, fightData) {
  let client;

  const { victor, resultDescription, names } = fightData;

  try {
    client = await MongoClient.connect(url);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const document = {email, name, victor, resultDescription, names};
    await collection.insertOne(document);
  } catch (error) {
    console.error('Failed to insert fight record:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export { saveFightRecord };

