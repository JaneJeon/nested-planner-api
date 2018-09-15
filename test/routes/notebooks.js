const request = require("supertest"),
  session = require("supertest-session"),
  app = require("../.."),
  authSession = require("supertest-session")(app),
  { user } = require("../../seeds/1_users"),
  { notebooks } = require("../../seeds/2_notebooks"),
  { expect } = require("chai")

describe("app:/notebooks", () => {
  before(done => {
    authSession
      .post("/sessions")
      .send(user)
      .end(done)
  })

  describe("GET /", () => {
    context("when the user is authenticated", () =>
      it("should fetch notebooks for a user", async () => {
        const response = await authSession.get("/notebooks").expect(200)

        expect(response.body.length).to.equal(2)
      })
    )

    context("when the user is unauthenticated", () =>
      it("should reject", async () =>
        request(app)
          .get("/notebooks")
          .expect(401))
    )
  })

  describe("POST /", () => {
    context("when the user is authenticated", () => {
      context("when the params are valid", () =>
        it("should create the notebook", async () => {
          const response = await authSession
            .post("/notebooks")
            .send({ title: "ok" })
            .expect(201)

          expect(response.body.id).to.not.be.null
        })
      )

      context("when the params are invalid", () =>
        it("should reject", async () =>
          authSession
            .post("/notebooks")
            .send({ title: "" })
            .expect(400))
      )
    })

    context("when the user is unauthenticated", () =>
      it("should reject", async () =>
        request(app)
          .post("/notebooks")
          .send({ title: "NG" })
          .expect(401))
    )
  })

  describe("PATCH /:id", () => {
    context("when the user is authenticated", () => {
      context("when the id is okay", async () =>
        authSession
          .patch("/notebooks/1")
          .send({ title: "ok2", position: 0.5 })
          .expect(200)
      )

      context("when the id does not exist", async () =>
        authSession
          .patch("/notebooks/4")
          .send({ title: "ok2", position: 0.5 })
          .expect(400)
      )

      context("when the id does not belong to the user", async () =>
        authSession
          .patch("/notebooks/3")
          .send({ title: "ok2", position: 0.5 })
          .expect(403)
      )
    })

    context("when the user is unauthenticated", () =>
      it("should reject", async () =>
        request(app)
          .patch("/notebooks/1")
          .send({ title: "NG", position: 0.5 })
          .expect(401))
    )
  })

  describe("DELETE /:id", () => {
    context("when the user is authenticated", () => {
      context("when the id is okay", async () =>
        authSession.delete("/notebooks/1").expect(200)
      )

      context("when the id does not exist", async () =>
        authSession.delete("/notebooks/1").expect(400)
      )

      context("when the id does not belong to the user", async () =>
        authSession.delete("/notebooks/3").expect(403)
      )
    })

    context("when the user is unauthenticated", () =>
      it("should reject", async () =>
        request(app)
          .delete("/notebooks/1")
          .expect(401))
    )
  })
})
