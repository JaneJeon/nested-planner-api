const { Model } = require("objection"),
  argon2 = require("argon2")

class User extends Model {
  static get tableName() {
    return "users"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["email", "password"],
      additionalProperties: false,
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 9 }
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

  static get relationMappings() {
    return {
      notebooks: {
        relation: Model.HasManyRelation,
        modelClass: require("./notebook"),
        join: {
          from: "users.id",
          to: "notebooks.user_id"
        }
      }
    }
  }
}

module.exports = User
