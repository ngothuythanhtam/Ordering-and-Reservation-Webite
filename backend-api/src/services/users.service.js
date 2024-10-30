const knex = require('../database/knex');
const { unlink } = require('node:fs');

function userRepository() {
    return knex('users');
}

function readUser(payload) {
    return {
        userrole: payload.userrole,
        username: payload.username,
        userbirthday: payload.userbirthday,
        userphone: payload.userphone,
        useremail: payload.useremail,
        userpwd: payload.userpwd,
        useraddress: payload.useraddress,
        useravatar: payload.useravatar,
    };
}
const checkExistEmail = async (email) => {
    try {
        const user = await knex('users').where({ useremail: email }).first();
        return user;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw error;
    }
};
const checkExistPhone = async (phone) => {
    try {
        const user = await knex('users').where({ userphone: phone }).first();
        return user;
    } catch (error) {
        console.error('Error fetching user by phone:', error);
        throw error;
    }
};
async function createUser(payload) {
    const user = readUser(payload);
    return await knex.transaction(async trx => {
        const [userId] = await trx('users').insert(user);
        const newuser = await trx('users').where({ userid: userId }).first();
        return newuser;
    });
}
async function getUserById(id) {
    return userRepository().where('userid', id).select('*').first();
}
async function updateUser(id, payload) {
    const updatedUser = await userRepository()
        .where('userid', id)
        .select('*')
        .first();
    if (!updatedUser) {
        return null;
    }
    const update = readUser(payload);
    if (!update.avatar) {
        delete update.avatar;
    }
    await userRepository().where('userid', id).update(update);
    if (
        update.avatar &&
        updatedUser.avatar &&
        update.avatar !== updatedUser.avatar &&
        updatedUser.avatar.startsWith('/public/uploads')
    ) {
        unlink(`.${updatedUser.avatar}`, (err) => {});
    }
    return { ...updatedUser, ...update };
}

async function deleteUser(userid, payload) {
    const user = await userRepository()
        .where('userid', userid)
        .select('userrole')
        .first();

    if (!user) {
        return null;
    }
    else if (userid == payload.requestId || user.userrole == 3) {
        const deleteUser = await userRepository()
            .where('userid',payload.requestId)
            .select('useravatar')
            .first();

        if (!deleteUser) {
            return null;
        }

        return await knex.transaction(async trx => {
            await trx('accounts').where('userid', payload.requestId).del();
            await trx('users').where('userid', payload.requestId).del();

            if (
                deleteUser.useravatar &&
                deleteUser.useravatar.startsWith('/public/uploads')
            ) {
                unlink(`.${deleteUser.useravatar}`, () => {});
            }
            return deleteUser;
        });
    }
}
const checkRole = async (userid) => {
    try {
        const user = await knex('users').where('userid', userid).select('userrole').first(); 
        return user ? user.userrole : null; 
    } catch (error) {
        console.error('Error fetching user by userrole:', error);
        throw error; 
    }
};
async function updateUserRole(id, requestId, userrole) {
    const requestingUser = await userRepository()
        .where('userid', id)
        .select('userrole')
        .first();

    const targetUser = await userRepository()
        .where('userid', requestId)
        .select('userrole')
        .first();
    if (!requestingUser || !targetUser) {
        return null; 
    }
    if (userrole == '1' || userrole =='2' ) {
        if (userrole == targetUser.userrole) {
            return { error: 'Không có thay đổi khi cập nhật.' };
        }
        const updatedUser = await userRepository()
            .where('userid', requestId)
            .update('userrole', userrole);
        if (!updatedUser) {
            return { error: 'Cập nhật vai trò không thành công.' };
        }
    }
    return { success: true };
}

module.exports = {
    checkExistEmail,
    checkExistPhone,
    checkRole,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    updateUserRole
};
