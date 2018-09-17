const session = require("supertest-session")(require("../..")),
  { user } = require("../../seeds/1_users"),
  { notebooks } = require("../../seeds/2_notebooks"),
  { expect } = require("chai")

describe("app:/notebooks", () => {
  before(done => {
    session
      .post("/sessions")
      .send(user)
      .end(done)
  })

  describe("GET /", () =>
    it("should get user's notebooks", done => {
      session
        .get("/notebooks")
        .expect(200)
        .then(response => {
          expect(response.body.length).to.equal(2)
          expect(response.body[0]).to.not.have.property("user_id")
          done()
        })
        .catch(done)
    }))

  describe("POST /", () =>
    it("should create notebook and return it", done => {
      session
        .post("/notebooks")
        .send({ title: "ok" })
        .expect(201)
        .then(response => {
          expect(response.body).to.have.property("id")
          expect(response.body).to.have.property("title", "ok")
          expect(response.body).to.not.have.property("user_id")
          done()
        })
        .catch(done)
    }))

  describe("PATCH /:id", () =>
    it("should update notebook and return it", done => {
      session
        .patch("/notebooks/1")
        .send({ title: "ok2", position: 0.5 })
        .expect(200)
        .then(response => {
          expect(response.body).to.have.property("id", 1)
          expect(response.body).to.have.property("position", 0.5)
          expect(response.body).to.not.have.property("user_id")
          done()
        })
        .catch(done)
    }))

  describe("DELETE /:id", () =>
    it("should delete notebook", done => {
      session.delete("/notebooks/1").expect(204, done)
    }))
})
