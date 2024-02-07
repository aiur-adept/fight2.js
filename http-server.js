import express from 'express';
import * as http from 'http';
import path from 'path';
import apiRouter from './api.js'; // Ensure this is correctly pointing to your API module
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Deriving __dirname and __filename in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 8080;

// Serving static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Using the API router
app.use('/api', apiRouter);

// Fallback to serve the index.html for SPA routing
app.get('/fight/:uuid', (req, res) => {
  console.log('here');
  res.sendFile(path.join(__dirname, '..', 'public', 'fight.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handling SIGUSR2 for graceful shutdown, useful in development environments like nodemon
process.on('SIGUSR2', () => {
  server.close(() => {
    console.log('Server closed. Exiting...');
    process.exit(0);
  });
});
