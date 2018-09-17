const { Router } = require("express"),
  Item = require("../models/item"),
  { raw } = require("objection")

module.exports = Router({ mergeParams: true })
  .use(async (req, res, next) => {
    req.ensureUserIsSignedIn()
    await req.ensureNotebookBelongsToUser()
    next()
  })
  // get all items belonging to a notebook, sorted and nested
  .get("/", async (req, res) => {
    const sort = req.query.sort == "DESC" ? "DESC" : "ASC"

    let items
    switch (req.query.view) {
      case "focus":
        items = await Item.query()
          .select("id", "position", "body", "completed", "important", "due")
          .where("notebook_id", req.params.notebookId)
          .andWhere("completed", false)
          .andWhere("important", true)
          .orderBy("position", sort)
        break
      case "todo":
        items = await Item.query()
          .select("id", "position", "body", "completed", "important", "due")
          .where("notebook_id", req.params.notebookId)
          .andWhere("completed", false)
          .andWhere(raw("due IS NOT NULL"))
          .orderBy("due", sort)
        break
      case "search":
        items = await Item.query()
          .select("id", "position", "body", "completed", "important", "due")
          .from(raw("items, plainto_tsquery(?) query", req.query.q))
          .where("notebook_id", req.params.notebookId)
          .andWhereRaw("query @@ body_search")
          .orderByRaw("ts_rank_cd(body_search, query) DESC")
        break
      default:
        // for some reason prepared statements don't fucking work
        items = (await Item.raw(`
        WITH RECURSIVE cte AS (
          SELECT id, parent_id, position, body, completed, important, due, 0 AS depth
            FROM items
            WHERE notebook_id = ${req.params.notebookId}
            AND parent_id IS NULL
            ${req.params.showCompleted ? "" : "AND completed = false"}
          UNION ALL
          SELECT i.*, cte.depth + 1
            FROM items i
            JOIN cte
            ON i.parent_id = cte.id
        )
        SELECT *
          FROM cte
          ORDER BY depth, position ${sort}`)).rows
    }

    res.send(items)
  })
  // create an item belonging to a notebook
  .post("/", async (req, res) => {
    const item = await Item.query()
      .insert(Object.assign(req.body, { notebook_id: req.params.notebookId }))
      .pick([
        "id",
        "parent_id",
        "position",
        "body",
        "completed",
        "important",
        "due"
      ])

    res.status(201).send(item)
  })
  // modify the item
  .patch("/:itemId", async (req, res) => {
    await req.ensureItemBelongsToNotebook()
    const item = await Item.query()
      .patchAndFetchById(req.params.itemId, req.body)
      .pick([
        "id",
        "parent_id",
        "position",
        "body",
        "completed",
        "important",
        "due"
      ])

    res.send(item)
  })
  .delete("/:itemId", async (req, res) => {
    await req.ensureItemBelongsToNotebook()
    await Item.query().deleteById(req.params.itemId)

    res.sendStatus(204)
  })
