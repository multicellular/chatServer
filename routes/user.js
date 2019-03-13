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
            const user = await userModel.insertUser([name, md5(password), urlPath]);
            // name=?,row_desc=?,uid=?
            const friends = await userModel.insertFriendRoom([user.insertId, '好友列表', null]);
            // flist_id=?,uremark=?,uid=?
            await userModel.insertFriend({ flist_id: friends.insertId, uid: user.insertId });
            ctx.body = {
                code: 0,
                user: user
            }
        }
    });

});

router.post('/signin', async (ctx, next) => {
    const { name, password } = ctx.request.body;
    await userModel.findUserByName(name).then(result => {
        if (result[0] && result[0].password === md5(password)) {
            const payload = {
                id: result[0].id,
                name: result[0].name
            };
            const my_token = jwt.sign(payload, 'my_token', { expiresIn: '24h' });
            ctx.body = {
                code: 0,
                token: my_token,
                user: {
                    id: result[0].id,
                    name: result[0].name,
                    avator: result[0].avator,
                    bio: result[0].bio,
                }
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
        try {
            payload = await verify(authorization.split(' ')[1], 'my_token');
        } catch (err) {
            ctx.body = {
                code: -1,
                msg: 'token expired'
            }
            return;
        }
        const result = await userModel.findUserByName(payload.name);
        if (result && result[0]) {
            ctx.body = {
                code: 0,
                user: {
                    id: result[0].id,
                    name: result[0].name,
                    avator: result[0].avator,
                    bio: result[0].bio,
                }
            }
        } else {
            ctx.body = {
                code: -1,
                msg: 'no user'
            }
        }

    } else {
        ctx.body = {
            code: -1,
            msg: 'no token'
        }
    }
});

router.post('/modifyBio', async (ctx, next) => {
    const { userid, bio } = ctx.request.body;
    await userModel.updateUserBio({ userid, bio }).then(() => {
        ctx.body = {
            code: 0
        }
    });
});

module.exports = router

