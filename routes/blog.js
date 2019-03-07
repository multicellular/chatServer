const router = require('koa-router')()
const blogModel = require('../lib/mysql')
const fs = require('fs')

router.prefix('/api/blog');

router.get('/getblogs', async (ctx, next) => {
    await blogModel.findAllBlogs().then(result => {
        const blogs = result.map((item) => {
            const { title, content, images, uavator, uname, uid, ubio, id, source_uname, comments, views, forwards,
                source_uid, source_uavator, forward_comment, source_id, source_ubio, moment } = item;
            return {
                title, content, images, uavator, uname, uid, id, comments, views, forwards, moment, ubio,
                forwardObj: { source_uname, source_uid, source_uavator, forward_comment, source_id, source_ubio}
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
    const { title, content, images, uid, forward_comment, source_id } = ctx.request.body;
    let imageUrlsStr;
    if (source_id) {
        // 转发blog
        blogModel.findBlogById(source_id).then((result) => {
            const forwards = parseInt(result[0]['forwards']) + 1;
            blogModel.unpdateBlogForwards([forwards, source_id]);
        });
    } else {
        // 上传的图片为base64格式，先存储图片，在存储路径
        let imageUrls = [];
        images.forEach((image, idx) => {
            let base64Data = image.replace(/^data:image\/\w+;base64,/, "");
            let dataBuffer = Buffer.from(base64Data, 'base64');
            let urlPath = 'images/' + Date.now() + idx + '.png';
            fs.writeFileSync('./public/' + urlPath, dataBuffer);
            imageUrls.push(urlPath);
        });
        imageUrlsStr = imageUrls.join(',');
    }
    await blogModel.insertBlog({ title, content, images: imageUrlsStr, uid, forward_comment, source_id }).then(result => {
        ctx.body = {
            code: 0,
            blog: {
                title, content, images: imageUrlsStr, uid, comments: '0', views: '0', forwards: '0',
                id: result.insertId, forward_comment, source_id
            }
        }
    }).catch(err => console.log(err));
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