const Koa = require('koa')
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
// const bodyparser = require('koa-bodyparser')
const koaBody = require('koa-body')
const session = require('koa-session-minimal')
const MysqlStore = require('koa-mysql-session')
const logger = require('koa-logger')
const jwtKoa = require('koa-jwt')
const fs = require('fs')
const path = require('path')
const index = require('./routes/index')
const user = require('./routes/user')
const blog = require('./routes/blog')
const room = require('./routes/room')
const config = require('./config/default')

const app = new Koa()
// error handler
onerror(app)

// middlewares  bodyparser
// app.use(bodyparser({
//   enableTypes: ['json', 'form', 'text']
// }))

// middlewares  bodyparser
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, 'public/files/'),
    keepExtensions: true,
    maxFieldsSize: 10 * 1024 * 1024,
    onFileBegin: (name, file) => {
      const fp = path.join(__dirname, 'public/files/');
      if (!fs.existsSync(fp)) {
        fs.mkdirSync(fp);
      }
    }
  }
}));
// app.use(ctx => {
//   ctx.body = JSON.stringify(ctx.request.body);
// });

app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

const urls = ['/api/user/signin', '/api/user/signup', /^\/api\/blog/];
app.use(jwtKoa({ secret: 'my_token', passthrough: true }).unless({ path: urls }))

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

// koa封装的websocket这是官网（很简单有时间去看一下https://www.npmjs.com/package/koa-websocket）
const websockify = require('koa-websocket')
let socketApp = websockify(new Koa());
socketApp.listen(3001);
let chat_client = {}; // uid或roomid bind client
let offlineMsgs = []; // 离线发送？？
socketApp.ws.use(async (ctx, next) => {

  const client = ctx.websocket;
  client.on('message', function (msg) {
    try {
      const message = JSON.parse(msg);
      if (message.type == 'server') {
        // 发送消息给服务器
        if (message.content == 'connect') {
          chat_client[message.sendid] = client;
          if (offlineMsgs.length > 0) {
            // 离线消息（未发出的消息）上线后发出
            for (let i = 0; i < offlineMsgs.length; i++) {
              const offMsg = offlineMsgs[i];
              if (offMsg.chatid == message.sendid) {
                client.send(JSON.stringify(offMsg));
              }
            }
          }
        }
        if (message.content == 'disconnect') {
          delete chat_client[message.sendid];
        }
      } else if (message.chatid) {
        // 返回给客户端的数据
        message.moment = Date.now().toString();
        if (chat_client[message.chatid]) {
          // 给需要发送的对象（chatid）
          chat_client[message.chatid].send(JSON.stringify(message));
          // 给发送者反馈
          client.send(JSON.stringify(message));
        } else {
          offlineMsgs.push(message);
          // 给发送者反馈
          client.send(JSON.stringify(message));
        }
      }
    } catch (error) {
      console.log(error);
    }
  })

})

module.exports = app
