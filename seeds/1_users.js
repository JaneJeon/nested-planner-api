const User = require("../src/models/user"),
  user = {
    id: 1,
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
  await knex("users").insert([
    instance,
    // this person is strictly used to test rights for notebooks table
    {
      id: 2,
      email: "test2@example.com",
      password: "123123123",
      username: "Jane Doe"
    }
  ])
}
