//routes.test.js
import server from "../src/index.js";
import uuid from 'uuid/v4';
const  request = require("supertest").agent(server.listen());

describe('auth route tests', () => {
    const EMAIL = `${uuid()}@gmail.com`;
    const PASS = "pass";
    let TOKEN = null;

    test('register', async () => {
        const response = await request.post('/register').send({
            email: EMAIL,
            password: PASS,
            passwordConfirmation: PASS,
        });
        expect(response.body.success).toBe(true);
    });

    test('login', async () => {
        const response = await request.post('/login')
            .send({
                email: EMAIL,
                password: PASS,
            });
        expect(response.status).toEqual(200);
        expect(response.body.success).toEqual(true);

        TOKEN = response.body.data.token;

    });

    test('me', async () => {
        const response = await request
            .get('/me')
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
    });
});