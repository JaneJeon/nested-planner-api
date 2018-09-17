const { Router } = require("express"),
  Notebook = require("../models/notebook")

module.exports = Router()
  .use((req, res, next) => {
    req.ensureUserIsSignedIn()
    next()
  })
  // get notebooks belonging to a user
  .get("/", async (req, res) => {
    const notebooks = await Notebook.query()
      .select("id", "title", "position")
      .where("user_id", req.user.id)
      .orderBy("position")

    res.send(notebooks)
  })
  // create a notebook
  .post("/", async (req, res) => {
    const notebook = await Notebook.query()
      .insert(Object.assign(req.body, { user_id: req.user.id }))
      .pick(["id", "title", "position"])

    res.status(201).send(notebook)
  })
  // update notebook (title, position)
  .patch("/:notebookId", async (req, res) => {
    await req.ensureNotebookBelongsToUser()
    const notebook = await Notebook.query()
      .patchAndFetchById(req.params.notebookId, req.body)
      .pick(["id", "title", "position"])

    res.send(notebook)
  })
  // delete notebook
  .delete("/:notebookId", async (req, res) => {
    await req.ensureNotebookBelongsToUser()
    await Notebook.query().deleteById(req.params.notebookId)

    res.sendStatus(204)
  })
