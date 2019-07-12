const dotenv = require('dotenv');
const fs = require('fs-extra');

dotenv.config();

fs.writeJsonSync('./apidoc.json', {
    "name": "karshenasi Api",
    "version": "0.1.0",
    "description": "",
    "title": "karshenasi Api",
    "url": process.env.APP_URL,
});
