'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');

const comicsRouter = require('./routes/comics');
const {router: usersRouter} = require('./users');

const cors = require('cors');
const {CLIENT_ORIGIN, DATABASE_URL, PORT} = require('./config');

// localStrategy needs to use bodyParser to extract username and password info from request body
app.use(bodyParser());

// mounted the comicsRouter at /api/marvel
app.use('/api/marvel', comicsRouter);

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Credentials','true'); 
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization'); 
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') { 
        return res.sendStatus(204); 
        } 
    return next(); 
});

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(passport.initialize());

// able to create an account with username & password
app.use('/api/users/', usersRouter);
app.use('/api/auth', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'rosebud'
  });
});

let server;

function runServer(databaseUrl, port=PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
        server = app.listen(port, () => {
            console.log(`Listening on port ${port}`);
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
            console.log('Closing server');
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
    runServer(DATABASE_URL).catch(err => console.error(err));
};


module.exports = {app, runServer, closeServer};