require("dotenv").config()

const { Model } = require("objection"),
  passport = require("passport"),
  { Strategy } = require("passport-local"),
  User = require("./models/user"),
  winston = require("winston"),
  session = require("express-session"),
  RedisStore = require("connect-redis")(session),
  express = require("express")

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

const log = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      handleExceptions: true,
      format: winston.format.simple()
    })
  ]
})

if (process.env.NODE_ENV == "development")
  log.add(new winston.transports.Console({ format: winston.format.simple() }))
else if (process.env.NODE_ENV == "production")
  log.add(
    new winston.transports.File({
      filename: "logs/access.log",
      format: winston.format.simple()
    })
  )

const app = express()
  .use(require("helmet")())
  .use(require("cors")())
  .use(require("body-parser").json())
  .use(
    require("morgan")(process.env.LOG_FORMAT, {
      stream: { write: msg => log.info(msg.slice(0, -1)) }
    })
  )
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
  .use("/sessions", require("./routes/sessions"))
  .use("/users", require("./routes/users"))
  .use("/notebooks", require("./routes/notebooks"))
  .use("/items", require("./routes/items"))

if (process.env.NODE_ENV == "test")
  app.get("/error", () => {
    throw new Error()
  })

app
  .use("*", (req, res) => res.sendStatus(404))
  .use((err, req, res, next) => {
    if (err.name == "ValidationError")
      return res.status(400).send({ error: err.message })
    else if (
      err.code == "42703" || // undefined column
      err.code == "22P02" || // wrong data type
      err.message.includes("Empty .update() call detected!")
    )
      return res.sendStatus(400)
    // unique field violation
    else if (err.code == "23505") return res.sendStatus(409)

    log.error(err)
    res.sendStatus(500)
  })
  .listen(process.env.PORT, err => {
    if (err) log.error(err)
  })

module.exports = app
