require("../..")

const chai = require("chai"),
  expect = chai.expect,
  User = require("../../src/models/user")

chai.use(require("chai-as-promised"))

describe("models:User", () => {
  expect(User.tableName).to.equal("users")

  context("on insert/update", () => {
    it("should hash the password and match it", async () => {
      let user = await User.query().insert({
        username: "Jane",
        email: "me2@example.com",
        password: "password1"
      })
      await expect(user.verifyPassword("password1")).to.eventually.be.true

      user = await User.query()
        .patch({ password: "password2" })
        .where("id", user.id)
        .returning("*")
        .first()
      await expect(user.verifyPassword("password2")).to.eventually.be.true

      await User.query().deleteById(user.id)
    })
  })
})
