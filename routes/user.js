const router = require('koa-router')()
const userModel = require('../lib/mysql')
const fs = require('fs')
const md5 = require('md5')

router.prefix('/api/user')

router.post('/signup', async (ctx, next) => {
    const { name, password, avator } = ctx.request.body;
    await userModel.findUserByName(name).then(async (result) => {
        if (result.length) {
            try {
                throw Error('用户已经存在')
            } catch (error) {
                //处理err
                console.log(error)
            }
            ctx.body = {
                data: '0'
            };
        } else {
            let base64Data = avator.replace(/^data:image\/\w+;base64,/, "");
            let dataBuffer = Buffer.from(base64Data, 'base64');
            let urlPath = 'avators/' + Date.now() + '.png';
            await fs.writeFile('./public/' + urlPath, dataBuffer, err => { if (err) throw err; });
            await userModel.insertUser([name, md5(password), urlPath]).then(res => { ctx.body = res });
        }
    });

});

router.post('/signin', async (ctx, next) => {
    const { name, password } = ctx.request.body;
    await userModel.findUserByName(name).then(result => {
        console.log(result);
        if (result[0] && result[0].password === md5(password)) {
            ctx.body = {
                data: true,
                user: { avator: result[0].avator, name: result[0].name, id: result[0].id }
            }
        } else {
            ctx.body = {
                data: false
            }
        }
    }).catch(err => console.log(err));
});

module.exports = router
