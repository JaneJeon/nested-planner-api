const { Model } = require("objection")

class Item extends Model {
  static get tableName() {
    return "items"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["notebook_id", "body"],
      additionalProperties: false,
      properties: {
        id: { type: "integer", minimum: 1 },
        notebook_id: { type: "integer", minimum: 1 },
        parent_id: { type: "integer", minimum: 1 },
        position: { type: "number", minimum: 0 },
        important: { type: "boolean" },
        completed: { type: "boolean" },
        body: { type: "string", minLength: 1 },
        due: { type: "string", format: "date-time" }
      }
    }
  }
}

module.exports = Item
