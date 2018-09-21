const { Model } = require("objection")

class Item extends Model {
  static get tableName() {
    return "items"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["body"],
      additionalProperties: false,
      properties: {
        parent_id: { type: "integer", minimum: 1 },
        position: { type: "number", minimum: 0 },
        important: { type: "boolean" },
        completed: { type: "boolean" },
        body: { type: "string", minLength: 1 },
        due: { type: "string", format: "date-time" }
      }
    }
  }

  static get relationMappings() {
    return {
      children: {
        relation: Model.HasManyRelation,
        modelClass: Item,
        join: {
          from: "items.id",
          to: "items.parent_id"
        }
      }
    }
  }
}

module.exports = Item
