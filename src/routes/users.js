const router = require("express").Router(),
  User = require("../models/user")

module.exports = router
  // create user
  .post("/", async (req, res, next) => {
    try {
      const user = await User.query().insert(req.body)
      req.login(user, () => res.sendStatus(201))
    } catch (err) {
      err.code == 23505
        ? res.status(409).send({ error: "Email address is already taken" })
        : next(err)
    }
  })
  .use((req, res, next) => {
    if (!req.user) res.sendStatus(401)
    next()
  })
  // update user info
  .patch("/", async (req, res, next) => {
    try {
      await User.query()
        .update(req.body)
        .where("id", req.user.id)
      res.end()
    } catch (err) {
      next(err)
    }
  })
  .use((err, req, res, next) => res.sendStatus(400))
  // close account
  .delete("/", async (req, res, next) => {
    try {
      await User.query().deleteById(req.user.id)
      req.logout()
      res.end()
    } catch (err) {
      next(err)
    }
  })
