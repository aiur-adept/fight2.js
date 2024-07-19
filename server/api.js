import express from 'express';
import { setFightData } from './db.js';
import { createFightData } from './functions.js';
import { startComputerOpponentProcess } from './computer-opponent.js';

const app = express();

app.use(express.json());

// Route to create a new fight session and return a unique UUID
app.get('/challenge', async (req, res) => {
  const fightData = createFightData();
  try {
    await setFightData(fightData.id, fightData);
    console.log(`Created fight key in db: ${fightData.id}`);
    res.json({ fightId: fightData.id, fightUrl: fightData.url });
  } catch (error) {
    console.error('Error storing fight data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/createComputerOpponent', async (req, res) => {
  const fightData = createFightData();
  await setFightData(fightData.id, fightData);
  startComputerOpponentProcess(fightData);
  res.json(fightData);
});

export default app;
