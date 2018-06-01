'use strict';

const mongoose = require('mongoose');
const {User} = require('../users/models');

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const createAccountCredentials = { 
  'username': 'stanlee01', 
  'password': 'imademarvel'
};

function tearDownDb() {
  return mongoose.connection.db.dropDatabase();
}

describe('Create Account, Login, & Check Token', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return User.create(createAccountCredentials);
  });

  afterEach(function() {
    return tearDownDb();
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

  let authToken;
  describe('/POST Log in to account', function() {
    it('should log in and receive authToken', function() {
      chai.request(app)
        .post('/api/auth/login')
        .send(createAccountCredentials)
        .then((err, res) => {
          expect(res).to.be.status(200);
          expect(res.body.state).to.be.true;
          expect(res.body.data).to.be.a('object');
        });
    });
  });

  describe('/GET Access and use protected page', function() {
    it('should have access to protected page', function() {
      chai.request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${authToken}`)
        .then((err, res) => {
          expect(res).to.be.status(200);
          expect(res.body.state).to.be.true;
          expect(res.body.data).to.be.a('object');
        });
    });
  });

  describe('/POST To request new JWT', function() {
    it('should give a new JWT with a later expiry date', function() {
      chai.request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .then((err, res) => {
          expect(res).to.be.status(200);
          expect(res.body.state).to.be.true;
          expect(res.body.data).to.be.a('object');
        });
    });
  });
});