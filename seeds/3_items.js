const faker = require("faker"),
  items = [
    {
      notebook_id: 1,
      body: faker.lorem.sentence(),
      due: "2018-05-03 00:00:00"
    },
    { notebook_id: 1, parent_id: 1, body: faker.lorem.sentence() },
    { notebook_id: 1, parent_id: 1, body: faker.lorem.sentence() },
    { notebook_id: 1, parent_id: 2, body: faker.lorem.sentence() },
    { notebook_id: 1, parent_id: 2, body: "FOO", important: true },
    {
      notebook_id: 2,
      body: faker.lorem.sentence(),
      due: "1978-10-09 12:34:56"
    },
    { notebook_id: 1, parent_id: 1, body: "DONE", completed: true }
  ]

exports.items = items

exports.seed = async knex => {
  await knex("items").del()
  await knex("items").insert(items)
}
