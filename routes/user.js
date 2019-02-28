const router = require('koa-router')()
const userModel = require('../lib/mysql')
const fs = require('fs')
const md5 = require('md5')
const jwt = require('jsonwebtoken')

const verify = (...args) => {
    return new Promise((resolve, reject) => {
        jwt.verify(...args, (err, decoded) => {
            err ? reject(err) : resolve(decoded);
        });
    });
}

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
                code: -1,
                msg: '用户已经存在！'
            }
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
            const payload = {
                id: result[0].id,
                name: result[0].name,
                avator: result[0].avator
            };
            const my_token = jwt.sign(payload, 'my_token', { expiresIn: '24h' });
            ctx.body = {
                code: 0,
                token: my_token,
                user: payload
            }
        } else {
            ctx.body = {
                code: -1,
                msg: '账号或密码错误！'
            }
        }
    }).catch(err => console.log(err));
});

router.get('/info', async (ctx, next) => {
    const { authorization } = ctx.header;
    let payload;
    if (authorization) {
        payload = await verify(authorization.split(' ')[1], 'my_token');
        ctx.body = {
            code: 0,
            user: payload
        }
    } else {
        ctx.body = {
            code: -1,
            msg: 'no token'
        }
    }
});

module.exports = router
