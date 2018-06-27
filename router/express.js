/*
    express.js
    -> express server setup
*/

// Import
const Express = require('express'), // Express
CookieParser = require('cookie-parser'), // Cookies
Session = require('express-session'),  // Sessions
BodyParser = require('body-parser'), // Handles form
FileUpload = require('express-fileupload'); // Handles files

module.exports = function webServer(configs) {
    const server = Express(); // Create Express server

    // Setup Express here
    server.use(Express.static('public/')) // Public folder
    server.set('view engine', 'ejs'); // Set engine to EJS

    // Set cookie parser
    server.use(CookieParser(configs.secret, {})); 
    
    // Set session parser
    const SessionOptions = {
        secret: configs.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {}
    };

    if(!configs.debug) {
        server.set('trust proxy', 1);
        SessionOptions.cookie.secure = true;
    }

    server.use(Session(SessionOptions));

    // Setup body parser
    server.use(BodyParser.urlencoded({extended: true}));
    server.use(BodyParser.json());

    // Setup file upload
    server.use(FileUpload());

    return server;
}