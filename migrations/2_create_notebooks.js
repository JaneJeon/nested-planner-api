const { positionTrigger } = require("../knexfile")

exports.up = async knex => {
  await knex.schema.createTable("notebooks", table => {
    table.increments()
    table.string("title").notNullable()
    table
      .integer("user_id")
      .notNullable()
      .references("users.id")
      .onDelete("cascade")
    table.float("position").notNullable()

    table.index(["user_id", "position"])
  })

  await knex.raw(positionTrigger("notebooks"))
}

exports.down = knex => knex.schema.dropTable("notebooks")
