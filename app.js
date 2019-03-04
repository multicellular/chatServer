const Koa = require('koa')
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const session = require('koa-session-minimal')
const MysqlStore = require('koa-mysql-session')
const logger = require('koa-logger')
const jwtKoa = require('koa-jwt')
const index = require('./routes/index')
const user = require('./routes/user')
const blog = require('./routes/blog')
const room = require('./routes/room')
const config = require('./config/default')

const app = new Koa()
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

const urls = ['/api/user/signin', '/api/user/signup', /^\/api\/blog/];
app.use(jwtKoa({ secret: 'my_token' , passthrough:true }).unless({ path: urls }))

app.use(views(__dirname + '/views', {
  extension: 'pug'
  // extension: 'html'
}))
app.use(session({
  key: 'USER_SID',
  store: new MysqlStore({
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    host: config.database.HOST
  })
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(blog.routes(), user.allowedMethods())
app.use(room.routes(), room.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
