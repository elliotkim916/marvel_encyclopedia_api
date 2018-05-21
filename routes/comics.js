'use strict';

const express = require('express');
const router = require('express').Router();
const jsonParser = require('body-parser').json();
const mongoose = require('mongoose');

const {ReadingList} = require('../models/logs');
const passport = require('passport');
const {router: authRouter, localStrategy, jwtStrategy} = require('../auth');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/:username', jwtAuth, (req, res) => {
    ReadingList
        .find({username: req.params.username})
        .then(comics => {
            res.json({data: comics});
        });
});

router.post('/:username', [jsonParser, jwtAuth], (req, res) => {
    ReadingList 
        .create({
            title: req.body.title,
            read: req.body.read,
            imgUrl: req.body.imgUrl,
            username: req.body.username,
            resourceURI: req.body.resourceURI
        }).then(comic => res.status(201).json(comic.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went wrong..'});
        });
});

router.put('/:id', [jsonParser, jwtAuth], (req, res) => {
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

router.delete('/:id', jwtAuth, (req, res) => {
    ReadingList
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).json({message: 'Success!'});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Something went wrong..'});
        });
});

module.exports = router;