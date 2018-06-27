/*
    view.js
    -> Handle image viewing
*/

const router = require('express').Router();

module.exports = function viewRouter(server) {

    // Images default middleware
    router.use((req, res, next) => {
        req.options.page = "view";
        next();
    });

    // View post page
    router.get("/:pictureID", (req, res) => {
        server.database.posts.getPost(req.params.pictureID, (err, post) => {
            if(err) res.status(500).end();
            else {
                server.database.users.getByID(post.owner, (err, user) => {
                    if(err) res.status(500).end();
                    else {
                        req.options.post = post;
                        req.options.pageuser = user;
                        res.render("main", req.options);
                    }
                });
            }
        });
    });

    // Edit post page
    router.get("/:pictureID/edit", (req, res) => {

    });

    // Edit post request
    router.post("/:pictureID/edit", (req, res) => {

    });

    // Comment post request
    router.post("/:pictureID/comment", (req, res) => {

    });

    return router;
}