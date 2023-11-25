const express = require('express');
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.json());

server.listen(3000, () => {
    console.log("Server running on port 3000")
});

let playerBalance = 5; // player starting balance

// endpoints
//endpoint to get player's balance

server.get('/user', (req, res) => {
    return res.json({ user: 'API WORKING' })
});

server.get('/balance/:playerId', (req, res) => {
    const playerId = req.params.playerId;
    const balance = playerBalance[playerId] || 0;
    res.json({ player: playerId, balance: balance});
});

// endpoint to bet 
server.post('/bet/:playerId', (req, res) => {
    const { player, value } = req.body;

    if (value <= playerBalance[player]){
        playerBalance[player] -= value;
        res.json ({ player: player, balance: playerBalance[player], txn: generateTransactionId()});
    } else {
        res.status(400).json({ success: false, message:'Insuficient funds.'});
    }  
});

// endpoint to add funds to the player balance

server.post('/win', (req, res) =>{
    const { player, value } = req.body;

    playerBalance[player] = (playerBalance[player] || 0) + value;
    res.json ({player: player, balance: playerBalances[player], txn: generateTransactionId() });
});

// rollback endpoint 

server.post('/rollback', (req, res) => {
    const { player, txn, value } = req.body;

    if (playerBalances[player] && txnExists(player, txn) && isBetTransaction(txn)) {
        playerBalances[player] += value;
        res.json({ code: 'OK', balance: playerBalances[player] });
    } else {
        res.json({ code: 'Invalid' });
    }
});