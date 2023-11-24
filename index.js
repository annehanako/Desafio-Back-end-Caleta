const express = require('express');
const bodyParser = require('body-parser');

const server = express();
server.get('/user', (req, res) => {
    return res.json({ user: 'API WORKING' })
});

server.listen(3000, () => {
    console.log("Server running on port 3000")
});

server.use(bodyParser.json());

// endpoints

let playerBalance = 1000; // player starting balance

//endpoint to get player's balance
server.get('/balance', (req, res) => {
    res.json({ balance: playerBalance });
});

// endpoint to bet 
server.post('/bet', (req, res) => {
    const { amount } = req.body;

    if (amount <= playerBalance){
        playerBalance -= amount;
        res.json ({ success: true, message: 'Your bet was sucessfully made.'});
    } else {
        res.status(400).json({ success: false, message:'Insuficient funds.'});
    }  
});