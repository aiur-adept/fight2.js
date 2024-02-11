// Import necessary modules
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { setFightData } from './db.js'; // Import Redis client

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Route to create a new fight session and return a unique UUID
app.get('/challenge', async (req, res) => {
  // Generate a unique UUID for the fight session
  const fightId = uuidv4();
  const fightUrl = `/fight/${fightId}`;

  const fightData = {
    id: fightId,
    url: fightUrl,
    names: [],
    sockets: {},
    round: 1,
    roundTime: 12,
    nRounds: 3,
    t: 0,
    states: {},
    initiative: -1,
    mode: 'standing',
    status: 'waiting', // Possible statuses: 'waiting', 'in-progress', 'finished'
    roundPoints: [0, 0],
    judgeScores: [[0, 0], [0, 0], [0, 0]],
    initiativeStrike: 0,
    events: [],
  };


  try {
    // Use setFightData instead of client.set
    await setFightData(fightId, fightData);
    console.log(`Created fight key in db: ${fightId}`);
    // Respond with the generated UUID and fight URL
    res.json({ fightId, fightUrl });
  } catch (error) {
    console.error('Error storing fight data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

});

export default app;
