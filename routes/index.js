const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    userId: 'sign'
  })
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

router.get('/index', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
