const { positionTrigger } = require("../knexfile")

exports.up = knex =>
  knex.schema
    .createTable("notebooks", table => {
      table.increments()
      table.string("title").notNullable()
      table
        .integer("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("cascade")
      table.float("position").notNullable()

      table.index(["user_id", "position"])
    })
    .then(() => knex.raw(positionTrigger("notebooks")))

exports.down = knex => knex.schema.dropTable("notebooks")
