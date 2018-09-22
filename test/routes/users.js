const session = require("supertest-session")(require("../.."))

describe("app:/users", () => {
  describe("POST /", () =>
    it("should create user", done => {
      session
        .post("/users")
        .send({
          email: "me@example.com",
          password: "123456789"
        })
        .expect(201, done)
    }))

  describe("PATCH /", () =>
    it("should update user", done => {
      session
        .patch("/users")
        .send({ email: "me2@example.com", password: "987654321" })
        .expect(204, done)
    }))

  describe("DELETE /", () =>
    it("should delete user", done => {
      session.delete("/users").expect(204, done)
    }))
})
