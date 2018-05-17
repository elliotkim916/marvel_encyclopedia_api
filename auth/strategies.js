'use strict';

const {Strategy: LocalStrategy} = require('passport-local');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');

const {User} = require('../users/models');
const {JWT_SECRET} = require('../config');

const localStrategy = new LocalStrategy(function(username, password, callback) {
    console.log(username, password, callback);
    let user;
    User.findOne({ username: username })
        .then(_user => {
            user =  _user;
            if (!user) {
                console.log(user);
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                });
            }
            console.log(user);
            return user.validatePassword(password);
        })
        .then(isValid => {
            if (!isValid) {
                console.log(isValid);
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                });
            }
            console.log(isValid);
            return callback(null, user);
        })
        .catch(err => {
            console.log(err);
            if (err.reason === 'LoginError') {
                return callback(null, false, err);
            }
            return callback(err, false);
        });
});

const jwtStrategy = new JwtStrategy({
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256']
},
(payload, done) => {
    done(null, payload.user)
});

module.exports = {localStrategy, jwtStrategy};