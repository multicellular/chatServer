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
    avator VARCHAR(100) NULL,
    bio VARCHAR(100) NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( id )
)`;

const users_view =
    `create or replace view users_view as 
    select u.id uid,u.name uname,u.avator uavator,u.bio ubio from users u`;
const blogs =
    `create table if not exists blogs(
    id INT NOT NULL AUTO_INCREMENT,
    title TEXT(0) NULL,
    content TEXT(0) NULL,
    images VARCHAR(300) NULL,
    comments VARCHAR(100) NOT NULL DEFAULT '0',
    views VARCHAR(100) NOT NULL DEFAULT '0',
    forwards VARCHAR(100) NOT NULL DEFAULT '0',
    uid VARCHAR(100) NOT NULL,
    forward_comment TEXT(0) NULL,
    source_id VARCHAR(100) NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( id )
)`;

const comments =
    `create table if not exists comments(
    id INT NOT NULL AUTO_INCREMENT,
    uid VARCHAR(100) NOT NULL,
    content TEXT(0) NOT NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    blogid VARCHAR(100) NOT NULL,
    PRIMARY KEY ( id )
)`;

const rooms =
    `create table if not exists rooms(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    room_desc TEXT(0) NULL,
    ownerid VARCHAR(100) NOT NULL,
    moment TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( id )
)`;

const room_user =
    `create table if not exists room_user(
    id INT NOT NULL AUTO_INCREMENT,
    uid VARCHAR(100) NOT NULL,
    roomid  VARCHAR(100) NOT NULL,
    PRIMARY KEY ( id )
)`;

const friend_rooms =
    `create table if not exists friend_rooms(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NULL,
    row_desc TEXT(0) NULL,
    uid VARCHAR(100) NOT NULL,
    PRIMARY KEY ( id )
)`;

const friend =
    `create table if not exists friend(
    id INT NOT NULL AUTO_INCREMENT,
    uremark VARCHAR(100) NULL,
    flist_id VARCHAR(100) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    PRIMARY KEY ( id )
)`;

const applys =
    `create table if not exists applys(
    id INT NOT NULL AUTO_INCREMENT,
    verify_message VARCHAR(100) NULL,
    apply_uid VARCHAR(100) NOT NULL,
    apply_flist_id VARCHAR(100) NOT NULL,
    invitees_uid VARCHAR(100) NOT NULL,
    invitees_flist_id VARCHAR(100) NOT NULL,
    invitees_ignore VARCHAR(100) NULL,
    PRIMARY KEY ( id )
)`;


query(users);
query(users_view);
query(blogs);
query(comments);
query(rooms);
query(room_user);
query(friend_rooms);
query(friend);
query(applys);
// users
const findUserByName = function (name) {
    const _sql = `select * from users where name="${name}";`
    return query(_sql);
}

const insertUser = function (values) {
    const _sql = `insert into users set name=?,password=?,avator=?;`
    return query(_sql, values);
}

const updateUserBio = function ({ bio, userid }) {
    const _sql = `update users set bio="${bio}" where id=${userid};`
    return query(_sql);
}

// blogs
const insertBlog = function ({ title, content, images, uid, forward_comment, source_id }) {
    const _sql = `insert into blogs set title="${title}",content="${content}",
    images="${images}",uid=${uid},forward_comment="${forward_comment}",source_id=${source_id};`
    return query(_sql);
}

const findAllBlogs = function () {
    // const _sql = `select * from blogs left join users_view uv on blogs.uid=uv.uid order by blogs.id desc;`
    const _sql = `select 
     b1.title,b1.id,b1.moment,b1.comments,b1.views,b1.forwards,b1.source_id,b1.forward_comment,
     case when b1.source_id is not null then b2.content else b1.content end content,
     case when b1.source_id is not null then b2.images else b1.images end images,
     case when b1.source_id is not null then uv2.uname else null end source_uname,
     case when b1.source_id is not null then uv2.uavator else null end source_uavator,
     case when b1.source_id is not null then uv2.ubio else null end source_ubio,
     case when b1.source_id is not null then uv2.uid else null end source_uid,
     uv1.uname,uv1.uid,uv1.uavator,uv1.ubio
     from blogs b1 
     left join blogs b2 on b1.source_id=b2.id 
     left join users_view uv1 on uv1.uid=b1.uid 
     left join users_view uv2 on uv2.uid=b2.uid 
     order by b1.id desc`
    return query(_sql);
}

const findBlogById = function (id) {
    // const _sql = `select * from blogs left join users_view uv on blogs.uid=uv.uid where blogs.id="${id}";`
    const _sql = `select 
    b1.title,b1.id,b1.moment,b1.comments,b1.views,b1.forwards,b1.source_id,b1.forward_comment,
    case when b1.source_id is not null then b2.content else b1.content end content,
    case when b1.source_id is not null then b2.images else b1.images end images,
    case when b1.source_id is not null then uv2.uname else null end source_uname,
    case when b1.source_id is not null then uv2.uavator else null end source_uavator,
    case when b1.source_id is not null then uv2.ubio else null end source_ubio,
    case when b1.source_id is not null then uv2.uid else null end source_uid,
    uv1.uname,uv1.uid,uv1.uavator,uv1.ubio
    from blogs b1 
    left join blogs b2 on b1.source_id=b2.id 
    left join users_view uv1 on uv1.uid=b1.uid 
    left join users_view uv2 on uv2.uid=b2.uid 
    where b1.id="${id}"`
    return query(_sql);
}

const deleteBlog = function (blogid) {
    let _sql = `delete from blogs where id="${blogid}";`
    return query(_sql)
}

const unpdateBlogForwards = function (values) {
    const _sql = `update blogs set forwards=? where id=?;`
    return query(_sql, values);
}

const unpdateBlogComments = function (values) {
    const _sql = `update blogs set comments=? where id=?;`
    return query(_sql, values);
}

// comments
const insertComment = function (values) {
    const _sql = `insert into comments set blogid=?,content=?,uid=?;`
    return query(_sql, values);
}

const findAllBlogComments = function (blogid) {
    const _sql = `select * from comments left join users_view uv on comments.uid=uv.uid where blogid="${blogid}";`
    return query(_sql);
}

const deleteComment = function (commentid) {
    let _sql = `delete from comments where id="${commentid}";`
    return query(_sql)
}

const deleteAllBlogComments = function (blogid) {
    let _sql = `delete from comments where postid="${blogid}";`
    return query(_sql)
}

// rooms
const insertRoom = function (values) {
    const _sql = `insert into rooms set name=?,room_desc=?,ownerid=?;`
    return query(_sql, values);
}

const findRoom = function (roomid) {
    const _sql = `select * from rooms where id="${roomid}";`
    return query(_sql);
}

const findSystemRooms = function (ownerid) {
    // ownerid = system
    const _sql = `select * from rooms where ownerid="${ownerid}";`
    return query(_sql);
}

const deleteRoom = function (roomid) {
    const _sql = `delete from rooms where id="${roomid}";`
    return query(_sql);
}

const clearRoomUser = function (roomid) {
    const _sql = `delete from room_user where roomid="${roomid}";`
    return query(_sql);
}

// room_user
const userJoinRoom = function (roomid, uid) {
    const _sql = `insert into room_user set uid="${uid}",roomid="${roomid}";`
    return query(_sql);
}

const listJoinRoom = function (values) {
    // const _sql = `insert into room_user set uid="${uid}",roomid="${roomid}";`
    const _sql = `insert into room_user (uid,roomid) values ${values};`
    return query(_sql);
}

const userLeaveRoom = function (roomid, uid) {
    const _sql = `delete from roomUsers where uid="${uid}" and roomid="${roomid}";`
    return query(_sql);
}

const findRoomsByUser = function (uid) {
    const _sql = `select * from rooms right join (select * from room_user where uid="${uid}") as temp on rooms.id=temp.roomid`;
    // const _sql = `select * from rooms where id (select * from room_user where uid="${uid}");`
    return query(_sql);
}

const findUsrsByRoom = function (roomid) {
    const _sql = `select * from users_view uv 
    right join (select * from room_user where roomid="${roomid}") as temp on temp.uid=uv.uid`
    return query(_sql);
}

// friend_rooms | friend | applys
const insertFriendRoom = function (values) {
    const _sql = `insert into friend_rooms set uid=?,name=?,row_desc=?;`
    return query(_sql, values);
}

const findFriendRoom = function (uid) {
    const _sql = `select * from friend_rooms where uid="${uid}";`
    return query(_sql);
}

const insertFriend = function ({ flist_id, uid, uremark }) {
    // const _sql = `insert into friend set flist_id=?,uid=?,uremark=?;`
    const _sql = `insert into friend(flist_id,uid,uremark) select ${flist_id},${uid},"${uremark}" from dual 
    where not exists (select flist_id,uid from friend where flist_id=${flist_id} and uid=${uid});`
    return query(_sql);
}

const findFriend = function (flist_id, uid) {
    const _sql = `select * from friend where flist_id="${flist_id}" and uid="${uid}";`
    return query(_sql);
}

const deleteFriend = function (flist_id, uid) {
    const _sql = `delete from friend where flist_id="${flist_id}",uid="${uid}";`
    return query(_sql);
}

const findUserFriends = function (uid) {
    const _sql = `select * from friend
    join ( select * from friend_rooms where uid="${uid}" ) as temp on friend.flist_id=temp.id 
    left join users_view uv on uv.uid=friend.uid;`
    return query(_sql);
}

const insertApply = function ({ verify_message, apply_uid, apply_flist_id, invitees_uid, invitees_flist_id, invitees_ignore }) {
    // const _sql = `insert into applys set verify_message=?,apply_uid=?,
    // apply_flist_id=?,invitees_uid=?,invitees_flist_id=?;`
    const _sql = `insert into applys(verify_message,apply_uid,apply_flist_id,invitees_uid,invitees_flist_id,invitees_ignore) 
    select "${verify_message}",${apply_uid},${apply_flist_id},${invitees_uid},${invitees_flist_id},"${invitees_ignore}" from dual 
    where not exists (select apply_uid,invitees_uid from applys where apply_uid=${apply_uid} and invitees_uid=${invitees_uid});`
    return query(_sql);
}

const findAllApply = function (invitees_uid) {
    const _sql = `select * from applys where invitees_uid=${invitees_uid};`
    return query(_sql);
}

const findApply = function (invitees_uid) {
    const _sql = `select * from applys where invitees_uid=${invitees_uid} and invitees_ignore<>"ignore";`
    return query(_sql);
}

const deleteApply = function (applyid) {
    const _sql = `delete from  applys where id=${applyid};`
    return query(_sql);
}

const updateApply = function ({ applyid, invitees_ignore }) {
    const _sql = `update applys set invitees_ignore="${invitees_ignore}" where id=${applyid};`
    return query(_sql);
}

const searchUsersByName = function (uname) {
    const _sql = `select uv.*,fr.id flist_id
        from users_view uv left join friend_rooms fr on uv.uid=fr.uid where uv.uname like "${uname}" or like "${uname}_" or like "_${uname}";`
    return query(_sql);
}

// insertRoom(['系统房间001','测试阶段公共聊天室001','system']);
// insertRoom(['系统房间002','测试阶段公共聊天室002','system']);
// insertRoom(['系统房间003','测试阶段公共聊天室003','system']);

module.exports = {
    query, findUserByName, insertUser, updateUserBio,
    insertBlog, findBlogById, unpdateBlogForwards, unpdateBlogComments, insertComment,
    findAllBlogs, findAllBlogComments, deleteBlog, deleteComment, deleteAllBlogComments,
    insertRoom, findRoom, findSystemRooms, deleteRoom, clearRoomUser,
    userJoinRoom, userLeaveRoom, listJoinRoom, findRoomsByUser, findUsrsByRoom,
    insertFriendRoom, findUserFriends, insertFriend, deleteFriend, findFriendRoom, findFriend,
    insertApply, deleteApply, searchUsersByName, findApply, updateApply, findAllApply
}