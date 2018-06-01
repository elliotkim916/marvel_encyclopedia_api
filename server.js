'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const app = express();

const passport = require('passport');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const comicsRouter = require('./routes/comics');
const {router: usersRouter} = require('./users');

const cors = require('cors');
const {CLIENT_ORIGIN, DATABASE_URL, PORT} = require('./config');

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(passport.initialize());

// able to create an account with username & password
app.use('/api/users/', usersRouter);
app.use('/api/auth', authRouter);

// mounted the comicsRouter at /api/marvel
app.use('/api/marvel', comicsRouter);

let server;

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });    
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => err);
};


module.exports = {app, runServer, closeServer};