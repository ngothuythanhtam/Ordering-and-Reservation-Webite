const knex = require('../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')
const ApiError = require('../api-error');

function UsersRepository() {
    return knex('users'); 
}

async function getManyUsersByRole(userrole, query) {  
    const { page = 1, limit = 5 } = query;  
    const paginator = new Paginator(page, limit);
    
    try {
        let Users = await UsersRepository()
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

async function getUserByMail(useremail) {
    return UsersRepository()
        .where('useremail', useremail)
        .select(
            'userid',
            'userrole',
            'username',
            'userbirthday',
            'userphone',
            'useremail',
            'useraddress',
            'useravatar'
        )
        .first();
}

module.exports = {
    getManyUsersByRole,
    getUserByMail,
};
