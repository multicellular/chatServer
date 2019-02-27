const mysql = require('mysql');
const config = require('../config/default')

const pool = mysql.createPool({
    host: config.database.HOST,
    database: config.database.DATABASE,
    user: config.database.USERNAME,
    password: config.database.PASSWORD
});

const query = function (sql, values = []) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    });
};

const users =
    `create table if not exists users(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    avator VARCHAR(100) NOT NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( id )
)`;

const blogs =
    `create table if not exists blogs(
    id INT NOT NULL AUTO_INCREMENT,
    title TEXT(0) NULL,
    content TEXT(0) NOT NULL,
    images VARCHAR(300) NULL,
    comments VARCHAR(100) NOT NULL DEFAULT '0',
    views VARCHAR(100) NOT NULL DEFAULT '0',
    forwards VARCHAR(100) NOT NULL DEFAULT '0',
    uavator VARCHAR(100) NOT NULL,
    uname VARCHAR(100) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    source_uname VARCHAR(100) NULL,
    source_uid VARCHAR(100) NULL,
    source_uavator VARCHAR(100) NULL,
    forward_comment TEXT(0) NULL,
    source_id VARCHAR(100) NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( id )
)`;

const comments =
    `create table if not exists comments(
    id INT NOT NULL AUTO_INCREMENT,
    uavator VARCHAR(100) NOT NULL,
    uname VARCHAR(100) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    content TEXT(0) NOT NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    blogid VARCHAR(100) NOT NULL,
    PRIMARY KEY ( id )
)`;

query(users);
query(blogs);
query(comments);


const findUserByName = function (name) {
    const _sql = `select * from users where name="${name}";`
    return query(_sql);
}

const insertUser = function (values) {
    const _sql = `insert into users set name=?,password=?,avator=?;`
    return query(_sql, values);
}

const insertBlog = function (values) {
    const _sql = `insert into blogs set title=?,content=?,
    images=?,uavator=?,uname=?,uid=?,source_uname=?,source_uid=?,source_uavator=?,
    forward_comment=?,source_id=?;`
    return query(_sql, values);
}

const findBlogById = function (id) {
    const _sql = `select * from blogs where id="${id}";`
    return query(_sql);
}

const unpdateBlogForwards = function (values) {
    const _sql = `update blogs set forwards=? where id=?;`
    return query(_sql, values);
}

const unpdateBlogComments = function (values) {
    const _sql = `update blogs set comments=? where id=?;`
    return query(_sql, values);
}

const insertComment = function (values) {
    const _sql = `insert into comments set blogid=?,content=?,uname=?,uid=?,uavator=?;`
    return query(_sql, values);
}

const findAllBlogs = function () {
    const _sql = `select * from blogs order by id desc;`
    return query(_sql);
}

const findAllBlogComments = function (blogid) {
    const _sql = `select * from comments where blogid=${blogid};`
    return query(_sql);
}

const deleteBlog = function (blogid) {
    let _sql = `delete from blogs where id = ${blogid};`
    return query(_sql)
}

const deleteAllBlogComments = function (blogid) {
    let _sql = `delete from comments where postid=${blogid};`
    return query(_sql)
}


module.exports = {
    query, findUserByName, insertUser, insertBlog, findBlogById, unpdateBlogForwards, unpdateBlogComments, insertComment,
    findAllBlogs, findAllBlogComments, deleteBlog, deleteAllBlogComments
}