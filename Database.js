const sqlite = require('sqlite3');
const fs = require('fs');
const { query } = require('express');
const { resolve } = require('path');
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
                FOREIGN KEY (playerId) REFERENCES Player(id)
        );`)
    }
}

async function GetPlayerBalance(playerId) {
    try {
        let query = `SELECT * FROM Player where id = ?`;

        return new Promise((resolve, reject) => {
            database.all(query, playerId, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    }
    catch (err) {
        throw new Error(`Error querying database:${err.message} `)
    }
}
async function GetTransaction(txn, playerId, value) {
    try {
        let query = `SELECT * FROM BetTransactions where id = ? AND PlayerId = ? AND betValue = ?`

        return new Promise((resolve, reject) => {
            database.all(query, [txn, playerId, value], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }
    catch (err) {
        throw new Error(`Error querying database:${err.message}`)
    }
}

async function RegisterBet(playerId, betValue) {
    try {
        let query = `INSERT INTO BetTransactions (playerId, betValue) VALUES (?, ?);`;
        return new Promise((resolve, reject) => {
            database.all(query, [playerId, betValue], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    }
    catch (err) {
        throw new Error(`Error querying database:${err.message}`)
    }
}

async function UpdateCurrentBalance(playerId, newBalance) {
    try {
        let query = `UPDATE Player SET balance = ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            database.all(query, [newBalance, playerId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    catch (err) {
        throw new Error(`Error querying database:${err.message}`)
    }
}

async function RegisterWin(playerId, newBalance) {
    try {
        let query = `UPDATE Player SET balance = ? WHERE id = ?`;
        return new Promise((resolve, reject) => {
            database.all(query, [newBalance, playerId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                };
            });
        })
    }
    catch (err) {
        throw new Error(`Error querying database:${err.message}`)
    }
}

async function SetRefundOption(txn) {
    try {
        let query = `UPDATE BetTransactions SET isCanceled = 1 WHERE id = ?`;
        return new Promise((resolve, reject) => {
            database.run(query, [txn], function (err) {
                if (err) {
                    console.error('Error setting refund option in transaction:', err);
                    reject(err);
                } else {
                    resolve({ rowsAffected: this.changes });
                }
            })
        }
        )
    } catch (err) {
        throw new Error(`Error querying database:${err.message}`);
    }
}

module.exports = { InitDB, RegisterBet, GetPlayerBalance, RegisterWin, UpdateCurrentBalance, SetRefundOption, GetTransaction }