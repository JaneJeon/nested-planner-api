const faker = require("faker"),
  items = [
    {
      id: 1,
      notebook_id: 1,
      body: faker.lorem.sentence(),
      due: "2018-05-03 00:00:00"
    },
    { id: 2, notebook_id: 1, parent_id: 1, body: faker.lorem.sentence() },
    { id: 3, notebook_id: 1, parent_id: 1, body: faker.lorem.sentence() },
    { id: 4, notebook_id: 1, parent_id: 2, body: faker.lorem.sentence() },
    { id: 5, notebook_id: 1, parent_id: 2, body: "FOO", important: true },
    {
      id: 6,
      notebook_id: 2,
      body: faker.lorem.sentence(),
      due: "1978-10-09 12:34:56"
    },
    { id: 7, notebook_id: 1, parent_id: 1, body: "DONE", completed: true }
  ]

exports.items = items

exports.seed = async knex => {
  await knex("items").del()
  await knex("items").insert(items)
}
