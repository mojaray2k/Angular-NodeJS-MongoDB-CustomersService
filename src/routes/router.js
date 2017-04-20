const   fs      = require('fs'),
        path    = require('path'),
        express = require('express');

class Router {

    constructor() {
        this.startFolder = null;
    }

    //Called once during initial server startup
    load(app, folderName) {

        if (!this.startFolder) this.startFolder = path.basename(folderName);

        /**
         * The readdirSync function is a synchronous call to the server meaning the page won't load u
         * ntil allthe routs are loaded
         */
        fs.readdirSync(folderName).forEach((file) => {
            // Combine the folder name and the file name
            const fullName = path.join(folderName, file);

            /**
             * Taken from Stack Overflow:
             *  http://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
             * lstatSync tells you both whether something exists, 
             * and if so, whether it's a file or a directory (or 
             * in some file systems, a symbolic link, block device, 
             * character device, etc.), e.g. if you need to know 
             * if it exists and is a directory for example
             * var fs = require('fs');
                try {
                    // Query the entry
                    stats = fs.lstatSync('/the/path');

                    // Is it a directory?
                    if (stats.isDirectory()) {
                        // Yes it is
                    }

                    // Is it a file?
                    if (stats.isFile()) {
                        // Yes it is
                    }
                }
                catch (e) {
                    // ...
                }
             */
            const stat = fs.lstatSync(fullName);

            if (stat.isDirectory()) {
                //Recursively walk-through folders
                this.load(app, fullName);
            } else if (file.toLowerCase().indexOf('.js')) {
                //Grab path to JavaScript file and use it to construct the route
                let dirs = path.dirname(fullName).split(path.sep);
                /**
                 * Perform string manipulation on the combined folder and file sequences to 
                 * make them lowercase
                 */
                if (dirs[0].toLowerCase() === this.startFolder.toLowerCase()) {
                    dirs.splice(0, 1);
                }

                const router = express.Router();
                //Generate the route
                const baseRoute = '/' + dirs.join('/');
                console.log('Created route: ' + baseRoute + ' for ' + fullName);

                //Load the JavaScript file ("controller") and pass the router to it
                const controllerClass = require('../' + fullName);
                const controller = new controllerClass(router);
                //Associate the route with the router
                app.use(baseRoute, router);
            }
        });
    }

}

module.exports = new Router();






