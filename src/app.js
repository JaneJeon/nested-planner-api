require("dotenv").config()

const { Model, ValidationError } = require("objection"),
  passport = require("passport"),
  { Strategy } = require("passport-local"),
  User = require("./models/user"),
  session = require("express-session"),
  RedisStore = require("connect-redis")(session),
  express = require("express"),
  parser = require("body-parser"),
  {
    wrapError,
    DBError,
    CheckViolationError,
    DataError,
    NotNullViolationError,
    UniqueViolationError
  } = require("db-errors")

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
      if (code)
        typeof obj == "object"
          ? this.status(code).send(obj)
          : this.sendStatus(code)
    }
    next()
  })
  .use("/sessions", require("./routes/sessions"))
  .use("/users", require("./routes/users"))
  .use("/notebooks", require("./routes/notebooks"))
  .use("/notebooks/:notebookId/items", require("./routes/items"))

if (process.env.NODE_ENV == "test")
  app
    .get("/", (req, res) => res.end())
    .get("/error", () => {
      throw new Error()
    })
    .post("/check", (req, res) => {
      res.check(req.body.foo, req.body.code)
      res.end()
    })
    .get("/restricted", (req, res, next) => {
      req.ensureUserIsSignedIn(next)
      res.end()
    })

app
  .use("*", (req, res) => res.sendStatus(404))
  .use((err, req, res, next) => {
    err = wrapError(err)

    if (
      err instanceof ValidationError ||
      err instanceof DataError ||
      err instanceof NotNullViolationError ||
      err instanceof CheckViolationError
    )
      return res.status(400).send({ error: err.message })
    else if (err instanceof UniqueViolationError)
      return res.status(409).send({ error: `${err.columns} already exist` })
    else if (err instanceof DBError && err.nativeError.code == "22P02")
      return res.status(400).send({ error: "path parameters must be integer" })
    else if (err.code > 400 && err.code < 500) return res.sendStatus(err.code)
    else if (err.message.startsWith("Empty .update() call detected"))
      return res.status(400).send({ error: "request body cannot be empty" })

    if (process.env.NODE_ENV != "test") console.error(err)
    res.sendStatus(500)
  })
  .listen(process.env.PORT, err => {
    if (err) console.error(err)
  })

module.exports = app
