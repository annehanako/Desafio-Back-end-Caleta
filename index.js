const express = require('express');
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.json());

server.listen(3000, () => {
    console.log("Server running on port 3000")
});

let playerList = [{ playerId: 10, balance: 45 }]; // player list mock

function getPlayer(playerId) {
    return playerList.find(player => player.playerId === playerId)
}

// function to validate if the values are numbers
function validateIfIsNumber(value) {
    return !isNaN(value)
}

// endpoints]

server.get('/user', (_, res) => {
    return res.json({ user: 'API WORKING' })
});

//endpoint to get player's balance
server.get('/balance/:playerId', (req, res) => {
    const playerId = parseInt(req.params.playerId);
    const balance = getPlayer(playerId).balance;

    if (!validateIfIsNumber(playerId)) {
        res.status(400).json({ error: "Input is not a number." })
        return;
    }

    res.json({ player: playerId, balance: balance });
});

// endpoint to bet 
server.post('/bet', (req, res) => {
    const { playerId, value } = req.body;
    const betValue = parseInt(value);
    const player = getPlayer(playerId);

    if (!validateIfIsNumber(playerId) || !validateIfIsNumber(value)) {
        res.status(400).json({ error: "Input is not a number." })
    } else if (betValue <= 0) {
        res.status(400).json({ success: false, message: 'Bet value must be a positive number.' });
    } else if (betValue <= player.balance) {
        player.balance -= betValue;
        res.json({ player: player.playerId, balance: player.balance, txn: Math.floor(Math.random() * 10) });
    } else {
        res.status(400).json({ success: false, message: 'Insuficient funds.' });
    }
}
);

// endpoint to add funds to the player balance

server.post('/win', (req, res) => {
    const { playerId, value } = req.body;
    const winValue = parseInt(value)

    if (!validateIfIsNumber(playerId) || !validateIfIsNumber(value)) {
        res.status(400).json({ error: "Input is not a number." })
    } else if (winValue <= 0) {
        res.status(400).json({ success: false, message: 'Invalid value.' });
    }
    const player = getPlayer(playerId);

    player.balance += winValue;
    res.json({ player: player.playerId, balance: player.balance, txn: Math.floor(Math.random() * 10) });
});

// rollback endpoint 

server.post('/rollback', (req, res) => {
    const { playerId, txn, value } = req.body;
    const player = getPlayer(playerId);

    if (playerList[player] && txnExists(player, txn) && isBetTransaction(txn)) {
        playerList[player] += value;
        res.json({ code: 'OK', balance: playerBalances[player] });
    } else {
        res.json({ code: 'Invalid' });
    }
});