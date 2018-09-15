require("dotenv").config()

module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL,
  debug: process.env.NODE_ENV == "development",
  positionTrigger: table => `
    CREATE OR REPLACE FUNCTION set_pos() RETURNS TRIGGER AS $$
      BEGIN
        NEW.position := NEW.id;
        RETURN NEW;
      END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_pos BEFORE INSERT ON ${table}
      FOR EACH ROW EXECUTE PROCEDURE set_pos();`
}
