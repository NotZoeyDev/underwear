/*
    comments.js
    -> handle comments on the database
*/

const Mongoose = require('mongoose'), ObjectId = Mongoose.Schema.Types.ObjectId;

module.exports = function CommentsDatabase() {
    const CommentSchema = new Mongoose.Schema({
        text: String, // Raw text of the comment
        author: ObjectId, // ObjectID of the poster
        parent: ObjectId, // ObjectID of the post it belongs to
        creationDate: {type: Date, default: new Date()} // Comment date
    });

    const Comment = Mongoose.model("comment", CommentSchema);
}