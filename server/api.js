import express from 'express';
import { setFightData } from './redis.js';
import { createFightData } from './functions.js';
import { startComputerOpponentProcess } from './computer-opponent.js';
import { saveFightRecord } from './db.js';

const app = express();

app.use(express.json());

app.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user);
    res.json(req.user); // Send user info if authenticated
  } else {
    res.status(401).json({ message: 'Unauthorized' }); // Not authenticated
  }
});

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

app.post('/saveFight', async (req, res) => {
  const fightData = req.body;
  await saveFightRecord(req.user.email, req.user.displayName, fightData);
  res.json({ message: 'Fight record saved' });
});

export default app;
