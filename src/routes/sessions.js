const router = require("express").Router(),
  passport = require("passport")

module.exports = router
  // login
  .post("/", passport.authenticate("local"), (req, res) =>
    res.status(201).send({ username: req.user.username })
  )
  // logout
  .delete("/", (req, res) => {
    req.logout()
    res.end()
  })
