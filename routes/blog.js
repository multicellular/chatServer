const router = require('koa-router')()
const blogModel = require('../lib/mysql')
const fs = require('fs')

router.prefix('/api/blog');

router.get('/getblogs', async (ctx, next) => {
    await blogModel.findAllBlogs().then(result => {
        const blogs = result.map((item) => {
            const { title, content, images, uavator, uname, uid, id, source_uname, comments, views, forwards,
                source_uid, source_uavator, forward_comment, source_id, moment } = item;
            return {
                title, content, images, uavator, uname, uid, id, comments, views, forwards, moment,
                forwardObj: { source_uname, source_uid, source_uavator, forward_comment, source_id }
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
    const { title, content, images, uavator, uname, uid, forwardObj } = ctx.request.body;
    const { source_uname, source_uid, source_uavator, forward_comment, source_id } = forwardObj;
    let imageUrlsStr;
    if (forwardObj && forwardObj.source_id) {
        // 转发blog，images为原地址，不做处理
        imageUrlsStr = images;
        blogModel.findBlogById(forwardObj.source_id).then((result) => {
            const forwards = parseInt(result[0]['forwards']) + 1;
            blogModel.unpdateBlogForwards([forwards, forwardObj.source_id]);
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
    await blogModel.insertBlog([title, content, imageUrlsStr, uavator, uname, uid,
        source_uname, source_uid, source_uavator, forward_comment, source_id]).then(result => {
            ctx.body = {
                code: 0,
                blog: {
                    title, content, images: imageUrlsStr, uavator, uname, uid, comments: '0', views: '0', forwards: '0',
                    id: result.insertId, forwardObj
                }
            }
        }).catch(err => console.log(err));
});

router.post('/postcomment', async (ctx, next) => {
    const { blogid, content, uname, uid, uavator } = ctx.request.body;
    await blogModel.insertComment([blogid, content, uname, uid, uavator]).then(async result => {
        blogModel.findBlogById(blogid).then((res) => {
            const comments = parseInt(res[0]['comments']) + 1;
            blogModel.unpdateBlogComments([comments, blogid]);
        });
        ctx.body = {
            code: 0,
            comment: { blogid, content, uname, uid, uavator, id: result.insertId }
        }
    }).catch(err => console.log(err));
});

module.exports = router