const request = require('supertest');
const app = require('../app')

describe("Login Page", () => {
    it("Should open login page", (done) => {
        request(app).get('/login')
                .expect(200, done)
    })
})

describe("Home Page", () => {
    it("Should open home page", (done) => {
        request(app).get('/')
                .expect(302, done)
    })
})

describe("Login as Super Admin", () => {
    it("Should redirect to super admin", (done) => {
        request(app).post('/login')
                .send({email: 'sameer@tapsoft.in', password: 'asd123'})
                .expect(302, done)
                .expect('Location', /\/super-admin/)
    })
})

describe("Login as Brand Admin", () => {
    it("Should redirect to brand admin", (done) => {
        request(app).post('/login')
                .send({email: 'john@asd.com', password: 'asd'})
                .expect(302, done)
                .expect('Location', /\/app/)
    })
})