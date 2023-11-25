const express = require('express');
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.json());

server.listen(3000, () => {
    console.log("Server running on port 3000")
});

let playerList = [{playerId: 10, balance: 45}]; // player list mock

// endpoints
server.get('/user', (_, res) => {
    return res.json({ user: 'API WORKING' })
});

//endpoint to get player's balance
server.get('/balance/:playerId', (req, res) => {
    const playerId = parseInt(req.params.playerId);
    const balance = playerList.find(player => player.playerId === playerId).balance
    res.json({ player: playerId, balance: balance});
});

// endpoint to bet 
server.post('/bet/:playerId', (req, res) => {
    const { player, value } = req.body;

    if (value <= playerList[player]){
        playerList[player] -= value;
        res.json ({ player: player, balance: playerList[player], txn: generateTransactionId()});
    } else {
        res.status(400).json({ success: false, message:'Insuficient funds.'});
    }  
});

// endpoint to add funds to the player balance

server.post('/win', (req, res) =>{
    const { player, value } = req.body;

    playerList[player] = (playerList[player] || 0) + value;
    res.json ({player: player, balance: playerList[player], txn: generateTransactionId() });
});

// rollback endpoint 

server.post('/rollback', (req, res) => {
    const { player, txn, value } = req.body;

    if (playerList[player] && txnExists(player, txn) && isBetTransaction(txn)) {
        playerList[player] += value;
        res.json({ code: 'OK', balance: playerBalances[player] });
    } else {
        res.json({ code: 'Invalid' });
    }
});