const request = require('supertest');
const server = require('../server.js');

let mockPlayer = { player: 0, balance: 100, bet: 50, win: 100, txnBet: 0, txnWin: 0 };

let nonExistingId = 12345;

describe('Create new player', () => {
    it('Should create a new player ID and add the balance to it', async () => {
        const response = await request(server)
            .post('/player')
            .send({ balance: mockPlayer.balance });
            
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('player');
        expect(response.body).toHaveProperty('balance', mockPlayer.balance);
        mockPlayer.player = response.body.player;
    });

    it('Should return an error for invalid balance value', async () => {
        const response = await request(server)
            .post('/player');
        expect(response.statusCode).toEqual(400);

        expect(response.body).toHaveProperty('error');
    });
});

describe('Get player balance', () => {
    it('Should get the playerId and its balance', async () => {
        const response = await request(server).get('/balance/' + mockPlayer.player);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('player', mockPlayer.player);
        expect(response.body).toHaveProperty('balance', mockPlayer.balance);
    })

    it('Should return error message', async () => {
        const response = await request(server).get('/balance/' + nonExistingId);
        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty('error');
    });
});

describe('Create new bet', () => {
    it('Should create a new bet, txn and update the player balance', async () => {
        const response = await request(server)
            .post('/bet')
            .send({ playerId: mockPlayer.player, value: mockPlayer.bet });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('player', mockPlayer.player);
        expect(response.body).toHaveProperty('balance', mockPlayer.balance - mockPlayer.bet);

        const { player, balance, txn } = response.body;
        mockPlayer.player = player;
        mockPlayer.balance = balance;
        mockPlayer.txnBet = txn;
    });

    it('Should return an error for invalid value', async () => {
        const response = await request(server)
            .post('/bet')
            .send({ playerId: mockPlayer.player });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty('error');
    });
});

describe('Rollback a bet value ', () => {
    it('Should cancel a bet and return the funds to the player balance', async () => {
        const response = await request(server)
            .post('/rollback')
            .send({ playerId: mockPlayer.player, value: mockPlayer.bet, txn: mockPlayer.txnBet });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('balance', mockPlayer.balance + mockPlayer.bet);
        mockPlayer.balance = response.body.balance;
    });

    it('Should return an error for invalid value', async () => {
        const response = await request(server)
            .post('/rollback')
            .send({ playerId: mockPlayer.player });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty('error');
    });
});

describe('Register win', () => {
    it('Should add funds to the player balance and validate a win', async () => {
        const response = await request(server)
            .post('/win')
            .send({ playerId: mockPlayer.player, value: mockPlayer.win });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('player', mockPlayer.player);
        expect(response.body).toHaveProperty('balance', mockPlayer.balance + mockPlayer.win);
        mockPlayer.balance = response.body.balance;

    });

    it('Should return an error for invalid value', async () => {
        const response = await request(server)
            .post('/win')
            .send({ playerId: mockPlayer.player });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toHaveProperty('error');
    });
});

describe('Delete player', () => {
    it('Should delete the created player', async () => {
        const response = await request(server)
            .post('/delete')
            .send({ playerId: mockPlayer.player });

        expect(response.body).toHaveProperty('success', true);
        expect(response.statusCode).toEqual(200);
    })

    it('Should return an error for an invalid value', async () => {
        const response = await request(server)
            .post('/delete')
            .send({ playerId: mockPlayer.player });

        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty('success', false);
    });
});