// Import necessary modules
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

// Create an Express application
const app = express();

// Specify the port to listen on
const PORT = 3001; // Ensure this port is different from your WebSocket server

// Route to create a new fight session and return a unique UUID
app.get('/fight/create', (req, res) => {
  // Generate a unique UUID for the fight session
  const fightId = uuidv4();

  // Respond with the generated UUID
  res.json({ fightId });
});

// Start the server
app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

export default app;