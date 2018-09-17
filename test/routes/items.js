const session = require("supertest-session")(require("../..")),
  { user } = require("../../seeds/1_users"),
  { notebooks } = require("../../seeds/2_notebooks"),
  { expect } = require("chai")

describe("app:/notebooks/:notebookId/items", () => {
  before(done => {
    session
      .post("/sessions")
      .send(user)
      .end(done)
  })

  describe("GET /", () => {
    // TODO:
  })

  describe("POST /", () => {
    // TODO:
  })

  describe("PATCH /:itemId", () => {
    // TODO:
  })

  describe("DELETE /:itemId", () =>
    it("should delete item", done => {
      session.delete("/notebooks/1/items/1").expect(204, done)
    }))
})
