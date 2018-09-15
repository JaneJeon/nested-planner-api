const request = require("supertest"),
  app = require("../.."),
  agent = request.agent(app)

describe("app:/users", () => {
  describe("POST /", () => {
    context("when params are valid", () => {
      context("when the user does not exist", () =>
        it("should create user", async () =>
          agent
            .post("/users")
            .send({
              username: "Jane",
              email: "me@example.com",
              password: "123456789"
            })
            .expect(201))
      )

      context("when the user exists", () =>
        it("should reject with message", async () =>
          request(app)
            .post("/users")
            .send({
              username: "John",
              email: "me@example.com",
              password: "123456789"
            })
            .expect(409))
      )
    })

    context("when params are invalid", () =>
      it("should reject", async () =>
        request(app)
          .post("/users")
          .send({
            username: "John",
            email: "me@example.com",
            password: 123456789
          })
          .expect(400))
    )
  })

  describe("PATCH /", () => {
    context("when the user is authenticated", () => {
      context("when params are valid", () =>
        it("should update params", async () =>
          agent
            .patch("/users")
            .send({ email: "me2@example.com", password: "987654321" })
            .expect(200))
      )

      context("when params are invalid", () =>
        it("should reject", async () =>
          agent
            .patch("/users")
            .send({ foo: "bar" })
            .expect(400))
      )
    })

    context("when user is unauthenticated", () =>
      it("should reject", async () =>
        request(app)
          .patch("/users")
          .send({ email: "me3@example.com" })
          .expect(401))
    )
  })

  describe("DELETE /", () => {
    context("when the user is authenticated", () =>
      it("should delete user", async () => agent.delete("/users").expect(200))
    )

    context("when user is unauthenticated", () =>
      it("should reject", async () =>
        request(app)
          .delete("/users")
          .expect(401))
    )
  })
})
