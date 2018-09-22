const request = require("supertest"),
  app = require(".."),
  session = require("supertest-session")(app),
  { expect } = require("chai"),
  { user } = require("../seeds/1_users")

describe("app", () => {
  before(done => {
    session
      .post("/sessions")
      .send(user)
      .end(done)
  })

  it("should run", done => {
    request(app)
      .get("/")
      .expect(200, done)
  })

  context("when route is unmatched", () =>
    it("should 404", done => {
      request(app)
        .get("/doesnotexist")
        .expect(404, done)
    })
  )

  context("when request body is empty", () =>
    it("should reject with message", done => {
      session
        .patch("/users")
        .expect(400)
        .then(response => {
          expect(response.body.error).to.be.a("string")
          done()
        })
        .catch(done)
    })
  )

  context("when request body fails validation", () =>
    it("should reject with message", done => {
      session
        .patch("/users")
        .send({ email: "foo@bar.com", password: 123456789 })
        .expect(400)
        .then(response => {
          expect(response.body.error).to.be.a("string")
          done()
        })
        .catch(done)
    })
  )

  context("when a path parameter is of wrong type", () =>
    it("should reject with message", done => {
      session
        .get("/notebooks/asdf/items")
        .expect(400)
        .then(response => {
          expect(response.body.error).to.be.a("string")
          done()
        })
        .catch(done)
    })
  )

  context("when unique constraint fails", () =>
    it("should reject with message", done => {
      request(app)
        .post("/users")
        .send(user)
        .expect(409)
        .then(response => {
          expect(response.body.error).to.be.a("string")
          done()
        })
        .catch(done)
    })
  )

  context("when there is an error that cannot be dealt with", () =>
    it("should 500", done => {
      request(app)
        .get("/error")
        .expect(500, done)
    })
  )

  describe("middlewares", () => {
    describe("req#ensureUserIsSignedIn()", () => {
      context("when user is signed in", () =>
        it("should pass the request", done => {
          session.get("/restricted").expect(404, done)
        })
      )

      context("when user is not signed in", () =>
        it("should fail the request", done => {
          request(app)
            .get("/restricted")
            .expect(401, done)
        })
      )
    })
  })

  describe("res#check()", () => {
    context("when the object is not empty", () => {
      context("when status code is passed in", () =>
        it("should end the request with that code", done => {
          request(app)
            .post("/check")
            .send({ foo: "bar", code: 418 })
            .expect(418, done)
        })
      )

      context("when status code is not passed in", () =>
        it("should pass the request", done => {
          request(app)
            .post("/check")
            .send({ foo: "bar" })
            .expect(200, done)
        })
      )
    })

    context("when the object is a number", () =>
      it("should end the request with code", done => {
        request(app)
          .post("/check")
          .send({ foo: 1, code: 418 })
          .expect(418, done)
      })
    )

    context("when the object is empty", () =>
      it("should reject", done => {
        request(app)
          .post("/check")
          .expect(404, done)
      })
    )
  })
})
