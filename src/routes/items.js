const { Router } = require("express"),
  { raw } = require("objection")

module.exports = Router({ mergeParams: true })
  .use((req, res, next) => req.ensureUserIsSignedIn(next))
  // get all items belonging to a notebook, sorted and nested
  .get("/", async (req, res) => {
    let items
    const notebook = await req.user
        .$relatedQuery("notebooks")
        .findById(req.params.notebookId),
      sort = (req.query.sort || "").toUpperCase() == "DESC" ? "DESC" : "ASC",
      showCompleted = req.query.showCompleted == "true"

    res.check(notebook)

    switch (req.query.view) {
      case "focus":
        items = await notebook
          .$relatedQuery("items")
          .select("id", "position", "body", "completed", "important", "due")
          .where("completed", false)
          .andWhere("important", true)
          .orderBy("position", sort)
        break
      case "todo":
        items = await notebook
          .$relatedQuery("items")
          .select("id", "position", "body", "completed", "important", "due")
          .where("completed", false)
          .andWhere(raw("due IS NOT NULL"))
          .orderBy("due", sort)
        break
      case "search":
        items = await notebook
          .$relatedQuery("items")
          .select("id", "position", "body", "completed", "important", "due")
          .from(raw("items, plainto_tsquery(?) query", req.query.q)) // is this really going to work?
          .whereRaw("query @@ body_search")
          .orderByRaw("ts_rank_cd(body_search, query) DESC")
        break
      default:
        items = await notebook
          .$relatedQuery("items")
          .where("parent_id", null)
          .eager("children.^")
          .modifyEager("children.^", builder => {
            showCompleted ? builder : builder.where("completed", false)
            builder.orderBy("position")
          })
          .pick([
            "id",
            "parent_id",
            "children",
            "position",
            "body",
            "completed",
            "important",
            "due"
          ])
    }

    res.check(items, 200)
  })
  // create an item belonging to a notebook
  .post("/", async (req, res) => {
    const notebook = await req.user
      .$relatedQuery("notebooks")
      .findById(req.params.notebookId)

    res.check(notebook)

    const item = await notebook.$relatedQuery("items").insert(req.body)

    res.status(201).send({ id: item.id, position: item.position })
  })
  // modify the item
  .patch("/:itemId", async (req, res) => {
    const notebook = await req.user
      .$relatedQuery("notebooks")
      .findById(req.params.notebookId)

    res.check(notebook)

    const item = await notebook
      .$relatedQuery("items")
      .patchAndFetchById(req.params.itemId, req.body)

    res.check(item, 204)
  })
  .delete("/:itemId", async (req, res) => {
    const notebook = await req.user
      .$relatedQuery("notebooks")
      .findById(req.params.notebookId)

    res.check(notebook)

    const deleted = await notebook
      .$relatedQuery("items")
      .deleteById(req.params.itemId)

    res.check(deleted, 204)
  })
