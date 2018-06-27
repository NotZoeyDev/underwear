/*
    users.js
    -> Users actions
*/

const router = require('express').Router();

module.exports = function usersRouter(server) {

    // Users default middleware
    router.use((req, res, next) => {
        req.options.page = "form";
        next();
    });

    // Login page
    router.get("/login", (req, res) => {
        req.options.form = "login";
        req.options.action = "users/"+ req.options.form;
        res.render("main", req.options);
    });

    // Login via post
    router.post("/login", (req, res) => {
        req.options.form = "login";
        req.options.action = "users/"+ req.options.form;

        if(req.body.username && req.body.password) {
            server.database.users.loginUser(req.body.username, req.body.password, (err, token) => {
                if(err) {
                    req.options.message = err;
                    res.render("main", req.options);
                } else { // Log the user in
                    // Use cookie
                    if(req.body.check) {
                        res.cookie('token', token);
                    } else { // Use session
                        req.session.token = token;
                    }
                    res.redirect("/");
                }
            });
        } else {
            req.options.message = "Please try again.";
            res.render("main", req.options);
        }
    });

    // Register page
    router.get("/register", (req, res) => {
        req.options.form = "register";
        req.options.action = "users/"+ req.options.form;
        res.render("main", req.options);
    });

    // Register via post
    router.post("/register", (req, res) => {
        req.options.form = "register";
        req.options.action = "users/"+ req.options.form;

        // Make sure the required paramaters are there
        if(req.body.username && req.body.email && req.body.password) {
            server.Database.Users.addUser(req.body.username, req.body.password, req.body.email, (err, user) => {
                if(err) {
                    req.options.message = err;
                } else {
                    req.options.message = "Account created succesfully!";
                }
                res.render("main", req.options);
            });
        } else {
            req.options.message = "Please try again.";
            res.render("main", req.options);
        }
    });

    // Logout
    router.get("/logout", (req, res) => {
        req.session.destroy();
        res.clearCookie("token");
        res.redirect("/");
    })

    return router;
}