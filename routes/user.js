// const router = require('koa-router')()

// router.prefix('/users')

// router.get('/', function (ctx, next) {
//   ctx.body = 'this is a users response!'
// })

// router.get('/bar', function (ctx, next) {
//   ctx.body = 'this is a users/bar response'
// })

// module.exports = router

const router = require('koa-router')()
const userApi = require('./user.api')

router.prefix('/api/user')

router.post('/create', userApi.createUser)

router.get('/login', userApi.getUser)

router.post('/createRoom', userApi.createRoom)

module.exports = router
