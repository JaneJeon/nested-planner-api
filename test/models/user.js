require("dotenv").config()

const chai = require("chai"),
  expect = chai.expect,
  User = require("../../src/models/user")

chai.use(require("chai-as-promised"))

describe("models:User", () => {
  expect(User.tableName).to.equal("users")

  context("when params are valid", () => {
    it("should create user", () =>
      User.fromJson({ email: "a@bc.de", password: "123456789" }))

    it("should hash the password and match it", async () => {
      const generateUser = () =>
          User.fromJson({
            email: "a@bc.de",
            password: "123456789"
          }),
        user1 = generateUser(),
        user2 = generateUser(),
        user3 = generateUser()
      await user1.$beforeInsert()
      await user2.$beforeUpdate({ patch: true })
      await user3.$beforeUpdate({ patch: false })
      await expect(user1.verifyPassword("123456789")).to.eventually.be.true
      await expect(user2.verifyPassword("123456789")).to.eventually.be.true
      await expect(user1.verifyPassword("incorrect")).to.eventually.be.false
      await expect(user2.verifyPassword("incorrect")).to.eventually.be.false
    })
  })

  context("when params are empty", () =>
    it("should reject", () => {
      expect(User.query().insert({})).to.be.rejected
      expect(User.query().insert({ email: "a@bc.de" })).to.be.rejected
      expect(User.query().insert({ password: "123456789" })).to.be.rejected
    })
  )

  context("when email is invalid", () =>
    it("should reject", () =>
      expect(() =>
        User.fromJson({ email: "invalid.email@foo", password: "123456789" })
      ).to.throw())
  )

  context("when password is too short", () =>
    it("should reject", () =>
      expect(() =>
        User.fromJson({ email: "a@bc.de", password: "short" })
      ).to.throw())
  )

  context("when param types are wrong", () =>
    it("should reject", () =>
      expect(User.query().insert({ email: "a@bc.de", password: 123456789 })).to
        .be.rejected)
  )
})
