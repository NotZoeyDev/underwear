/*
    database.js
    -> Database entrypoint
*/

const mongoose = require('mongoose');

class Database {
    constructor(server) {
        mongoose.connect(`mongodb://localhost/${server.configs.database}${server.configs.debug ? "_dev" : ""}`);
        let database = mongoose.connection;

        database.on('error', () => {
            console.error("An error happened while connection to the database.");
        });

        database.on('open', () => {
            console.log("Connected to the database.");
        });

        this.users = require('./users');
        this.posts = require('./posts.js');
        this.comments = new (require('./comments.js'))();
    }
}

module.exports = (server) => new Database(server);