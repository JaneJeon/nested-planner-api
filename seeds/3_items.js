const faker = require("faker"),
  items = [
    { id: 1, notebook_id: 1, body: faker.lorem.sentence() },
    { id: 2, notebook_id: 1, parent_id: 1, body: faker.lorem.sentence() },
    { id: 3, notebook_id: 1, parent_id: 1, body: faker.lorem.sentence() },
    { id: 4, notebook_id: 1, parent_id: 2, body: faker.lorem.sentence() },
    { id: 5, notebook_id: 1, parent_id: 2, body: faker.lorem.sentence() },
    { id: 6, notebook_id: 2, body: faker.lorem.sentence() }
  ]

exports.items = items

exports.seed = async knex => {
  await knex("items").del()
  await knex("items").insert(items)
}
