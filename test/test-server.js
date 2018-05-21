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

const {ReadingList} = require('../models/logs');
const testData = require('../db/comics');

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
            .get(`/api/marvel/${TEST_USER.username}`)
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .then(function(res) {
                expect(res).to.be.status(200);
                expect(res).to.be.json;
                expect(res.body.data).to.be.a('array');
                expect(res.body.data).to.have.lengthOf.at.least(1);
            });
        });
    });

    let resReadingEntry;
    it('should return comic list with the right fields', function() {
        return chai.request(app)
            .get(`/api/marvel/${TEST_USER.username}`)
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .then(function(res) {
                expect(res).to.be.status(200);
                expect(res).to.be.json;
                expect(res.body.data).to.be.a('array');
                expect(res.body.data).to.have.lengthOf.at.least(1);

                res.body.data.forEach(function(post) {
                    expect(post).to.be.a('object');
                    expect(post).to.include.keys('read', 'title', 'imgUrl', 'resourceURI', 'username')
                });

            resReadingEntry = res.body.data[0];
            return ReadingList.findById(resReadingEntry._id);
            })

            .then(function(post) {
                expect(resReadingEntry.read).to.equal(post.read);
                expect(resReadingEntry.title).to.equal(post.title);
                expect(resReadingEntry.imgUrl).to.equal(post.imgUrl);
                expect(resReadingEntry.resourceURI).to.equal(post.resourceURI);
                expect(resReadingEntry.username).to.equal(post.username);
            });
    });

describe('POST endpoint', function() {
    it('should add a new reading entry', function() {
    const newPost = {
        "title": "Iron Man (2018) #71",
        "read": "Read Later",
        "username": "Stan Lee",
        "id": "5afbbad4202724320a0d4fa4",
        "imgUrl": "Comic Book Picture",
        "resourceURI": "Comic Book URI"
    }
    
    return chai.request(app)
        .post(`/api/marvel/${newPost.username}`)
        .set('Authorization', `Bearer ${USER_TOKEN}`)
        .send(newPost)
        .then(function(res) {
            expect(res).to.be.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('title', 'read', 'imgUrl', 'resourceURI', 'username');
            expect(res.body.title).to.equal(newPost.title);
            expect(res.body.read).to.equal(newPost.read);
            expect(res.body.imgUrl).to.equal(newPost.imgUrl);
            expect(res.body.resourceURI).to.equal(newPost.resourceURI);
            expect(res.body.username).to.equal(newPost.username);
            return ReadingList.findById(res.body.id);
        })
// we retreive new post from the db & compare its data to the data we sent over
        .then(function(post) {
            expect(post.title).to.equal(newPost.title);
            expect(post.read).to.equal(newPost.read);
            expect(post.imgUrl).to.equal(newPost.imgUrl);
            expect(post.resourceURI).to.equal(newPost.resourceURI);
            expect(post.username).to.equal(newPost.username);
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
            .set('Authorization', `Bearer ${USER_TOKEN}`)
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
                .set('Authorization', `Bearer ${USER_TOKEN}`)
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