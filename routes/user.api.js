const Chatkit = require('@pusher/chatkit-server');

const chatkit = new Chatkit.default({
    instanceLocator: "v1:us1:5697f151-ab2c-404f-9137-8ea36d9acedf",
    key: "ba8ab68c-8a7f-4cb6-a753-584bf6a1c095:W4Bs8ckQ6oYfwz7r2Qqqs49Xgdlo/SfR+luSYriB1Io="
});

const createUser = async (ctx) => {
    
    const { id, name, avatarURL, customData} = ctx.request.body;
    try {
        const res = await chatkit.createUser({
            id,
            name,
            avatarURL,
            customData
        })
        ctx.response.body = res;
    } catch (error) {
        ctx.response.body = error;
    }

};

const updateUser = async (ctx) => {
    
    const { id, name, avatarURL, customData } = ctx.request.body;
    try {
        const res = await chatkit.updateUser({
            id,
            name,
            avatarURL,
            customData
        })
        ctx.response.body = res;
    } catch (error) {
        ctx.response.body = error;
    }

};

const getUser = async (ctx) => {

    const { id } = ctx.request.query;
    
    try {
        const res = await chatkit.getUser({
            id
        })
        ctx.response.body = res;
    } catch (error) {
        ctx.response.body = error;
    }

};

// room
const createRoom = async (ctx) => {

    const { userId, userIds, roomName, customData, isPrivate } = ctx.request.body;
    try {
        const res = await chatkit.createRoom({
            creatorId: userId,
            name: roomName,
            customData,
            isPrivate,
            userIds
        })
        ctx.response.body = res;
    } catch (error) {
        ctx.response.body = error;
    }

};

const addUsersToRoom = async (ctx) => {

    const { roomId, userIds } = ctx.request.body;
    try {
        const res = await chatkit.addUsersToRoom({
            roomId,
            userIds
        })
        ctx.response.body = res;
    } catch (error) {
        ctx.response.body = error;
    }

};

const getRoom = async (ctx) => {

    const { roomId } = ctx.request.body;
    try {
        const res = await chatkit.getRoom({
            roomId
        })
        ctx.response.body = res;
    } catch (error) {
        ctx.response.body = error;
    }

};

const getUserRooms = async (ctx) => {

    const { userId } = ctx.request.body;
    try {
        const res = await chatkit.getUserRooms({
            userId
        })
        ctx.response.body = res;
    } catch (error) {
        ctx.response.body = error;
    }

};

const sendMessage = async (ctx) => {

    const { userId, roomId, text } = ctx.request.body;
    try {
        const res = await chatkit.sendMessage({
            userId,
            roomId,
            text
        })
        ctx.response.body = res;
    } catch (error) {
        ctx.response.body = error;
    }

};

const getRoomMessages = async (ctx) => {

    const { roomId, limit } = ctx.request.body;
    try {
        const res = await chatkit.getRoomMessages({
            roomId,
            limit
        })
        ctx.response.body = res;
    } catch (error) {
        ctx.response.body = error;
    }

};


module.exports = {
    createUser,
    updateUser,
    getUser,
    createRoom,
    addUsersToRoom,
    getRoom,
    getUserRooms,
    sendMessage,
    getRoomMessages
};