// Import necessary modules
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

// Create an Express application
const app = express();

// Route to create a new fight session and return a unique UUID
app.get('/challenge', (req, res) => {
  // Generate a unique UUID for the fight session
  const fightId = uuidv4();

  // Respond with the generated UUID
  res.json({ fightId, fightUrl: `/fight/${fightId}`});
});

export default app;