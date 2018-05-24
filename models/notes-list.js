'use strict';

const mongoose = require('mongoose');

const notesListSchema = mongoose.Schema({
    title: {type: String},
    note: {type: String},
    username: {type: String}
});

notesListSchema.methods.serialize = function() {
    return {
        title: this.title,
        note: this.note,
        id: this._id,
        username: this.username
    };
};

const NotesList = mongoose.model('NotesList', notesListSchema);

module.exports = {NotesList};