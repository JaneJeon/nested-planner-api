const { Model, ValidationError } = require("objection"),
  isEmail = require("validator/lib/isEmail"),
  argon2 = require("argon2")

class User extends Model {
  static get tableName() {
    return "users"
  }

  $afterValidate(user) {
    if (user.email && !isEmail(user.email))
      throw new ValidationError("Invalid email")
    if (user.password && user.password.length < process.env.PASSWORD_LENGTH)
      throw new ValidationError("Invalid password length")
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    this.password = await argon2.hash(this.password)
  }

  async $beforeUpdate(opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext)
    if (opt.patch && this.password)
      this.password = await argon2.hash(this.password)
  }

  async verifyPassword(password) {
    return argon2.verify(this.password, password)
  }
}

module.exports = User
