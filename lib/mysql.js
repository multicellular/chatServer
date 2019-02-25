const mysql = require('mysql');
const config = require('../config/default')

const pool = mysql.createPool({
    host: config.database.HOST,
    database: config.database.DATABASE,
    user: config.database.USERNAME,
    password: config.database.PASSWORD
});

const query = function (sql, values=[]) {
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
    avatar VARCHAR(100) NOT NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( id )
)`;

const blogs = 
`create table if not exists blogs(
    id INT NOT NULL AUTO_INCREMENT,
    title TEXT(0) NOT NULL,
    content TEXT(0) NOT NULL,
    comments VARCHAR(100) NOT NULL DEFAULT '0',
    views VARCHAR(100) NOT NULL DEFAULT '0',
    uavatar VARCHAR(100) NOT NULL,
    uname VARCHAR(100) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( id )
)`;

const comments = 
`create table if not exists comments(
    id INT NOT NULL AUTO_INCREMENT,
    uavatar VARCHAR(100) NOT NULL,
    uname VARCHAR(100) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    content TEXT(0) NOT NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    blogid VARCHAR(100) NOT NULL,
    PAIMARY KEY ( id )
)`;

query(users);
query(blogs);
query(comments);
