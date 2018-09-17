const request = require("supertest"),
  app = require(".."),
  session = require("supertest-session")(app),
  { expect } = require("chai"),
  { user } = require("../seeds/1_users")

describe("app", () => {
  before(done => {
    session
      .post("/sessions")
      .send({ email: user.email, password: user.password })
      .end(done)
  })

  it("should run", done => {
    request(app)
      .post("/")
      .expect(200, done)
  })

  context("when route is unmatched", () =>
    it("should 404", done => {
      request(app)
        .get("/dne")
        .expect(404, done)
    })
  )

  context("when trying to set id via req.body", () =>
    it("should reject with message", done => {
      request(app)
        .post("/")
        .send({ id: 1 })
        .expect(400, { error: "Cannot set property 'id'" }, done)
    })
  )

  context("when trying to set user_id via req.body", () =>
    it("should reject with message", done => {
      request(app)
        .post("/")
        .send({ user_id: null })
        .expect(400, { error: "Cannot set property 'user_id'" }, done)
    })
  )

  context("when trying to set notebook_id via req.body", () =>
    it("should reject with message", done => {
      request(app)
        .post("/")
        .send({ notebook_id: true })
        .expect(400, { error: "Cannot set property 'notebook_id'" }, done)
    })
  )

  // e.g. wrong data type, wrong fields, etc.
  context("when request body fails validation", () =>
    it("should reject with message", done => {
      request(app)
        .post("/users")
        .send({ password: "short" })
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
      delete user.id

      request(app)
        .post("/users")
        .send(user)
        .expect(
          409,
          { error: "Key (email)=(test@example.com) already exists." },
          done
        )
    })
  )

  context("when a path parameter is of wrong type", () =>
    it("should reject with message", done => {
      session
        .get("/test/asdf")
        .expect(400)
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

  describe("req", () => {
    describe("#ensureUserIsSignedIn()", () => {
      context("when user is signed in", () =>
        it("should pass the request", done => {
          session.get("/test").expect(200, done)
        })
      )

      context("when user is not signed in", () =>
        it("should fail the request", done => {
          request(app)
            .get("/test")
            .expect(401, done)
        })
      )
    })

    describe("#ensureNotebookBelongsToUser()", () => {
      context("when notebook belongs to user", () =>
        it("should pass the request", done => {
          session.get("/test/1").expect(200, done)
        })
      )

      context("when notebook does not exist", () =>
        it("should fail the request", done => {
          session.get("/test/100").expect(404, done)
        })
      )

      context("when notebook does not belong to user", () =>
        it("should fail the request", done => {
          session.get("/test/3").expect(403, done)
        })
      )
    })

    describe("#ensureItemBelongsToNotebook()", () => {
      context("when item belongs to notebook", () =>
        it("should pass the request", done => {
          session.get("/test/1/1").expect(200, done)
        })
      )

      context("when item does not exist", () =>
        it("should fail the request", done => {
          session.get("/test/1/100").expect(404, done)
        })
      )

      context("when item does not belong to notebook", () =>
        it("should fail the request", done => {
          session.get("/test/1/6").expect(403, done)
        })
      )
    })
  })
})
