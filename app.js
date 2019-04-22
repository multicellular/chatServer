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
const route = require('koa-route');
const websockify = require('koa-websocket');
let user_client = {}; // 用户登录 user bind client {uid: client}
let room_users = {}; // users bind room {roomid: users}
let chat_clients = {}; //加入对话房间 chat user client {chatid:{uid1:client1,uid2:client2},...}
let room_clients = {}; //加入对话房间 room user client {croomid:{uid1:client1,uid2:client2},...}
let offlineMsgs = []; // 离线发送？？
let socketApp = websockify(new Koa());
// Regular middleware
// Note it's app.ws.use and not app.use
socketApp.ws.use(function (ctx, next) {
  // return `next` to pass the context (ctx) on to the next ws middleware
  return next(ctx);
});
// Using routes /connect/uid
socketApp.ws.use(route.all('/connect/:connectid', async (ctx, connectid) => {
  // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
  // the websocket is added to the context on `ctx.websocket`.
  const client = ctx.websocket;
  client.on('message', function (message) {
    // 发送消息给服务器
    if (message === 'connect') {
      var temps = [];
      user_client[connectid] = client;
      if (offlineMsgs.length > 0) {
        // 离线消息（未发出的消息）上线后发出
        for (let i = 0; i < offlineMsgs.length; i++) {
          const offMsg = offlineMsgs[i];
          if (offMsg.toid == connectid) {
            client.send(JSON.stringify(offMsg.msg));
          } else {
            temps.push(offMsg);
          }
        }
        offlineMsgs = temps;
      }
    } else if (message === 'disconnect') {
      delete user_client[connectid];
    } else {
      try {
        // 处理好友申请。视频通话等公共消息
        const msg = JSON.parse(message);
        msg.moment = Date.now().toString();
        if (user_client[msg.toid]) {
          // 是否app在线
          user_client[msg.toid].send(JSON.stringify(msg));
        }
      } catch (error) {
        console.log(error);
      }
    }
  })

  client.on('close', () => {
    delete user_client[connectid];
  })

  client.on('open', () => {
    var temps = [];
    user_client[connectid] = client;
    if (offlineMsgs.length > 0) {
      // 离线消息（未发出的消息）上线后发出
      for (let i = 0; i < offlineMsgs.length; i++) {

        const offMsg = offlineMsgs[i];
        if (offMsg.toid == connectid) {
          client.send(JSON.stringify(offMsg.msg));
        } else {
          temps.push(offMsg);
        }
      }
      offlineMsgs = temps;
    }
  })

}));

// Using routes /chat/toid
socketApp.ws.use(route.all('/chat/:roomid/:sendid', async (ctx, roomid, sendid) => {

  // 私聊房间 ,对话
  const client = ctx.websocket;
  client.on('message', function (message) {
    if (message === 'join') {
      if (!chat_clients[roomid]) {
        chat_clients[roomid] = {};
      }
      chat_clients[roomid][sendid] = client;
    } else if (message === 'leave') {
      delete chat_clients[roomid][sendid];
    } else {
      try {
        const msg = JSON.parse(message);
        msg.moment = Date.now().toString();
        msg.sendid = +sendid;
        msg.roomid = +roomid;
        if (msg.toid != sendid) {
          // 给需要发送的对象（toid）
          if (chat_clients[roomid] && chat_clients[roomid][msg.toid]) {
            // 是否在房间
            chat_clients[roomid][msg.toid].send(JSON.stringify(msg));
          } else if (user_client[msg.toid]) {
            // 是否app在线
            user_client[msg.toid].send(JSON.stringify(msg));
          } else {
            // 存储离线消息
            offlineMsgs.push({ toid: msg.toid, msg });
          }
        }
        // 给发送者
        client.send(JSON.stringify(msg));
      } catch (error) {
        console.log(error);
      }
    }
  })

  client.on('close', () => {
    if (chat_clients[roomid]) {
      delete chat_clients[roomid][sendid];
    }
  })

  // client.on('open', () => {
  //   if (!chat_clients[roomid]) {
  //     chat_clients[roomid] = {};
  //   }
  //   chat_clients[roomid][sendid] = client;
  // })

}));
// Using routes /room/roomid
socketApp.ws.use(route.all('/room/:roomid/:sendid', async (ctx, roomid, sendid) => {

  // 房间查询用户列表
  if (!room_users[roomid]) {
    const model = require('./lib/mysql');
    const users = await model.findUsrsByRoom(roomid);
    room_users[roomid] = users;
  }
  const client = ctx.websocket;
  client.on('message', function (message) {
    if (message === 'join') {
      if (!room_clients[roomid]) {
        room_clients[roomid] = {};
      }
      room_clients[roomid][sendid] = client;
    } else if (message === 'leave') {
      delete room_clients[roomid][sendid];
    } else {
      try {
        const msg = JSON.parse(message);
        msg.moment = Date.now().toString();
        msg.sendid = +sendid;
        msg.roomid = +roomid;
        // 房间
        for (user in room_users[roomid]) {
          if (room_clients[roomid] && room_clients[roomid][user.uid]) {
            // 房间成员是否在房间里 room_clients[roomid]
            room_clients[roomid][user.uid].send(JSON.stringify(msg));
          }
          else if (user_client[user.uid]) {
            // 房间成员是否在app里 user_client
            user_client[user.uid].send(JSON.stringify(msg));
          } else {
            offlineMsgs.push({ toid: user.uid, msg });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  })

  client.on('close', () => {
    if (room_clients[roomid]) {
      delete room_clients[roomid][msg.sendid];
    }
  })

  // client.on('open', () => {
  //   if (!room_clients[roomid]) {
  //     room_clients[roomid] = {};
  //   }
  //   room_clients[roomid][sendid] = client;
  // })

}));
socketApp.listen(3001);

module.exports = app
