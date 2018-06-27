/*
    main.js
    -> Main routing
*/

const router = require('express').Router(), fs = require('fs'), path = require('path');

module.exports = function mainRouter(server) {
    
    // Upload page
    router.get("/upload", (req, res) => {
        if(req.options.user) {
            req.options.page = "form";
            req.options.form = "upload";
            req.options.action = "upload"
            res.render("main", req.options);
        } else {
            res.redirect("/");
        }
    });

    // Upload post request
    router.post("/upload", (req, res) => {
        // Make sure we're logged in
        if(req.options.user) {
            const requestBody = req.body;

            // The checkbox returns "on" when send via a form, we change it to "true" if required.
            if(requestBody.original == "on") requestBody.original = true;

            // Check if we have everything we need
            if(requestBody.title && requestBody.desc && requestBody.tags && req.files) {
                // Check if we have the artist and source if it's not original content
                if(!requestBody.original) {
                    if(!requestBody.artist && !requestBody.source) {
                        res.status(400).end();
                        return;
                    }
                }
                
                // Create the post
                server.database.posts.createPost(requestBody.title, requestBody.desc, requestBody.original, requestBody.artist, requestBody.source, requestBody.tags, req.options.user, (err, createdPost) => {
                    if(err) res.status(500).end();
                    else {
                        // Create the dir for the post
                        const folderPath = `${process.cwd()}/uploads/images/${createdPost._id}/`;
                        const filename = `${createdPost._id}${path.extname(req.files.file.name)}`;
                        
                        fs.mkdir(folderPath, (err) => {
                            if(err) res.status(500).end();

                            req.files.file.mv(`${folderPath}/${filename}`, (err) => {
                                if(err) res.status(500).end();
                                else {
                                    createdPost.filename = filename;

                                    createdPost.save((err, savedPost) => {
                                        if(err) res.status(500).end();
                                        else {
                                            res.redirect(`/view/${savedPost._id}`);
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            } else {
                res.status(400).end();
            }
        } else {
            res.status(401).end();
        }

    });

    router.get("/about-us", (req, res) => {

    });

    // Setup main route
    router.get("/", (req, res) => {
        req.options.page = "index";

        server.database.posts.getPosts(1, (err, posts) => {
            if(err) res.status(500).end();
            else {
                req.options.posts = posts;
                res.render("main", req.options);
            }
        });
    });
    
    // Setup 404 route
    router.get("*", (req, res) => {
        res.status(404).end();
    });

    return router;
}