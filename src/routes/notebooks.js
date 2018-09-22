const { Router } = require("express")

module.exports = Router()
  .use((req, res, next) => req.ensureUserIsSignedIn(next))
  // get notebooks belonging to a user
  .get("/", async (req, res) => {
    const notebooks = await req.user
      .$relatedQuery("notebooks")
      .select("id", "position", "title")
      .orderBy("position")

    res.send(notebooks)
  })
  // create a notebook
  .post("/", async (req, res) => {
    const notebook = await req.user
      .$relatedQuery("notebooks")
      .insert(req.body)
      .returning(["id", "position"])
      .pick(["id", "position"])

    res.status(201).send(notebook)
  })
  // update notebook (title, position)
  .patch("/:notebookId", async (req, res) => {
    const notebook = await req.user
      .$relatedQuery("notebooks")
      .patchAndFetchById(req.params.notebookId, req.body)

    res.check(notebook, 204)
  })
  // delete notebook
  .delete("/:notebookId", async (req, res) => {
    const deleted = await req.user
      .$relatedQuery("notebooks")
      .deleteById(req.params.notebookId)

    res.check(deleted, 204)
  })
