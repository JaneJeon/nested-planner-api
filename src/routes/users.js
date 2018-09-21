const { Router } = require("express"),
  User = require("../models/user")

module.exports = Router()
  // create user
  .post("/", async (req, res) => {
    const user = await User.query().insert(req.body)

    req.login(user, () => res.sendStatus(201))
  })
  .use((req, res, next) => req.ensureUserIsSignedIn(next))
  // update user info
  .patch("/", async (req, res) => {
    await req.user.$query().patch(req.body)

    res.sendStatus(204)
  })
  // close account
  .delete("/", async (req, res) => {
    await req.user.$query().delete()

    req.logout()
    res.sendStatus(204)
  })
