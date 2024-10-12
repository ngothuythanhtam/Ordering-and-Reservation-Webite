const knex = require('../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')
const ApiError = require('../api-error');

function UsersRepository() {
    return knex('users'); 
}

async function getManyUsers(role_name, query) {  
    const { page = 1, limit = 5 } = query;  
    const paginator = new Paginator(page, limit);
    
    try {
        // Query for users with pagination and role filter
        let Users = await UsersRepository()
            .join('roles as r', 'users.userrole', 'r.role_id')
            .select(
                knex.raw('count(users.userid) OVER() AS recordCount'), 
                'r.role_id',
                'r.role_name',
                'users.userid',
                'users.username',
                'users.userbirthday',
                'users.userphone',
                'users.useremail',
                'users.useraddress',
                'users.useravatar'
            )
            .where('r.role_name', role_name) 
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

async function getUserByMail(useremail) {
    return UsersRepository()
        .where('useremail', useremail)
        .select('*')
        .first();
}

module.exports = {
    getManyUsers,
    getUserByMail,
};
