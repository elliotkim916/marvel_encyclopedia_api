'use strict';

const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.get('/api/*', (req, res) => {
    res.json({ok: true});
});

let server;

function runServer() {
    const PORT = process.env.PORT || 3000;
    return new Promise((resolve, reject) => {
        server = app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
            resolve(server);
        })
        .on('error', err => {
            reject(err);
        });
    });
}

function closeServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};


module.exports = {app, runServer, closeServer};