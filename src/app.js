require("dotenv").config()

const { Model } = require("objection"),
  passport = require("passport"),
  { Strategy } = require("passport-local"),
  User = require("./models/user"),
  session = require("express-session"),
  RedisStore = require("connect-redis")(session),
  express = require("express"),
  parser = require("body-parser"),
  { wrapError, DBError } = require("db-errors")

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
  .use((req, res, next) => {
    req.ensureUserIsSignedIn = function(next) {
      if (this.isUnauthenticated()) throw { code: 401 }
      next()
    }
    res.check = function(obj, code) {
      if (!obj) throw { code: 404 }
      if (code) this.status(code).send(obj)
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
    err = wrapError(err)

    switch (err.name) {
      case "DataError":
      case "NotNullViolationError":
      case "CheckViolationError":
      case "ValidationError":
        return res.status(400).send({ error: err.message })
      case "UniqueViolationError":
        return res.status(409).send({ error: `${err.columns} already exist` })
      default:
        if (err instanceof DBError && err.nativeError.code == "22P02")
          return res
            .status(400)
            .send({ error: "path parameter(s) must be integer" })
        if (err.code > 400 && err.code < 500) return res.sendStatus(err.code)
    }

    console.error(err)
    res.sendStatus(500)
  })
  .listen(process.env.PORT, err => {
    if (err) console.error(err)
  })

module.exports = app
