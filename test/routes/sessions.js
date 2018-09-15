const request = require("supertest"),
  app = require("../.."),
  agent = request.agent(app),
  { user } = require("../../seeds/1_users")

describe("app:/sessions", () => {
  describe("POST /", () => {
    context("when params are valid", () => {
      context("when credentials are valid", () =>
        it("should sign users in", async () =>
          agent
            .post("/sessions")
            .send(user)
            .expect(201, { username: user.username }))
      )

      context("when credentials are invalid", () =>
        it("should reject", async () =>
          request(app)
            .post("/sessions")
            .send({ email: user.email, password: "clearlywrong" })
            .expect(401))
      )
    })

    context("when params are invalid", () =>
      it("should reject", async () =>
        request(app)
          .post("/sessions")
          .send({ email: user.email })
          .expect(400))
    )
  })

  describe("DELETE /", () =>
    it("should sign users out", async () =>
      agent.delete("/sessions").expect(200)))
})
