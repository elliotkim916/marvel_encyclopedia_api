'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const jwt = require('jsonwebtoken');
const config = require('../config');

const {NotesList} = require('../models/notes-list');
const testData = require('../db/notes');

// deletes db between tests to maintain state between tests
function teardownDb() {
    console.warn('Deleting database!');
    return mongoose.connection.dropDatabase();
}

const createAuthToken = user => {
    return jwt.sign({user}, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

const TEST_USER = {
    "username": "msMarvel",
    "password": "iAmTheBest"
}

const USER_TOKEN = createAuthToken(TEST_USER);

describe('Marvel Encyclopedia Note Taking', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return NotesList.insertMany(testData);
    });

    afterEach(function() {
        return teardownDb();
    });

    after(function() {
        return closeServer();
    });

describe('GET endpoint', function() {
    it('should return all notes', function() {
        return chai.request(app)
            .get(`/api/notes`)
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .then(function(res) {
                expect(res).to.be.status(200);
                expect(res).to.be.json;
                expect(res.body.data).to.be.a('array');
                expect(res.body.data).to.have.lengthOf.at.least(1);
            });
    });
});

    let resNoteEntry;
    it('should return note with the right fields', function() {
        return chai.request(app)
            .get(`/api/notes`)
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .then(function(res) {
                expect(res).to.be.status(200);
                expect(res).to.be.json;
                expect(res.body.data).to.be.a('array');
                expect(res.body.data).to.have.lengthOf.at.least(1);

                res.body.data.forEach(function(note) {
                    expect(note).to.be.a('object');
                    expect(note).to.include.keys('title', 'note')
                });

                resNoteEntry = res.body.data[0];
                return NotesList.findById(resNoteEntry._id);
            })
            .then(function(post) {
                expect(resNoteEntry.title).to.equal(post.title);
                expect(resNoteEntry.note).to.equal(post.note);
            });
    });

describe('POST endpoint', function() {
    it('should add a new note entry', function() {
    const newNote = {
        "title": "Iron Man",
        "note": "Iron Man is Tony Stark!"
    }

    return chai.request(app)
        .post(`/api/notes`)
        .set('Authorization', `Bearer ${USER_TOKEN}`)
        .send(newNote)
        .then(function(res) {
            expect(res).to.be.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('title', 'note');
            expect(res.body.title).to.equal(newNote.title);
            expect(res.body.note).to.equal(newNote.note);
            return NotesList.findById(res.body.id);
        })
// we retrieve new note from db & compare its data to the data we sent over 
        .then(function(post) {
            expect(post.title).to.equal(newNote.title);
            expect(post.note).to.equal(newNote.note);
        });
    });
});

describe('PUT endpoint', function() {
    it('should update the fields user chooses', function() {
        const toUpdate = {
            note: 'Iron Man is so rich!'
        }

    return NotesList
        .findOne()
        .then(note => {
            toUpdate._id = note._id;
        
        return chai.request(app)
            .put(`/api/notes/${note._id}`)
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send(toUpdate);
        }).then(res => {
            expect(res).to.have.status(204);
            return NotesList.findById(toUpdate._id);
        })
// we retrieve the updated post from db and prove the post in db
// is equal to the updated values we sent over
        .then(post => {
            expect(toUpdate.note).to.equal(post.note);
        });
    });
});

describe('DELETE endpoint', function() {
    it('should delete a note entry', function() {
        let note;
        return NotesList
            .findOne()
            .then(function(_note) {
                note=_note;
                return chai.request(app)
                .delete(`/api/notes/${note._id}`)
                .set('Authorization', `Bearer ${USER_TOKEN}`)
            })
            .then(function(res) {
                expect(res).to.have.status(204);
                return NotesList.findById(note._id)
            })
            .then(function(_entry) {
                expect(_entry).to.be.null;
            });
    });
});
});