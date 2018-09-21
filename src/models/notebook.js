const { Model } = require("objection")

class Notebook extends Model {
  static get tableName() {
    return "notebooks"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["title"],
      additionalProperties: false,
      properties: {
        title: { type: "string", minLength: 1 },
        position: { type: "number", minimum: 0 }
      }
    }
  }

  static get relationMappings() {
    return {
      items: {
        relation: Model.HasManyRelation,
        modelClass: require("./item"),
        join: {
          from: "notebooks.id",
          to: "items.notebook_id"
        }
      }
    }
  }
}

module.exports = Notebook
