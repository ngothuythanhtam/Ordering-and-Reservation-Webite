const knex = require('../../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')
const bcrypt = require('bcrypt'); 

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
    const user = await knex('users').where({ useremail: email }).first();
    return user;
};
const checkExistPhone = async (phone) => {
    const user = await knex('users').where({ userphone: phone }).first();
    return user;

};
const checkExistUser= async (id) => {
    const user = await knex('users').where({ userid: id }).first();
    return user;
};

async function login(email, password) {
    const user = await knex('users').where({ useremail: email }).first();
    const isMatch = await bcrypt.compare(password, user.userpwd);

    if (!isMatch) {
        throw new Error('Mật khẩu không chính xác.');
    }
    return {
        userid: user.userid,
        useremail: user.useremail,
        userrole: user.userrole,
        useravatar: user.useravatar
    };
}
async function getManyUsersByRole(userrole, query) {  
    const { page = 1, limit = 5 } = query;  
    const paginator = new Paginator(page, limit);
    
    try {
        let Users = await userRepository()
            .select(
                knex.raw('count(userid) OVER() AS recordCount'), 
                'userid',
                'userrole',
                'username',
                'userbirthday',
                'userphone',
                'useremail',
                'useraddress',
                'useravatar'
            )
            .where('userrole', userrole) 
            .limit(paginator.limit)  
            .offset(paginator.offset);  

        let totalRecords = 0;
        Users = Users.map((item) => {
            totalRecords = item.recordCount;  
            delete item.recordCount;  
            return item;
        });

        return {
            metadata: paginator.getMetadata(totalRecords),  
            Users: Users,
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Could not fetch users.");
    }
}
async function createUser(payload) {
    const user = readUser(payload);
    // Hash mật khẩu trước khi lưu vào cơ sở dữ liệu
    const saltRounds = 10; // Số lượng rounds để tạo salt
     // Mã hóa mật khẩu
    user.userpwd = await bcrypt.hash(payload.userpwd, saltRounds);
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
async function deleteUser(id) {
    const deleteUser = await userRepository()
        .where('userid', id)
        .select('useravatar')
        .first();
    if (!deleteUser) {
        return null;
    }
    await userRepository().where('userid', id).del();
    if (deleteUser.useravatar && 
        deleteUser.useravatar.startsWith('/public/uploads')) {
        unlink(`.${deleteUser.useravatar}`, () => {});
    }
    return deleteUser;
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

module.exports = {
    getManyUsersByRole,
    checkExistUser,
    checkExistEmail,
    checkExistPhone,
    login,
    checkRole,
    createUser,
    getUserById,
    updateUser,
    deleteUser
};