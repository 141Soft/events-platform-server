import { app } from '../app.js'
import { db } from '../db.js'
import request from 'supertest'

beforeEach(async () => {
    await db.seed('./schema.sql', './seed.sql', false);
});

afterAll(async ()=> {
    await db.closePool();
});

describe("/", ()=> {
    test("Is Successful and 200", async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Success');
    });
});

describe("/events", ()=> {
    test("Returns status code 200", async () => {
        const res = await request(app).get('/events');
        expect(res.status).toBe(200);
    });
    test("Returns correct number of entries", async () => {
        const res = await request(app).get('/events');
        expect(res.body.events.length).toBe(10);
    });
    test("Event properties match", async () => {
        const res = await request(app).get('/events');
        res.body.events.forEach(e=> {
            expect(e).toMatchObject({
                id: expect.any(Number),
                eventName: expect.any(String),
                eventDate: expect.any(String),
                eventDesc: expect.any(String),
                eventStub: expect.any(String),
                eventThumb: expect.any(String),
                tags: expect.any(Array)
            })
        });
    });
    test("Pagination returns pagination data", async () => {
        const res = await request(app).get('/events?paginate=true');
        expect(res.body.pagination).toMatchObject({
            count: expect.any(Number),
            limit: expect.any(Number),
            page: expect.any(Number),
            totalPages: expect.any(Number)
        });
    });
    test("Pagination limit reduces returned events", async () => {
        const res = await request(app).get('/events?paginate=true&limit=2');
        expect(res.body.pagination.limit).toBe(2);
        expect(res.body.events.length).toBe(2);
    });
    test("Pagination page returns correct page or 1", async () => {
        let res = await request(app).get('/events?paginate=true&limit=2&page=3');
        expect(res.body.pagination.page).toBe(3);
        res = await request(app).get('/events?paginate=true');
        expect(res.body.pagination.page).toBe(1);
    });
    test("Returns correct entry by id", async () => {
        const res = await request(app).get('/events?id=1');
        expect(res.body.events[0].id).toBe(1);
    });
    test("Returns entry with correct tags", async () => {
        const res = await request(app).get('/events?id=1');
        expect(res.body.events[0].tags).toMatchObject(["charity","community","food"]);
    });
    test("Returns entries with eventName inclusive of search string", async () => {
        const searchString = 'art'
        const res = await request(app).get(`/events?name=${searchString}`);
        res.body.events.forEach(e => {
            expect(e.eventName.toLowerCase().includes(searchString)).toBe(true);
        });
    });
    test("Returns entries only with specified tag", async () => {
        const tag = "culture"
        const res = await request(app).get(`/events?tag=${tag}`);
        res.body.events.forEach(e => {
            expect(e.tags).toMatchObject([tag]);
        })
    });
    test("Parameters are case insensitive", async () => {
        const tag = "CuLTuRe";
        const name = "ExHi";
        const res = await request(app).get(`/events?tag=${tag}&name=${name}`);
        expect(res.body.events[0].tags).toMatchObject(['culture']);
        expect(res.body.events[0].eventName).toBe('Art Exhibition');
    });
});

describe("/events/tags", () => {
    test("Returns status code 200", async () => {
        const res = await request(app).get('/events/tags');
        expect(res.status).toBe(200);
    })
    test("Returns a list of tags of correct length", async () => {
        const res = await request(app).get('/events/tags');
        expect(res.body.tags.length).toBe(27);
        res.body.tags.forEach(tag => expect(typeof tag).toBe("string"))
    })
});

describe("/users", () => {
    test("Returns status code 200", async () => {
        const res = await request(app).get('/users?name=AliceWonder');
        expect(res.status).toBe(200);
    });
    test("Returns status code 404 when passed no params", async () => {
        let res = await request(app).get('/users');
        expect(res.status).toBe(404);
    });
    test("Returns status code 404 when no matching users", async () => {
        let res = await request(app).get('/users?name=abcde&email=fghij');
        expect(res.status).toBe(404);
    });
    test("Returns correct user data when passed name", async () => {
        const res = await request(app).get('/users?name=AliceWonder');
        expect(res.body.user).toMatchObject({
            userName:"AliceWonder",
            userEmail:"alice@example.com"
        });
    });
});

describe("POST /users", () => {
    test("returns status code 201", async () => {
        const payload = {name: 'Franky', email: 'frank13@mail.com', password: 'Password123'};
        const res = await request(app)
                    .post('/users')
                    .send(payload)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json');
        expect(res.status).toBe(201);
    })
    test("returns status code 404 if user already exists", async () => {
        const payload = {name: 'AliceWonder', email: 'alice@example.com', password:'securePassword1'};
        const res = await request(app)
                    .post('/users')
                    .send(payload)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json');
        expect(res.status).toBe(404);
    })
    test("returns correct username and email properties", async () => {
        const payload = {name: 'Franky', email: 'frank13@mail.com', password: 'Password123'};
        const res = await request(app)
                    .post('/users')
                    .send(payload)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json');
        expect(res.body.user).toMatchObject({
            userName: payload.name,
            userEmail: payload.email
        })
    })
})

describe.only("GET /users/login", () => {
    test("returns status code 200", async () => {
        const payload = {name: 'BobBuilder', email: 'bob@example.com', password: 'buildStrong1'};
        const res = await request(app)
                    .get('/users/login')
                    .send(payload)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json');
        expect(res.status).toBe(200);
    });
    test("returns status code 404 on no user found", async () => {
        const payload = {name: "invalid", email: 'ivalid@example.com', password: 'password123'};
        const res = await request(app)
                    .get('/users/login')
                    .send(payload)
                    .set('Content-type', 'application/json')
                    .set('Accept', 'application/json');
        expect(res.status).toBe(404);
    });
    test("returns status code 404 on invalid password", async () => {
        const payload = {name: 'BobBuilder', email: 'bob@example.com', password: 'password123'};
        const res = await request(app)
                    .get('/users/login')
                    .send(payload)
                    .set('Content-type', 'application/json')
                    .set('Accept', 'application/json');
        expect(res.status).toBe(404);
    });
    test("returns correct user info on successful login", async () => {
        const payload = {name: 'BobBuilder', email: 'bob@example.com', password: 'buildStrong1'};
        const res = await request(app)
                    .get('/users/login')
                    .send(payload)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json');
        expect(res.body.status).toBe("success");
        expect(res.body.user).toMatchObject({
                userName: 'BobBuilder',
                userEmail: 'bob@example.com',
                isAdmin: 0,
                isVerified: 0
        })
    })
})