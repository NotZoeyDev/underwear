/*
    users.js
    -> Handles users database request
*/

const Mongoose = require('mongoose'), ObjectId = Mongoose.Schema.Types.ObjectId, validator = require('validator'), bcrypt = require('bcrypt'), uuid = require('uuid/v4');

class UsersDatabase {
    constructor() {
        // Users Mongoose schema
        const userSchema = Mongoose.Schema({
            username: String, // Username
            password: String, // Hashed password
            email: String, // User's email
            token: {type:String, default:null}, // Token used for session/cookie
            
            // Profile informations
            banner: {type:String, default:null}, // Banner filename
            profile_pic: {type:String, default:null}, // Profile picture name
            bio: {type:String, default:null}, // User's bio
            location: {type:String, default:null}, // Location
            contacts: [{ // Contacts info of an user.
                name: String,
                info: String
            }],
            creationDate: {type:Date, default: new Date()},
            
            // Extra stuff
            enabled: {type: Boolean, default:true}, // Is the account enabled?
            verified: {type: Boolean, default:false}, // Is the account verified?
            role: {type: String, default:"user"}, // User's role, aka user, mod or admin

            // Arrays of info
            posts: [ObjectId], // Posts made by the user
            comments: [ObjectId], // Comments made by the user
            saved_posts: [ObjectId], // Posts saved by the user
            
            // Reports
            reports: [{
                by: ObjectId,
                text: String,
                when: Date
            }]
        });

        this.scheme = userSchema;

        this.loadQueries();

        this.user = Mongoose.model('user', userSchema);
    }

    loadQueries() {
        // Setup queries
        this.scheme.query.byUsername = function(username) {
            return this.where({ username: username }).limit(1);
        }

        this.scheme.query.byEmail = function(email) {
            return this.where({ email: email }).limit(1);
        };
    
        this.scheme.query.byUUID = function(uuid) {
            return this.where({ token: uuid }).limit(1);
        };
    
        this.scheme.query.byID = function(id) {
            return this.where({ _id: id }).limit(1);
        };
    }

    getByUUID(uuid, callback) {
        this.user.findOne().byUUID(uuid).exec((err, user) => {
            user 
                ? callback(null, user)
                : callback("user_notfound", null);
        });
    }

    getByUsername(username, callback) {
        this.user.findOne().byUsername(username).exec((err, user) => {
            user 
                ? callback(null, user)
                : callback("user_notfound", null);
        });
    }

    getByEmail(email, callback) {
        this.user.findOne().byEmail(email).exec((err, user) => {
            user 
                ? callback(null, user)
                : callback("user_notfound", null);
        });
    }

    getByID(id, callback) {
        this.user.findOne().byID(id).exec((err, user) => {
            user 
                ? callback(null, user)
                : callback("user_notfound", null);
        });
    }

    addUser(username, password, email, callback) {
        // Check the lengths of the username, password and email
        if(username.length > 64) {
            callback("username_long", null);
            return;
        } else if(username.length < 4) {
            callback("username_short", null)
            return;
        }

        if(password.length >= 64) {
            callback("password_long", null);
            return;
        } else if(password.length < 8) {
            callback("password_short", null)
            return;
        }

        if(email.length >= 100) {
            callback("email_long", null);
            return;
        }

        this.getByUsername(username, (err, user) => {
            if(!err) {
                this.getByEmail(email, (err, user) => {
                    if(!err) {
                        if(validator.isEmail(email)) {
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(password, salt, (err, hash) => {
                                    let newUser = new this.user({
                                        username: username,
                                        password: hash,
                                        email: email
                                    });

                                    newUser.save((err, createdUser) => {
                                        if(!err) {
                                            console.info(`${createdUser.username} account created!`);

                                            callback(null, createdUser);
                                        } else {
                                            callback("creation_error", null);
                                        }
                                    });
                                });
                            });
                        } else {
                            callback("email_invalid", null);
                        }
                    } else {
                        callback("email_used", null);
                    }
                });
            } else {
                callback("username_used", null);
            }
        });
    }

    loginUser(username, password, callback) {
        this.getByUsername(username, (err, user) => {
            if(user) {
                bcrypt.compare(password, user.password, (err, same) => {
                    if(same) {
                        let getUUID = () => {
                            const UUID = uuid(); // Get an UUID
                            // We check if it's not used
                            this.getByUUID(UUID, (err, user) =>  {
                                if(user) { // If it's used, get a new UUID
                                    getUUID();
                                } else { // Set the UUID and return it
                                    this.getByUsername(username, (err, user) => {
                                        if(user) {
                                            user.token = UUID; // Set the token
                                            // Save the user
                                            user.save((err, savedUser) => {
                                                if(err) {
                                                    callback("error", null);
                                                } else {
                                                    callback(null, UUID);
                                                }
                                            });
                                        } else {
                                            callback("error", null);
                                        }
                                    });
                                }
                            });
                        }

                        getUUID();
                    } else {
                        callback("user_notfound", null);
                    }
                })
            } else {
                callback("user_notfound", null);
            }
        });
    }

    disconnectUser(id, callback) {
        // Check if the user exists
        this.getByID(id, (err, user) => {
            if(user) {
                user.token = null; // Set the token to null

                // Save the user
                user.save((err, updatedUser) => {
                    if(err) {
                        callback("error");
                    } else {
                        callback(null);
                    }
                });
            } else {
                callback("user_notfound");
            }
        });
    }
}

module.exports = new UsersDatabase();

/*
module.exports = function UsersDatabase() {
    // Delete an user
    this.deleteUser = function(username, password, callback) {
        // Check if the user exists
        User.findOne().byUsername(username).exec((err, user) => {
            if(user) {
                // Check if the password match
                bcrypt.compare(password, user.password, (err, res) => {
                    if(res) {
                        // Delete the account
                        User.deleteOne({_id: user.id}, (err) => {
                            if(err) {
                                callback("delete_error");
                            } else {
                                callback("delete_success");
                            }
                        });
                    } else {
                        callback("password_wrong");
                    }
                });
            } else {
                callback("user_notfound");
            }
        });
    }

    // Deactive account
    this.disableUser = function(username, callback) {
        User.findOne().byUsername(username).exec((err, user) => {
            if(user) {
                user.enabled = false;

                user.save((err, updatedUser) => {
                    callback(null);
                });
            } else {
                callback("user_notfound");
            }
        });
    }

    this.deleteEveryone = function() {
        //User.deleteMany({}, (err) => {});
    }
}*/