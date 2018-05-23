'use strict';

// exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'https://upbeat-hamilton-aed8e5.netlify.com';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/marvel_encyclopedia';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test_marvel_encyclopedia';
exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET || 'marvel_encyclopedia_access_1004';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';