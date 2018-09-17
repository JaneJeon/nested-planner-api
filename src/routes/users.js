const { Router } = require("express"),
  User = require("../models/user")

module.exports = Router()
  // create user
  .post("/", async (req, res) => {
    const user = await User.query().insert(req.body)

    req.login(user, () => res.sendStatus(204))
  })
  .use((req, res, next) => {
    req.ensureUserIsSignedIn()
    next()
  })
  // update user info
  .patch("/", async (req, res) => {
    await User.query()
      .patch(req.body)
      .where("id", req.user.id)

    res.sendStatus(204)
  })
  // close account
  .delete("/", async (req, res) => {
    await User.query().deleteById(req.user.id)

    req.logout()
    res.sendStatus(204)
  })
