# Underwear (Work-in-progress)
A modern imageboard website, fully open-source and free to use.
The code is messy, not final and is going to change a lot during development.

## Built using
* Node.JS
* Express.JS
* EJS
* MongoDB
* Mongoose

## How to run locally
A config.js needs to be added at the root of the web server.
Here's the template file:
```javascript
module.exports = {
    port: 3000, // Web server port
    debug: true, // Debug/Testing mode
    secret: "", // Secret key used by Session and Cookies
    database: "", // Database name

    name: "", // Website Name
    version: "" // Version as a string
}
```

Save it as `config.js` and the server should now work.
Make sure to be running a MongoDB instance before running the Express server.