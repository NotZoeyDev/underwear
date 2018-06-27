/*
    router.js
    -> Routing/express entrypoint
*/

const webServer = require('./express.js');

module.exports = function Router(server) {
    // Load Express
    server.webServer = webServer(server.configs);

    // Middleware that handles every request
    server.webServer.use((req, res, next) => {
        req.options = {
            name: server.configs.name, // Server name, loaded from config
            title: server.configs.name, // Default title name defaults to the server name

            page: "default", // Page to load
            form: "default", // Form to load
            user: null // Contain the user data, set to null by default
        };

        // If user is logged in/has cookie
        if(req.session.token || req.cookies.token) {
            // Get user info's
            server.database.users.getByUUID(req.session.token ? req.session.token : req.cookies.token, (err, user) => {
                if(err) { // UUID not found, remove the session and cookie
                    req.session.destroy();
                    res.clearCookie("token");
                } else { // Keep a copy of the user object
                    req.options.user = user;
                }
                next();
            });
        } else {
            next();
        }
    });

    // Load routes
    server.webServer.use("/users", require('./users.js')(server)); // Users as in login, register and delete
    server.webServer.use("/user", require('./user.js')(server)); // User as in profile, edit and deactivation
    server.webServer.use("/view", require('./view.js')(server)); // View as in view an image
    server.webServer.use("/imgs", require('./imgs.js')(server)); // Imgs as in handles request for viewing an image
    server.webServer.use("/", require('./main.js')(server)); // Main as in upload and others

    // Listen the server
    server.webServer.listen(server.configs.port, () => {
        console.log("Web server is ready.");
    });
}