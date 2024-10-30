const knex = require('../database/knex');


function tableRepository() {
    return knex('restaurant_table');
}
function readTable(payload) {
    return {
        table_number: payload.table_number,
        seating_capacity: payload.seating_capacity,
        status: payload.status,
    };
}
async function createTable(userid,payload) {
    const user = await knex('users')
        .where('userid', userid)
        .select('userrole')
        .first();
    if (!user || (user.userrole !== 2 && user.userrole !== 3)) {
        return {
                message: 'Bạn không có quyền để thực hiện tác vụ này.'
            };;
    }
    const table = readTable(payload);
    return await knex.transaction(async trx => {
        const existingTable = await trx('restaurant_table')
            .where('table_number', table.table_number)
            .first();
        if (existingTable) {
            return {
                message: 'Bàn này đã tồn tại, không thể insert!'
            };
        }
        const [tableId] = await trx('restaurant_table').insert(table);
        return {
            message: 'Bàn đã được tạo thành công!',
            data: { tableId, ...table }
        };
    });
}
async function deleteTable(id, requestId) {
    const user = await knex('users')
        .where('userid', id)
        .select('userrole')
        .first();
    if (user == 1 || !user ) {
        return null;
    }
    console.log(user.userrole);
    const deleteTable = await tableRepository()
        .where('table_id', requestId)
        .first();

    if (!deleteTable) return null;

    await tableRepository().where('table_id', requestId).del();
    return deleteTable;
}
module.exports = {
    createTable,
    deleteTable
};