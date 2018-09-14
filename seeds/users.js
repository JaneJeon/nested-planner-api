const User = require("../src/models/user"),
  user = {
    email: "test@example.com",
    password: "123456789",
    username: "John Doe"
  }
Object.freeze(user)

exports.user = user

exports.seed = async knex => {
  await knex("users").del()
  const instance = User.fromJson(user)
  await instance.$beforeInsert()
  await knex("users").insert(instance)
}
