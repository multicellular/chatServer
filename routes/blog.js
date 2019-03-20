const router = require('koa-router')()
const blogModel = require('../lib/mysql')
const fs = require('fs')

router.prefix('/api/blog');

router.get('/getblogs', async (ctx, next) => {
    await blogModel.findAllBlogs().then(result => {
        const blogs = result.map((item) => {
            const { title, content, media_urls, media_type, uavator, uname, uid, ubio, id, source_uname, comments,
                views, forwards, source_uid, source_uavator, forward_comment, source_id, source_ubio, moment } = item;
            return {
                title, content, media_urls, media_type, uavator, uname, uid, id, comments, views, forwards, moment, ubio,
                forwardObj: { source_uname, source_uid, source_uavator, forward_comment, source_id, source_ubio }
            }
        });

        ctx.body = {
            code: 0,
            blogs
        }
    }).catch(err => console.log(err));
});

router.get('/getBlogsByUser', async (ctx, next) => {
    const { uid } = ctx.request.query;
    await blogModel.findBlogsByUser(uid).then(result => {
        const blogs = result.map((item) => {
            const { title, content, media_urls, media_type, uavator, uname, uid, ubio, id, source_uname, comments, views, forwards,
                source_uid, source_uavator, forward_comment, source_id, source_ubio, moment, is_private } = item;
            return {
                title, content, media_urls, media_type, uavator, uname, uid, id, comments, views, forwards, moment, ubio, is_private,
                forwardObj: { source_uname, source_uid, source_uavator, forward_comment, source_id, source_ubio }
            }
        });

        ctx.body = {
            code: 0,
            blogs
        }
    }).catch(err => console.log(err));
});

router.get('/getcomments', async (ctx, next) => {
    const { blogid } = ctx.request.query;
    await blogModel.findAllBlogComments(blogid).then(result => {
        ctx.body = {
            code: 0,
            comments: result
        }
    }).catch(err => console.log(err));
});

router.post('/postblog', async (ctx, next) => {
    const { title, content, media_urls, media_type, uid, forward_comment, source_id, is_private } = ctx.request.body;
    // let imageUrlsStr;
    if (source_id) {
        // 转发blog
        blogModel.findBlogById(source_id).then((result) => {
            const forwards = parseInt(result[0]['forwards']) + 1;
            blogModel.unpdateBlogForwards([forwards, source_id]);
        });
    }
    // else {
    //     // 上传的图片为base64格式，先存储图片，在存储路径
    //     let imageUrls = [];
    //     const len = images.length;
    //     let image, base64Data, dataBuffer, urlPath;
    //     for (let i = 0; i < len; i++) {
    //         image = images[i];
    //         base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    //         dataBuffer = Buffer.from(base64Data, 'base64');
    //         urlPath = 'images/' + Date.now() + '.png';
    //         await fs.writeFile('./public/' + urlPath, dataBuffer, (err, data) => {
    //             if (err) {
    //                 throw err;
    //             }
    //         });
    //         imageUrls.push(urlPath);
    //     }
    //     imageUrlsStr = imageUrls.join(',');
    // }
    const result = await blogModel.insertBlog({
        title, content, media_urls, media_type,
        uid, forward_comment, source_id, is_private: is_private ? 1 : 0
    });
    const blogs = await blogModel.findBlogById(result.insertId);

    const { uavator, uname, ubio, id, source_uname, comments, views, forwards,
        source_uid, source_uavator, source_ubio, moment } = blogs[0];
    ctx.body = {
        code: 0,
        blog: {
            title: blogs[0].title, content: blogs[0].content, media_urls: blogs[0].media_urls, media_type: blogs[0].media_type,
            uavator, uname, uid: blogs[0].uid, id, comments, views, forwards, moment, ubio,
            forwardObj: {
                source_uname, source_uid, source_uavator,
                forward_comment: blogs[0].forward_comment, source_id: blogs[0].source_id, source_ubio
            }
        }
    }
});

router.post('/postcomment', async (ctx, next) => {
    const { blogid, content, uid } = ctx.request.body;
    await blogModel.insertComment([blogid, content, uid]).then(async result => {
        blogModel.findBlogById(blogid).then((res) => {
            const comments = parseInt(res[0]['comments']) + 1;
            blogModel.unpdateBlogComments([comments, blogid]);
        });
        ctx.body = {
            code: 0,
            comment: { blogid, content, uid, id: result.insertId }
        }
    }).catch(err => console.log(err));
});

module.exports = router