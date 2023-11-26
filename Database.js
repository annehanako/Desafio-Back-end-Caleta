const sqlite = require('sqlite3');
const fs = require('fs');
const dbFilePath = './database.sqlite';
const dbCreated = fs.existsSync(dbFilePath);

let database = null;

function InitDB() {
    if (!dbCreated) {
        fs.openSync(dbFilePath, 'w');
    }

    database = new sqlite.Database(dbFilePath);

    if (!dbCreated) {
        database.run(`
        CREATE TABLE Player (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            balance REAL
        );
        `);

        database.run(`
            CREATE TABLE BetTransactions(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playerId INTEGER,
                betValue real,
                isCanceled bool default 0 not null,
                isWin bool default 0 not null,
                FOREIGN KEY (playerId) REFERENCES Player(id)
        );`)
    }
}

async function RunQuery(query, params) {
    return new Promise((resolve, reject) => {
        database.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}

async function GetCreatedId() {
    let queryLastId = 'SELECT last_insert_rowid() as id'
    let result = await RunQuery(queryLastId);
    return result[0];
}

async function GetPlayerBalance(playerId) {
    try {
        let query = `SELECT * FROM Player where id = ?`;

        return RunQuery(query, playerId)
    }
    catch (err) {
        throw new Error(`Error querying database:${err.message} `)
    }
}

async function GetTransaction(txn, playerId, value) {
    try {
        let query = `SELECT * FROM BetTransactions where id = ? AND PlayerId = ? AND betValue = ?`

        return RunQuery(query, [txn, playerId, value]);
    }
    catch (err) {
        throw new Error(`Error querying database:${err.message}`)
    }
}

async function RegisterTransaction(playerId, betValue, isWin = 0) {
    try {
        let query = `INSERT INTO BetTransactions (playerId, betValue, isWin) VALUES (?, ?, ?);`;
        RunQuery(query, [playerId, betValue, isWin]);
        return GetCreatedId();
    }
    catch (err) {
        throw new Error(`Error querying database:${err.message}`)
    }
}

async function UpdateCurrentBalance(playerId, newBalance) {
    try {
        let query = `UPDATE Player SET balance = ? WHERE id = ?`;

        return RunQuery(query, [newBalance, playerId]);
    }
    catch (err) {
        throw new Error(`Error querying database:${err.message}`)
    }
}

async function SetRefundOption(txn) {
    try {
        let query = `UPDATE BetTransactions SET isCanceled = 1 WHERE id = ?`;
        return RunQuery(query, txn);
    } catch (err) {
        throw new Error(`Error querying database:${err.message}`);
    }
}

async function CreatePlayer(balance) {
    try {
        let query = `INSERT INTO PLAYER (balance) VALUES (?)`;
        await RunQuery(query, balance)

        return await GetCreatedId();
    } catch (err) {
        throw new Error(`Error while creating new player with balance ${balance}`)
    }
}

module.exports = {
    InitDB,
    RegisterTransaction,
    GetPlayerBalance,
    UpdateCurrentBalance,
    SetRefundOption,
    GetTransaction,
    CreatePlayer
};