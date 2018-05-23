'use strict';

const express = require('express');
const router = require('express').Router();
const jsonParser = require('body-parser').json();
const mongoose = require('mongoose');

const {NotesList} = require('../models/notes-list');
const passport = require('passport');
const {router: authRouter, localStrategy, jwtStrategy} = require('../auth');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/:username', jwtAuth, (req, res) => {
    NotesList
        .find({username: req.params.username})
        .then(notes => {
            res.json({data: notes});
        });
});

router.post('/:username', [jsonParser, jwtAuth], (req, res) => {
    NotesList
        .create({
            title: req.body.title,
            note: req.body.note,
            username: req.body.username
        }).then(userNote => res.status(201).json(userNote.serialize()))
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
    const updateableField = ['title', 'note'];
    updateableField.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    NotesList
        .findByIdAndUpdate(req.params.id, { $set: updated}, {new: true})
        .then(updatedEntry => {
            res.status(204).end()
        }).catch(err => {
            res.status(500).json({message: 'Something went wrong..'});
        });
});

router.delete('/:id', jwtAuth, (req, res) => {
    NotesList
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