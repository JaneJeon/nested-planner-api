const session = require("supertest-session")(require("../..")),
  { user } = require("../../seeds/1_users"),
  { expect } = require("chai")

describe("app:/notebooks/:notebookId/items", () => {
  before(done => {
    session
      .post("/sessions")
      .send(user)
      .end(done)
  })

  describe("GET /", () => {
    context("view=focus", () =>
      it("should show only important items", done => {
        session
          .get("/notebooks/1/items?view=focus")
          .expect(200)
          .then(response => {
            expect(response.body[0].id).to.equal(5)
            done()
          })
          .catch(done)
      })
    )

    context("view=todo", () =>
      it("should show only items with due date", done => {
        session
          .get("/notebooks/1/items?view=todo&sort=desc")
          .expect(200)
          .then(response => {
            expect(response.body[0].id).to.equal(1)
            done()
          })
          .catch(done)
      })
    )

    context("view=search", () =>
      it("should search results", done => {
        session
          .get("/notebooks/1/items?view=search&q=foo")
          .expect(200)
          .then(response => {
            expect(response.body.length).to.be.at.least(1)
            done()
          })
          .catch(done)
      })
    )

    context("view=default", () => {
      context("showCompleted=default", () =>
        it("should fetch tree without completed items", done => {
          session
            .get("/notebooks/1/items")
            .expect(200)
            .then(response => {
              expect(response.body[0]).to.have.length(2)
              done()
            })
            .catch(done)
        })
      )

      context("showCompleted=false", () =>
        it("should fetch tree view with completed items", done => {
          session
            .get("/notebooks/1/items?showCompleted=false")
            .expect(200)
            .then(response => {
              expect(response.body[0]).to.have.length(3)
              done()
            })
            .catch(done)
        })
      )
    })
  })

  describe("POST /", () =>
    it("should create item and return it", done => {
      session
        .post("/notebooks/1/items")
        .send({ notebook_id: 1, body: "hello" })
        .expect(201)
        .then(response => {
          expect(response).to.haveOwnProperty("id")
          expect(response.body).to.equal("hello")
          done()
        })
        .catch(done)
    }))

  describe("PATCH /:itemId", () =>
    it("should update item and return it", done => {
      session
        .patch("/notebooks/1/items/2")
        .send({ body: "world" })
        .expect(200)
        .then(response => {
          expect(response).to.haveOwnProperty("parent_id")
          expect(response.body).to.equal("world")
          done()
        })
        .catch(done)
    }))

  describe("DELETE /:itemId", () =>
    it("should delete item", done => {
      session.delete("/notebooks/1/items/7").expect(204, done)
    }))
})
