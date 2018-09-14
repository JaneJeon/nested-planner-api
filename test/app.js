const request = require("supertest"),
  app = require("../src/app")

describe("app:/", () => {
  context("when route is unmatched", () =>
    it("should 404", async () =>
      request(app)
        .get("/foo")
        .expect(404))
  )

  context("when there is an uncaught error", () =>
    it("should 500", async () =>
      request(app)
        .get("/error")
        .expect(500))
  )
})
