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

// mock oauth

// login-app server
router.get('/api/login/rfinex', async (ctx, next) => {
  // from login-app page
  const {} = ctx.request.query
  const redirect_uri = 'https://www.iconfont.cn/api/login/github/callback&state=123123sadh1as12';
  const client_id = 'bfe378e98cde9624c98c';
  // to rfinex server_api
  ctx.redirect(`http://localhost:3000/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`);
});

// rfinex server
router.get('/login/oauth/authorize', async (ctx, next) => {
  // from login-app server
  const is_session = false;
  if (is_session) {
    // to login-app server
    const code = 'getcodefn()';
    ctx.redirect(`/api/login/rfinex/callback?code=${code}`);
  } else {
    // to rfinex page
    const { redirect_uri, client_id } = ctx.request.query;
    const return_to = `/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}`;
    ctx.redirect(`http://localhost:3001/login?client_id=${client_id}&return_to=${return_to}`);
  }
});

// rfinex server
router.get('/api/rfinex_session', async (ctx, next) => {
  // from rfinex (login) page
  const {return_to} =  ctx.request.query;
  const session = true;
  if(session) {
    // to finex server (/login/oauth/authorize) again with rfinex_session
    ctx.redirect.redirect(return_to);
  } else {
    ctx.body = {
      msg: 'login error'
    }
  }
});

// rfinex server
router.get('/api/rfinex_session', async (ctx, next) => {
  // from rfinex (login) page
  const {return_to} =  ctx.request.query;
  const session = true;
  if(session) {
    // to finex server (/login/oauth/authorize) again with rfinex_session
    ctx.redirect.redirect(return_to);
  } else {
    ctx.body = {
      msg: 'login error'
    }
  }
})

// login-app server
router.get('/api/login/rfinex/callback', async (ctx, next) => {
  // from rfinex server
  const {code} = ctx.request.query;
  // go rfinex oauth server code -> access_token -> user info
  const is_success = `getInfoWidthCode(${code})`;
  if (is_success) {
    // to login-app home
    ctx.redirect('/');
  } else {
    ctx.body = {
      msg: 'code error'
    }
  }

})


// mock oauth

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
