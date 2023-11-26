const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const db = require('./Database.js');

db.InitDB();

server.use(bodyParser.json());

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

        if (isNaN(playerId) || isNaN(value)) {
            throw new Error("Input is not a number;")
        }

        if (value <= 0) {
            throw new Error("The bet value must be a positive number.");
        }

        let player = await getPlayer(playerId);
        const balance = player.balance;

        if (balance < value) {
            throw new Error("Insuficcient balance for the bet.");
        }
        const newBalance = balance - value;
        await db.UpdateCurrentBalance(playerId, newBalance)



        await db.RegisterBet(playerId, value, newBalance);
        res.json({ success: true, message: "Bet registered succesfully!" });

    } catch (error) {
        console.error("Error registering bet:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

server.post('/win', async (req, res) => {
    try {
        const { playerId, value } = req.body

        if (isNaN(playerId) || isNaN(value)) {
            throw new Error("Input is not a number;")
        }
        if (value <= 0) {
            throw new Error("The value must be a positive number.");

        } let player = await getPlayer(playerId);
        const balance = player.balance;

        const newBalance = balance + value;
        await db.UpdateCurrentBalance(playerId, newBalance)

        await db.RegisterBet(playerId, value, newBalance);
        res.json({ success: true, message: "Funds added to balance succesfully!" });

    } catch (error) {
        console.error("Error adding funds to balance:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

// rollback endpoint
server.post('/rollback', async (req, res) => {
    try {
        const { playerId, value, txn } = req.body;

        if (!value || isNaN(value)) {
            throw new Error(`Invalid refund value ${value}`)
        }

        if (!playerId || isNaN(playerId)) {
            throw new Error(`Invalid player ID ${playerId}`)
        }

        const player = await getPlayer(playerId);

        if (!player || player.length == 0) {
            throw new Error(`Player with ID ${playerId} not found.`)
        }
        if (!txn || isNaN(txn)) {
            throw new Error(`Invalid transaction ID ${txn}`)
        }
        const transaction = await GetTransaction(txn, playerId, value);
        if (!transaction || transaction.length <= 0) {
            throw new Error(`Transaction not found for the values:${txn, playerId, value}`)
        }
        if (transaction.isCanceled == 1){
            throw new Error (`Transaction already cancelled.`)
        }
        const currentBalance = player.balance;

        const newBalance = currentBalance + transaction.betValue;

        await db.UpdateCurrentBalance(playerId, newBalance);
        await db.SetRefundOption(txn);

        res.json({ success: true, message: "Refund processed succesfully." });
    }
    catch (error) {
        console.error("Error processing refund.", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});
