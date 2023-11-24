const express = require ('express');
const bodyParser = require ('body-parser');

const server = express ();
server.get('/usuario', (req, res) => {
    return res.json ({usuario: 'Api funcionando!'})
});

server.listen (3000, () => {
    console.log ("Server running on port 3000")
});

server.use (bodyParser.json());

// endpoints abaixo