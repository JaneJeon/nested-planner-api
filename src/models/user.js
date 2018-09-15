const { Model } = require("objection"),
  argon2 = require("argon2")

class User extends Model {
  static get tableName() {
    return "users"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["username", "email", "password"],
      properties: {
        username: { type: "string", minLength: 1 },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: process.env.PASSWORD_LENGTH }
      }
    }
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    this.password = await argon2.hash(this.password)
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext)
    if (this.password) this.password = await argon2.hash(this.password)
  }

  async verifyPassword(password) {
    return argon2.verify(this.password, password)
  }
}

module.exports = User
