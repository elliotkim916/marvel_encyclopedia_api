'use strict';

const mongoose = require('mongoose');
const {User} = require('../users/models');

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const createAccountCredentials = {
    "username": "stanlee01",
    "password": "imademarvel"
}

describe('Create Account, Login, & Check Token', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    after(function() {
        return closeServer();
    });

describe('/POST Create Account', function() {
    it('should create a new account', function() {
        chai.request(app)
        .post('/api/users')
        .send(createAccountCredentials)
        .then((err, res) => {
            expect(res).to.be.status(201);
            expect(res.body.state).to.be.true;
        });
    });
});

});