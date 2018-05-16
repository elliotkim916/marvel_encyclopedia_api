'use strict';

const mongoose = require('mongoose');
const {DATABASE_URL} = require('../config');
const {ReadingList} = require('../models/logs');

const comicsSeed = require('../db/comics.json');

mongoose.connect(DATABASE_URL)
    .then(function() {
        return mongoose.connection.db.dropDatabase();
    }).then(function() {
        return ReadingList.insertMany(comicsSeed);
    }).then(function() {
        return mongoose.disconnect();
    }).catch(err => {
        console.error(err.message);
    });