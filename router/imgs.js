/*
    imgs.js
    -> Router for images loading
*/

const router = require('express').Router(), fs = require('fs');

module.exports = function imgsRouter(server) {
    
    // Handles everything
    router.get("/:category/:folderID/:filename", (req, res) => {
        const params = req.params;

        if(params.category == "albums" || params.category == "images" || params.category == "users") {
            // Check if the file exists
            const filePath = `${process.cwd()}/uploads/${params.category}/${params.folderID}/${params.filename}`;
            if(fs.existsSync(filePath)) {
                res.sendFile(filePath);
            } else {
                res.status(404).end();
            }
        } else {
            res.status(404).end();
        }
    });

    return router;
}