import express from 'express';
import * as http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import apiRouter from './api.js';
import { setupSocketIO } from './ws.js';

import oauth_client from './oauth_client.json' assert { type: "json" };

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



//
// passport
//
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, { id: user.id, displayName: user.displayName, email: user.emails[0].value });
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: oauth_client.web.client_id,
  clientSecret: oauth_client.web.client_secret,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Successful authentication, redirect home.
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});



//
// our routes
//

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
