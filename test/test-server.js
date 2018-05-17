'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {ReadingList} = require('../models/logs');
const testData = require('../db/comics');

// deletes db between tests to maintain state between tests
function teardownDb() {
    console.warn('Deleting database!');
    return mongoose.connection.dropDatabase();
}

describe('Marvel Encyclopedia Server-Side API', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return ReadingList.insertMany(testData);
    });

    afterEach(function() {
        return teardownDb();
    });

    after(function() {
        return closeServer();
    });

describe('GET endpoint', function() {
    it('should return entire comic reading list', function() {
        return chai.request(app)
            .get('/api/marvel')
            .then(function(res) {
                expect(res).to.be.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.lengthOf.at.least(1);
            });
        });
    });

describe('POST endpoint', function() {
    it('should add a new reading entry', function() {
    const newPost = {
        "title": "Iron Man (2018) #71",
        "read": "Read Later",
        "userName": "Stan Lee",
        "id": "5afbbad4202724320a0d4fa4"
    }
    
    return chai.request(app)
        .post('/api/marvel')
        .send(newPost)
        .then(function(res) {
            expect(res).to.be.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('title', 'read');
            expect(res.body.title).to.equal(newPost.title);
            expect(res.body.read).to.equal(newPost.read);
            expect(res.body.userName).to.equal(newPost.userName);
            return ReadingList.findById(res.body.id);
        })
// we retreive new post from the db & compare its data to the data we sent over
        .then(function(post) {
            expect(post.title).to.equal(newPost.title);
            expect(post.read).to.equal(newPost.read);
            expect(post.userName).to.equal(newPost.userName);
        });
    });
});

describe('PUT endpoint', function() {
    it('should update the fields user chooses', function() {
        const toUpdate = {
            read: 'Read Later'
        }

    return ReadingList
        .findOne()
        .then(post => {
            toUpdate._id = post._id;
        
        return chai.request(app)
            .put(`/api/marvel/${post._id}`)
            .send(toUpdate);
        }).then(res => {
            expect(res).to.have.status(204);
            return ReadingList.findById(toUpdate._id);
        })
// we retrieve the updated post from db and prove the post in db
// is equal to the updated values we sent over
        .then(post => {
            expect(toUpdate.read).to.equal(post.read);
        });
    });
});

describe('DELETE endpoint', function() {
    it('should delete a reading entry', function() {
        let entry;
        return ReadingList
            .findOne()
            .then(function(_entry) {
                entry=_entry;
                return chai.request(app)
                .delete(`/api/marvel/${entry._id}`)
            })
            .then(function(res) {
                expect(res).to.have.status(204);
                return ReadingList.findById(entry._id)
            })
            .then(function(_entry) {
                expect(_entry).to.be.null;
            });
    });
});
});