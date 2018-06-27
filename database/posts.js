/*
    posts.js
    -> Posts and shit on the database
*/

const Mongoose = require('mongoose'), ObjectId = Mongoose.Schema.Types.ObjectId, validator = require('validator');

module.exports = new class PostsDatabase {
    constructor() {
        // Post Schema
        const postsSchema = new Mongoose.Schema({
            // Generic file info
            title: String, // Title of the post
            description: {type: String, default: ""}, // Image description
            filename: {type: String, default: null}, // Filename in the uploads folder
            original: {type: Boolean, default: false}, // Is the art original content
            artist: {type: String, default: "unknown"}, // Image artist
            source: {type: String, default: "unknown"}, // Image source 

            // Extra stuff
            parent: {type: ObjectId, default: null}, // If it belongs to an album, set his parent to the object ID of the album
            tags: [String], // Tags, array of string obviously

            // Other stuff
            owner: ObjectId, // Id of the poster
            uploaded: {type: Date, default: new Date()}, // Upload date
        });

        // Albums schema
        const albumSchema = new Mongoose.Schema({
            title: String, // Title of the album
            description: String, // Description of the album
            tags: [String], // Tags for the album
            posts: [{
                post: ObjectId, // Id of the post
                index: Number // Index in the album
            }] // IDs of the posts inside 
        });

        this.posts = postsSchema;
        this.loadQueries();

        this.post = Mongoose.model('post', postsSchema);
        this.album = Mongoose.model('album', albumSchema);
    }

    loadQueries() {
        this.posts.query.byID = function(id) {
            return this.where({_id: id}).limit(1);
        };

        this.posts.query.byOwner = function(ownerID) {
            return this.where({owner: ownerID});
        };

        this.posts.query.byTag = function(tag, page) {
            return this.where('tags').in(tag).limit(30).skip((page - 1) * 30);
        };
    }

    handleTags(tags) {
        const tagsArray = tags.split(";");
        // Loop through the array
        for(let t in tagsArray) {
            let tag = tagsArray[t];

            // Remove "empty" tag
            if(tag.trim() == "" || tag.trim().length == 0) {
                tagsArray.splice(t, 1);
            } else { // trim/clean the tag
                tagsArray[t] = tag.trim().toLowerCase();
            }
        }
        // Return the "cleaned up" array
        return tagsArray;
    }

    getTags(callback) {
        this.post.find({}).exec((err, posts) => {
            const tagsArray = [];

            for(post of posts) {
                for(tag of post.tags) {
                    if(!tagsArray.includes(tag)) {
                        tagsArray.push(tag);
                    }
                }
            }

            callback(tagsArray.sort());
        });
    }

    getPostsViaTag(tag, page, callback) {
        this.post.find().byTag(tag, page).exec((err, posts) => {
            if(err) callback(null);
            else {
                posts.legnth > 0 
                    ? callback(posts)
                    : callback(null);
            }
        });
    };

    getPosts(page, callback) {
        this.post.find({}).limit(50).skip((page - 1) * 30).exec((err, posts) => {
            if(err) callback("error", null);
            else {
                posts.length > 0 
                    ? callback(null, posts)
                    : callback("error", null);
            }
        });
    }

    getPost(id, callback) {
        this.post.findOne().byID(id).exec((err, post) => {
            if(err) callback("server_error", null);
            else {
                post
                    ? callback(null, post)
                    : callback("post_notfound", null);
            }
        });
    }

    createPost(title, description, original, artist, source, tags, owner, callback) {
        // Do we have a title
        if(!title) {
            callback("title_undefined", null);
            return;
        }

        // Do we have a description
        if(!description) {
            callback("description_undefined", null);
            return;
        }

        // If it's original, set the source to null
        if(original) {
            source = null;
            artist = owner.username;
        } else { // Do other things if not original
            // Do we have an artist
            if(!artist) {
                callback("artist_undefined", null);
                return;
            }

            // If it's not original, make sure we have a source
            if(!source) {
                callback("source_undefined", null);
                return;
            }

            // Make sure the source is a valid url
            if(!validator.isURL(source)) {
                callback("source_invalid", null);
                return;
            }
        }

        // We need an owner
        if(!owner) {
            callback("owner_undefined", null);
            return;
        }

        // Make sure we have tags
        if(!tags) {
            callback("tags_undefined", null);
            return;
        }

        // Clean up the tags
        tags = this.handleTags(tags);
        
        // Make sure we have tags
        if(tags.length > 0) {
            // Create the new post
            const createdPost = new this.post({
                title: title,
                description: description,

                original: original,
                artist: artist,
                source: source,

                tags: tags,
                owner: owner.id
            });

            // Save it to the database
            createdPost.save((err, savedPost) => {
                if(err) {
                    callback("save_error", null);
                } else {
                    callback(null, savedPost);
                }
            });
        } else {
            callback("tags_undefined", null);
        }
    }
}