import express from 'express';
import * as http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import apiRouter from './api.js';
import { setupSocketIO } from './ws.js';

// Deriving __dirname and __filename in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);

//
// Socket.io
//
setupSocketIO(server);

// Serving static files from 'public' directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Using the API router
app.use('/api', apiRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
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
