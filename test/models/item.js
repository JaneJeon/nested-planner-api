const { expect } = require("chai"),
  Item = require("../../src/models/item")

describe("models:Item", () => {
  expect(Item.tableName).to.equal("items")

  expect(Item.jsonSchema).to.not.be.null
})
