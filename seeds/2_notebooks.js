const notebooks = [
  { title: "test", user_id: 1 },
  { title: "benchmark", user_id: 1 },
  { title: "user2", user_id: 2 }
]

exports.notebooks = notebooks

exports.seed = async knex => {
  await knex("notebooks").del()
  await knex("notebooks").insert(notebooks)
}
