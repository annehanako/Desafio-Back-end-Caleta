const request = require('supertest')
const server = require('../server.js')

let existingId = 43
let nonExistingId = 123
let newBalance = 900;
let invalidBalance = 'invalid';
let newBet = 50;
let newTxn = 26;
let newWin = 150;

//create a new player test
describe('Create new player', () => {
    it('Should create a new player ID and add the balance to it', async () => {
        // Send a POST request to the '/player' endpoint with the specified balance
        const response = await request(server)
            .post('/player')
            .send({ balance: newBalance });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('player');
        expect(response.body).toHaveProperty('balance', newBalance);
    });
    it('Should return an error for invalid balance value', async () => {
        // Send a POST request to the '/player' endpoint with an invalid balance
        const response = await request(server)
            .post('/player')
        expect(response.statusCode).toEqual(400);

        expect(response.body).toHaveProperty('error');
    });
});


//get player test
describe('Get player balance', () => {
    it('Should get the playerId and its balance', async () => {
        const response = await request(server).get('/balance/' + existingId)
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('player', existingId);
        expect(response.body).toHaveProperty('balance');
    })
    it('Should return error message', async () => {
        const response = await request(server).get('/balance/' + nonExistingId)
        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty('error');

    })
})

// Post a bet

describe('Create new bet', () => {
    it('Should create a new bet, txn and update the player balance', async () => {
        // Send a POST request to the '/bet' endpoint with the specified balance
        const response = await request(server)
            .post('/bet')
            .send({ playerId: existingId, value: newBet });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('player', existingId);
        expect(response.body).toHaveProperty('balance', newBalance - newBet);
    });

    it('Should return an error for invalid value', async () => {
        const response = await request(server)
            .post('/bet')
            .send({ playerId: existingId });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty('error');
    });
});


// Register win

describe('Register win', () => {
    it('Should add funds to the player balance and validate a win', async () => {
        const response = await request(server)
            .post('/win')
            .send({ playerId: existingId, value: newWin });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('player', existingId);
        expect(response.body).toHaveProperty('balance', (newBalance - newBet) + newWin);
    });

    it('Should return an error for invalid value', async () => {
        const response = await request(server)
            .post('/win')
            .send({ playerId: existingId });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty('error');
    });
});

// Rollback a bet value

describe('Rollback a bet value ', () => {
    it('Should cancel a bet and return the funds to the player balance', async () => {
        const response = await request(server)
            .post('/rollback')
            .send({ playerId: existingId, value: newBet, txn: newTxn});

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('player', existingId);
        expect(response.body).toHaveProperty('balance', (newBalance - newBet) + newBet);
        expect(response.body).toHaveProperty('txn', newTxn);

    });

    it('Should return an error for invalid value', async () => {
        const response = await request(server)
            .post('/rollback')
            .send({ playerId: existingId });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty('error');
    });
});
