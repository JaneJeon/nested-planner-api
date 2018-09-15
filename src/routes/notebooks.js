const router = require("express").Router(),
  Notebook = require("../models/notebook")

module.exports = router
  .use((req, res, next) => {
    if (!req.user) res.sendStatus(401)
    next()
  })
  // get notebooks belonging to a user
  .get("/", async (req, res) => {
    const notebooks = await Notebook.query()
      .where("user_id", req.user.id)
      .orderBy("position")

    res.send(notebooks)
  })
  // create a notebook
  .post("/", async (req, res) => {
    const notebook = await Notebook.query().insert(
      Object.assign({ user_id: req.user.id }, req.body)
    )

    res.status(201).send(notebook)
  })
  // update notebook (title, position)
  .patch("/:id", async (req, res) => {
    const notebook = await Notebook.query().findById(req.params.id)
    if (!notebook) return res.sendStatus(400)
    if (req.user.id != notebook.user_id) return res.sendStatus(403)

    await Notebook.query()
      .patch(req.body)
      .where("id", notebook.id)

    res.end()
  })
  // delete notebook
  .delete("/:id", async (req, res) => {
    const notebook = await Notebook.query().findById(req.params.id)
    if (!notebook) return res.sendStatus(400)
    if (req.user.id != notebook.user_id) return res.sendStatus(403)

    await Notebook.query().deleteById(req.params.id)

    res.end()
  })
