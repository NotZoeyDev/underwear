/*
    server.js
    -> Underwear main entrypoint
*/

// Create the server
new class Server {
    // Load the component we need
    constructor() {
        // Load the configs
        this.configs = require('./config.js');
        
        // Load the database
        this.database = require('./database/database')(this);

        // Load the router
        require('./router/router.js')(this);
    }
}