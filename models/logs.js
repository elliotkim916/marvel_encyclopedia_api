'use strict';

const mongoose = require('mongoose');

const readingListSchema = mongoose.Schema({
  title: { type: String },
  read: { type: String },
  imgUrl: { type: String },
  username: { type: String },
  resourceURI: { type: String },
  created: { type: Date },
});

readingListSchema.methods.serialize = function () {
  return {
    title: this.title,
    read: this.read,
    imgUrl: this.imgUrl,
    username: this.username,
    resourceURI: this.resourceURI,
    created: this.created,
    id: this._id,
  };
};

const ReadingList = mongoose.model('ReadingList', readingListSchema);

module.exports = { ReadingList };
