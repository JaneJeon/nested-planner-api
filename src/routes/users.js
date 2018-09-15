const router = require("express").Router(),
  User = require("../models/user")

module.exports = router
  // create user
  .post("/", async (req, res) => {
    const user = await User.query().insert(req.body)

    req.login(user, () => res.sendStatus(201))
  })
  .use((req, res, next) => {
    if (!req.user) res.sendStatus(401)
    next()
  })
  // update user info
  .patch("/", async (req, res) => {
    await User.query()
      .patch(req.body)
      .where("id", req.user.id)

    res.end()
  })
  // close account
  .delete("/", async (req, res) => {
    await User.query().deleteById(req.user.id)

    req.logout()
    res.end()
  })
