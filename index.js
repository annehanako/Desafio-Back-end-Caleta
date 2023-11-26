const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const db = require('./database.js');

db.InitDB();

server.use((req, res, next) => {
    bodyParser.json()(req, res, err => {
        if (err) {
            return res.sendStatus(400);
        }
        next();
    })
});

server.listen(3000, () => {
    console.log("Server running on port 3000")
});

async function getPlayer(playerId) {
    const player = await db.GetPlayerBalance(playerId);
    if (!player || player.length <= 0) {
        throw new Error(`Player with ID ${playerId} not found.`)
    }
    return player[0];
}

async function GetTransaction(txn, playerId, value) {
    const transaction = await db.GetTransaction(txn, playerId, value);
    if (!transaction || transaction.length <= 0) {
        throw new Error(`Transaction value not found:TransactionId ${txn}`)
    }
    return transaction[0];
}

function ValidateTransaction(playerId, value) {
    if (!playerId || isNaN(playerId))
        throw new Error(`Invalid format for PlayerId: ${playerId}`)
    if (!value || isNaN(value) || value <= 0)
        throw new Error(`Invalid format for Value: ${value}`)
}

server.post('/player', async (req, res) => {
    try {
        const balance = (req.body.balance);
        if (isNaN(balance))
            throw new Error("The balance value must be a positive number.");

        const player = await db.CreatePlayer(balance);
        console.log(player[0].id)
        res.json({ player: player.id, balance: balance });
    } catch (err) {
        res.json({ error: err.message })
    }
})

server.get('/balance/:playerId', async (req, res) => {
    try {
        const playerId = parseInt(req.params.playerId);

        if (isNaN(playerId))
            throw new Error("Input 'Id' is not a number;")

        let result = await getPlayer(playerId);

        if (result.length <= 0)
            throw new Error(`No results were found for the ID ${playerId}`)

        res.json({ player: result.id, balance: result.balance });
    } catch (err) {
        res.json({ error: err.message })
    }
});

server.post('/bet', async (req, res) => {
    try {
        const { playerId, value } = req.body;
        ValidateTransaction(playerId, value)

        let player = await getPlayer(playerId);
        const balance = player.balance;

        if (balance < value) {
            throw new Error("Insuficcient balance for the bet.");
        }

        const newBalance = balance - value;

        await db.UpdateCurrentBalance(playerId, newBalance)
        const txn = await db.RegisterTransaction(playerId, value);

        res.json({ player: player.id, balance: newBalance, txn: txn.id });
    } catch (error) {
        console.error("Error registering bet:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

server.post('/win', async (req, res) => {
    try {
        const isWin = 1;
        const { playerId, value } = req.body

        ValidateTransaction(playerId, value);

        let player = await getPlayer(playerId);
        const balance = player.balance;

        const newBalance = balance + value;

        await db.UpdateCurrentBalance(playerId, newBalance)
        const txn = await db.RegisterTransaction(playerId, value, isWin);

        res.json({ player: player.id, balance: newBalance, txn: txn.id });
    } catch (error) {
        console.error("Error adding funds to balance:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

// rollback endpoint
server.post('/rollback', async (req, res) => {
    try {
        const { playerId, value, txn } = req.body;

        ValidateTransaction(playerId, value)

        const player = await getPlayer(playerId);
        const currentBalance = player.balance;

        if (!txn || isNaN(txn)) {
            throw new Error(`Invalid transaction ID ${txn}`)
        }

        const transaction = await GetTransaction(txn, playerId, value);

        if (transaction.isCanceled == 1) {
            res.status(200).json({ code: 200, balance: currentBalance });
            return
        }
        if (transaction.isWin == 1) {
            res.status(200).json({ code: 'Invalid' });
            return
        }

        const newBalance = currentBalance + transaction.betValue;

        await db.UpdateCurrentBalance(playerId, newBalance);
        await db.SetRefundOption(txn);

        res.status(200).json({ code: 200, balance: newBalance });
    }
    catch (error) {
        console.error("Error processing refund.", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});
