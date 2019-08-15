const fs = require('fs');
const path = require('path')

fs.readdirSync(__dirname).forEach((file) => {
    if (file === 'index.js') return;

    /* Store module with its name (from filename) */
    module.exports[path.basename(file, '.js')] = require(path.join(__dirname, file));
});