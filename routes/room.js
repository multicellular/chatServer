const router = require('koa-router')()
const roomModel = require('../lib/mysql')

router.prefix('/api/room')

router.post('/insertRoom', async (ctx, next) => {
    // 邀请第三人由对聊房间新建全聊房间
    const { name, caption, ownerid } = ctx.request.body;
    const result = await roomModel.insertRoom({ name, caption, ownerid });
    // await roomModel.userJoinRoom(result.insertId, ownerid); //创建者加入房间
    ctx.body = {
        code: 0,
        room: { name, caption, ownerid, id: result.insertId }
    }
});

router.post('/insertChatRoom', async (ctx, next) => {
    const { uid, fuid } = ctx.request.body;
    const rooms = await roomModel.findChatRoom({ uid, fuid });
    if (rooms[0]) {
        ctx.body = {
            code: 0,
            room: rooms[0]
        }
    } else {
        const result = await roomModel.insertChatRoom({ uid, fuid });
        ctx.body = {
            code: 0,
            room: { id: result.insertId }
        }
    }

});

// 后台管理
// router.post('/createSystemRoom', async (ctx, next) => {
//     const { name, desc } = ctx.request.body;
//     const result = await roomModel.insertRoom([name, desc, 'system']);
//     ctx.body = {
//         code: 0,
//         room: { name, desc, ownerid, id: result.insertId }
//     }
// });

router.get('/getSystemRooms', async (ctx, next) => {
    await roomModel.findSystemRooms('system').then(result => {
        ctx.body = {
            code: 0,
            rooms: result
        }
    });
});

router.post('/userJoinRoom', async (ctx, next) => {
    const { roomid, uid } = ctx.request.body;
    await roomModel.userJoinRoom(roomid, uid).then(result => {
        ctx.body = {
            code: 0,
            room: result
        }
    });
});

router.post('/listJoinRoom', async (ctx, next) => {
    const { roomid, uids } = ctx.request.body;
    let values = '';
    for (let i = 0; i < uids.length; i++) {
        if (i === uids.length - 1) {
            values += `(${roomid}, ${uids[i]})`
        } else {
            values += `(${roomid}, ${uids[i]}),`
        }
    }
    await roomModel.listJoinRoom(values);
    const rooms = await roomModel.findRoom(roomid)
    await roomModel.findUsrsByRoom(roomid).then(users => {
        ctx.body = {
            code: 0,
            room: rooms[0],
            users: users
        }
    })
});

router.post('/userLeaveRoom', async (ctx, next) => {
    const { roomid, uid } = ctx.request.body;
    await roomModel.userLeaveRoom(roomid, uid).then(result => {
        ctx.body = {
            code: 0,
            room: result
        }
    });
});

router.get('/getUserRooms', async (ctx, next) => {
    const { uid } = ctx.request.query;
    await roomModel.findRoomsByUser(uid).then(result => {
        ctx.body = {
            code: 0,
            rooms: result
        }
    });
});

router.get('/getRoomUsers', async (ctx, next) => {
    const { roomid } = ctx.request.query;
    const rooms = await roomModel.findRoom(roomid);
    let users = [];
    if (rooms[0].fuid) {
        users = await roomModel.findUsrsByChatRoom({ roomid, uid: rooms[0].uid, fuid: rooms[0].fuid });
    } else {
        users = await roomModel.findUsrsByRoom(roomid)
    }
    ctx.body = {
        code: 0,
        room: rooms[0],
        users
    }
});

router.get('/getUserFriends', async (ctx, next) => {
    const { uid } = ctx.request.query;
    const room = await roomModel.findFriendRoom(uid);
    await roomModel.findUserFriends(uid).then(result => {
        ctx.body = {
            code: 0,
            friend_room: room[0],
            friends: result
        }
    });
});

// router.post('/joinFriendByName', async (ctx, next) => {
//     const { flist_id, uname } = ctx.request.body;
//     const user = await roomModel.findUserByName(uname);
//     await roomModel.insertFriend([flist_id, user[0].id, null]).then(result => {
//         ctx.body = {
//             code: 0,
//             friend: {
//                 uid: user[0].id,
//                 uname: user[0].name,
//                 uavator: user[0].avator,
//                 ubio: user[0].bio
//             }
//         }
//     });
// });

router.get('/searchUsersByName', async (ctx, next) => {
    const { uname } = ctx.request.query;
    const users = await roomModel.searchUsersByName(uname);
    ctx.body = {
        code: 0,
        users
    }
});

router.post('/createApply', async (ctx, next) => {
    const { verify_message, apply_uid, apply_flist_id, invitees_uid, invitees_flist_id } = ctx.request.body;

    const res = await roomModel.findFriend(apply_flist_id, invitees_uid);

    if (res[0]) {
        ctx.body = {
            code: -1,
            msg: "已经在你的好友列表中"
        }
        return;
    }
    const result = await roomModel.insertApply({
        verify_message, apply_uid, apply_flist_id,
        invitees_uid, invitees_flist_id
    });

    if (result.insertId) {
        ctx.body = {
            code: 0
        }
    } else {
        ctx.body = {
            code: -1,
            msg: "申请已存在"
        }
    }

});

router.get('/findApply', async (ctx, next) => {
    const { invitees_uid } = ctx.request.query;
    const applys = await roomModel.findApply(invitees_uid);
    ctx.body = {
        code: 0,
        applys
    }
});

router.get('/findAllApply', async (ctx, next) => {
    const { invitees_uid } = ctx.request.query;
    const applys = await roomModel.findAllApply(invitees_uid);
    ctx.body = {
        code: 0,
        applys
    }
});

router.post('/ignoreApply', async (ctx, next) => {
    const { applyid } = ctx.request.body;
    await roomModel.updateApply({ applyid, invitees_ignore: 'ignore' });
    ctx.body = {
        code: 0
    }
});

router.post('/allowJoinFriend', async (ctx, next) => {
    //校验 用户是被邀请人才能删除
    const { uremark, apply_uid, apply_flist_id, invitees_uid, invitees_flist_id, applyId } = ctx.request.body;
    // const room = await roomModel.findFriendRoom(uid);
    // flist_id=?,uid=?,uremark=?
    await roomModel.insertFriend({ flist_id: invitees_flist_id, uid: apply_uid, uremark });
    await roomModel.insertFriend({ flist_id: apply_flist_id, uid: invitees_uid });
    await roomModel.deleteApply(applyId);
    ctx.body = {
        code: 0
    }
});

// router.post('/joinFriend', async (ctx, next) => {
//     const { flist_id, uid } = ctx.request.body;
//     // const room = await roomModel.findFriendRoom(uid);
//     await roomModel.insertFriend([flist_id, uid, null]).then(result => {
//         ctx.body = {
//             code: 0,
//             friend: result
//         }
//     });
// });

router.get('/deleteFriend', async (ctx, next) => {
    const { flist_id, uid } = ctx.request.query;
    await roomModel.deleteFriend(flist_id, uid).then(result => {
        ctx.body = {
            code: 0,
            friend: result
        }
    });
});

module.exports = router;
