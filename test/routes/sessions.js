const session = require("supertest-session")(require("../..")),
  { user } = require("../../seeds/1_users")

describe("app:/sessions", () => {
  describe("POST /", () =>
    it("should sign user in", done => {
      session
        .post("/sessions")
        .send(user)
        .expect(204, done)
    }))

  describe("DELETE /", () =>
    it("should sign user out", done => {
      session.delete("/sessions").expect(204, done)
    }))
})
