'use strict';

const router = require('express').Router();
const jsonParser = require('body-parser').json();
const mongoose = require('mongoose');

const {ReadingList} = require('../models/logs');

router.get('/', (req, res) => {
    ReadingList
        .find()
        .then(comics => {
            res.json({
                comics: comics.map(
                    (comic) => comic.serialize())
            });
        });
});

router.post('/', jsonParser, (req, res) => {
    ReadingList 
        .create({
            title: req.body.title,
            read: req.body.read,
            userName: req.body.userName
        }).then(comic => res.status(201).json(comic.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went wrong..'});
        });
});

router.put('/:id', jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const updated = {};
    const updateableField = 'read';
    if (updateableField in req.body) {
        updated[updateableField] = req.body[updateableField];
    }

    ReadingList
        .findByIdAndUpdate(req.params.id, { $set: updated}, {new: true})
        .then(updatedEntry => {
            res.status(204).end()
        }).catch(err => {
            res.status(500).json({message: 'Something went wrong..'});
        });
});

module.exports = router;