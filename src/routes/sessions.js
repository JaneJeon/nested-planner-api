const { Router } = require("express"),
  passport = require("passport")

module.exports = Router()
  // login
  .post("/", passport.authenticate("local"), (req, res) => res.sendStatus(204))
  // logout
  .delete("/", (req, res) => {
    req.logout()
    res.sendStatus(204)
  })
