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

router.post('/uploadImage', async (ctx, next) => {
  let image = ctx.request.body;
  if (!image) {
    ctx.body = {
      code: -1,
      msg: 'image is null'
    }
    return;
  }
  let base64Data, dataBuffer, urlPath;
  base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  dataBuffer = Buffer.from(base64Data, 'base64');
  urlPath = 'images/' + Date.now() + '.png';
  await fs.writeFile('./public/' + urlPath, dataBuffer, (err, data) => {
    if (err) {
      throw err;
    }
  });
  ctx.body = {
    code: 0,
    image: urlPath
  }
})

module.exports = router
