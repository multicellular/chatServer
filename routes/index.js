const router = require('koa-router')()
const fs = require('fs')

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

// router.post('/uploadImage', async (ctx, next) => {
//   let {image} = ctx.request.body;
//   if (!image) {
//     ctx.body = {
//       code: -1,
//       msg: 'image is null'
//     }
//     return;
//   }
//   let base64Data, dataBuffer, urlPath;
//   base64Data = image.replace(/^data:image\/\w+;base64,/, "");
//   dataBuffer = Buffer.from(base64Data, 'base64');
//   urlPath = 'images/' + Date.now() + '.png';
//   await fs.writeFile('./public/' + urlPath, dataBuffer, (err, data) => {
//     if (err) {
//       throw err;
//     }
//   });
//   ctx.body = {
//     code: 0,
//     image: urlPath
//   }
// })

router.post('/api/uploadFile', async (ctx, next) => {

  const file = ctx.request.files.file || [];

  let fileObjArr = [];
  let fileStr;
  if (file.length > 0) {
    let fileStrArr = [];
    file.forEach(item => {
      const path = item.path ? item.path.split('public/')[1] : '';
      fileObjArr.push({
        name: item.name,
        path: path
      });
      fileStrArr.push(path);
    });
    fileStr = fileStrArr.join(',');
  } else {
    const path = file.path ? file.path.split('public/')[1] : '';
    fileObjArr = [{ name: file.name, path }]
    fileStr = path;
  }
  // const file = ctx.request.files.file;
  // if (!file) {
  //   ctx.body = {
  //     code: -1,
  //     msg: 'file is null'
  //   }
  //   return;
  // }
  // const render = fs.createReadStream(file.path);
  // const filePath = './public/files/' + file.name;
  // const upStream = fs.createWriteStream(filePath);
  // render.pipe(upStream);

  // ctx.body = {
  //   code: 0,
  //   image: filePath
  // }
  ctx.body = {
    code: 0,
    files: fileObjArr,
    urls: fileStr
  };
})

module.exports = router
