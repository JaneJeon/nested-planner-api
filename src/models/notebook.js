const { Model } = require("objection")

class Notebook extends Model {
  static get tableName() {
    return "notebooks"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["title", "user_id"],
      additionalProperties: false,
      properties: {
        id: { type: "integer", minimum: 1 },
        title: { type: "string", minLength: 1 },
        user_id: { type: "integer", minimum: 1 },
        position: { type: "number", minimum: 0 }
      }
    }
  }
}

module.exports = Notebook
