const request = require("supertest"),
  app = require("../../src/app"),
  agent = request.agent(app),
  { user } = require("../../seeds/users")

describe("app:/sessions", () => {
  describe("POST /", () => {
    it("should sign users in", async () =>
      agent
        .post("/sessions")
        .send(user)
        .expect(201, { username: user.username }))

    it("should reject incomplete forms", async () =>
      request(app)
        .post("/sessions")
        .send({ email: user.email })
        .expect(400))

    it("should reject invalid credentials", async () =>
      request(app)
        .post("/sessions")
        .send({ email: user.email, password: "clearlywrong" })
        .expect(401))
  })

  describe("DELETE /", () =>
    it("should sign users out", async () =>
      agent.delete("/sessions").expect(200)))
})
