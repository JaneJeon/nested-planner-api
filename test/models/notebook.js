const { expect } = require("chai"),
  Notebook = require("../../src/models/notebook")

describe("models:Notebook", () => {
  expect(Notebook.tableName).to.equal("notebooks")

  expect(Notebook.jsonSchema).to.not.be.null
})
