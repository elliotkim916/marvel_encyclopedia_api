'use strict';

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const bodyParser = require('body-parser');
const router = express.Router();

const localAuth = passport.authenticate('local', {session: false});
// localStrategy needs to use bodyParser to extract username and password info from request body
router.use(bodyParser.json());

const createAuthToken = user => {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

// when the user provides a valid username & password, we create a JWT
// the token is then sent back to the user, who can store it and use it
// to authenticate for subsequent API requests
router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user.serialize());
  res.json({authToken});
});

const jwtAuth = passport.authenticate('jwt', {session: false});

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

module.exports = {router};