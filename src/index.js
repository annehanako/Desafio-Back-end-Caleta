const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const db = require('./database.js');
const router = require('./routes.js')
const swagger = require('swagger-ui-express');

const swaggerDoc = require('./swagger.json')

server.use('/docs', swagger.serve, swagger.setup(swaggerDoc));

db.InitDB();

server.use((req, res, next) => {
    bodyParser.json()(req, res, err => {
        if (err) {
            return res.sendStatus(400);
        }
        next();
    })
});

server.use(router);

server.listen(3000, () => {
    console.log("Server running on port 3000")
});

