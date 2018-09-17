const { positionTrigger } = require("../knexfile")

exports.up = async knex => {
  await knex.schema.createTable("items", table => {
    table.increments()
    table
      .integer("notebook_id")
      .notNullable()
      .references("notebooks.id")
      .onDelete("cascade")
      .index()
    table
      .integer("parent_id")
      .references("items.id")
      .onDelete("cascade")
      .index()
    table
      .float("position")
      .notNullable()
      .index()
    table
      .boolean("important")
      .defaultTo(false)
      .index()
    table
      .boolean("completed")
      .defaultTo(false)
      .index()
    table.text("body").notNullable()
    table.dateTime("due").index()
  })

  await knex.raw(positionTrigger("items"))
  await knex.raw(`
    ALTER TABLE items ADD COLUMN body_search tsvector;

    CREATE INDEX notebook_body_search_index ON items USING gin(body_search);

    CREATE OR REPLACE FUNCTION body_index() RETURNS TRIGGER AS $$
      BEGIN
        NEW.body_search := to_tsvector(NEW.body);
        RETURN NEW;
      END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER body_index BEFORE INSERT OR UPDATE ON items
      FOR EACH ROW EXECUTE PROCEDURE body_index();`)
}

exports.down = knex => knex.schema.dropTable("items")
