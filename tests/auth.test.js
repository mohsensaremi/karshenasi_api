//routes.test.js
import request from "supertest";
import server from "../src/index.js";
import uuid from 'uuid/v4';

beforeAll(async () => {
    // do something before anything else runs
    console.log('Jest starting!');
});
// close the server after each test
afterAll(() => {
    server.close();
    console.log('server closed!');
});
describe('auth route tests', () => {
    const EMAIL = `${uuid()}@gmail.com`;
    const PASS = "pass";
    let TOKEN = null;

    test('register', async () => {
        const response = await request(server).post('/register').send({
            email: EMAIL,
            password: PASS,
            passwordConfirmation: PASS,
        });
        expect(response.body.success).toBe(true);
    });

    test('login', async () => {
        const response = await request(server).post('/login')
            .send({
                email: EMAIL,
                password: PASS,
            });
        expect(response.status).toEqual(200);
        expect(response.body.success).toEqual(true);

        TOKEN = response.body.data.token;

    });

    test('me', async () => {
        const response = await request(server)
            .get('/me')
            .set('authorization', `Bearer ${TOKEN}`);

        expect(response.body.success).toEqual(true);
    });
});