'use strict';

const mongoose = require('mongoose');

const readingListSchema = mongoose.Schema({
    title: {type: String},
    read: {type: String},
    imgUrl: {type: String},
    userName: {type: String},
    resourceURI: {type: String}
});

readingListSchema.methods.serialize = function() {
    return {
        title: this.title,
        read: this.read,
        imgUrl: this.imgUrl,
        userName: this.userName,
        resourceURI: this.resourceURI,
        id: this._id
    };
};

const ReadingList = mongoose.model('ReadingList', readingListSchema);

module.exports = {ReadingList};