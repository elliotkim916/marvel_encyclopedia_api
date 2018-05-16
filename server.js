'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const app = express();

const comicsRouter = require('./routes/comics');
const {router: usersRouter} = require('./users');

const cors = require('cors');
const {CLIENT_ORIGIN, DATABASE_URL, PORT} = require('./config');

// mounted the comicsRouter at /api/marvel
app.use('/api/marvel', comicsRouter);

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

// able to create an account with username & password
app.use('/api/users/', usersRouter);

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