/*
    user.js
    -> User viewing
*/

const router = require('express').Router();

module.exports = function userRouter(server) {
    // Users default middleware
    router.use((req, res, next) => {
        req.options.page = "user";
        req.options.mode = "view";

        next();
    });

    // Username middleware
    let usernameMiddle = (req, res, next) => {
        server.database.users.getByUsername(req.params.username, (err, user) => {
            if (err) {
                req.options.pageuser = null;
                res.redirect("/");
            } else {
                req.options.pageuser = user;
                next();
            }
        });
    }

    // User page
    router.get("/:username", usernameMiddle, (req, res) => {
        res.render("main", req.options);
    });

    // Edit page
    router.get("/:username/edit", usernameMiddle, (req, res) => {
        if (req.options.user) { // Check if we're logged in
            if (req.options.pageuser.id == req.options.user.id) { // Is this the user's page?
                req.options.mode = "edit";
                res.render("main", req.options);
            } else { // Nope, return to the main user's page
                res.redirect(`/user/${req.params.username}`);
            }
        } else {
            res.redirect(`/user/${req.params.username}`);
        }
    });

    // Edit post request
    router.post("/:username/edit", usernameMiddle, (req, res) => {
        if (req.options.user) {
            if (req.options.pageuser.id == req.options.user.id) {
                // Do database update here lmao
            } else {
                res.status(401).end();
            }
        } else {
            res.status(401).end();
        }
    });

    // Delete page
    router.get("/:username/delete", usernameMiddle, (req, res) => {
        if (req.options.user) { // Check if we're logged in
            if (req.options.pageuser.id == req.options.user.id) { // Is this the user's page?
                req.options.mode = "delete";
                res.render("main", req.options);
            } else { // Nope, return to the main user's page
                res.redirect(`/user/${req.params.username}`);
            }
        } else {
            res.redirect(`/user/${req.params.username}`);
        }
    });

    return router;
};