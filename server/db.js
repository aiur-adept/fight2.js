import { createClient } from 'redis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';

// Create a Redis client
const client = createClient({
  url: `redis://${REDIS_HOST}:6379`
});

client.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
(async () => {
  await client.connect();
})();

/**
 * Fetches fight data from Redis by fightId.
 * @param {string} fightId The UUID of the fight to fetch data for.
 * @returns {Promise<Object>} A promise that resolves to the fight data object.
 */
async function getFightData(fightId) {
  try {
    const fightDataJson = await client.get(fightId);
    if (!fightDataJson) {
      throw new Error(`Fight data not found for id: ${fightId}`);
    }
    // Parse the JSON string back into a JavaScript object
    const fightData = JSON.parse(fightDataJson);
    return fightData;
  } catch (error) {
    console.error(`Error retrieving or parsing fight data from Redis: ${error}`);
    throw error; // Rethrow the error to handle it in the calling context
  }
}


/**
 * Saves fight data to Redis.
 * @param {string} fightId The UUID of the fight.
 * @param {Object} fightData The fight data object to save.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function setFightData(fightId, fightData) {
  // Serialize fightData to a JSON string
  const fightDataJson = JSON.stringify(fightData);

  try {
    await client.set(fightId, fightDataJson);
  } catch (err) {
    console.error(`Error saving fight data to Redis: ${err}`);
    throw err; // Rethrow the error to handle it in the calling context
  }
}


export {
  client,
  getFightData,
  setFightData,
};
