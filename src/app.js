require("dotenv").config()

const { Model } = require("objection"),
  passport = require("passport"),
  { Strategy } = require("passport-local"),
  User = require("./models/user"),
  Notebook = require("./models/notebook"),
  Item = require("./models/item"),
  session = require("express-session"),
  RedisStore = require("connect-redis")(session),
  express = require("express"),
  parser = require("body-parser")

require("express-async-errors")

Model.knex(require("knex")(require("../knexfile")))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) =>
  done(null, await User.query().findById(id))
)

passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    const user = await User.query().findOne({ email })
    return user && (await user.verifyPassword(password))
      ? done(null, user)
      : done(null, false)
  })
)

const app = express()
  .use(require("helmet")())
  .use(require("cors")())
  .use(parser.json())
  .use(parser.urlencoded({ extended: false }))
  .use(
    session({
      secret: process.env.SESSION_SECRET,
      store: new RedisStore({ url: process.env.REDIS_URL }),
      resave: false,
      saveUninitialized: false
    })
  )
  .use(passport.initialize())
  .use(passport.session())
  // helper middlewares
  .use((req, res, next) => {
    if (req.body.hasOwnProperty("id"))
      throw { code: 400, message: "Cannot set property 'id'" }
    if (req.body.hasOwnProperty("user_id"))
      throw { code: 400, message: "Cannot set property 'user_id'" }
    if (req.body.hasOwnProperty("notebook_id"))
      throw { code: 400, message: "Cannot set property 'notebook_id'" }

    req.ensureUserIsSignedIn = function() {
      if (!this.user) throw { code: 401 }
    }
    req.ensureNotebookBelongsToUser = async function() {
      const notebook = await Notebook.query().findById(this.params.notebookId)

      if (!notebook) throw { code: 404 }
      if (this.user.id != notebook.user_id) throw { code: 403 }
    }
    req.ensureItemBelongsToNotebook = async function() {
      const item = await Item.query().findById(this.params.itemId)

      if (!item) throw { code: 404 }
      if (this.params.notebookId != item.notebook_id) throw { code: 403 }
    }

    next()
  })
  .use("/sessions", require("./routes/sessions"))
  .use("/users", require("./routes/users"))
  .use("/notebooks", require("./routes/notebooks"))
  .use("/notebooks/:notebookId/items", require("./routes/items"))

if (process.env.NODE_ENV == "test")
  app
    .post("/", (req, res) => res.end())
    .get("/error", () => {
      throw new Error()
    })
    .get("/test", (req, res) => {
      req.ensureUserIsSignedIn()
      res.end()
    })
    .get("/test/:notebookId", async (req, res) => {
      await req.ensureNotebookBelongsToUser()
      res.end()
    })
    .get("/test/:notebookId/:itemId", async (req, res) => {
      await req.ensureItemBelongsToNotebook()
      res.end()
    })

app
  .use("*", (req, res) => res.sendStatus(404))
  .use((err, req, res, next) => {
    if (err.name == "ValidationError" || err.code == 400)
      return res.status(400).send({ error: err.message })
    else if (err.code > 400 && err.code < 500) return res.sendStatus(err.code)
    // someone intentionally passed in invalid id types into path parameters
    else if (err.code == "22P02")
      return res
        .status(400)
        .send({ error: err.message.substr(err.message.indexOf("invalid")) })
    // unique constraint violation
    else if (err.code == 23505)
      return res.status(409).send({ error: err.detail })

    if (process.env.NODE_ENV != "test") console.error(err)
    res.sendStatus(500)
  })
  .listen(process.env.PORT, err => {
    if (err) console.error(err)
  })

module.exports = app
