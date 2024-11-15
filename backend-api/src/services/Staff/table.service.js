const knex = require('../../database/knex');
const Paginator = require('./paginator');

function TableRepository() {
    return knex('restaurant_table');
}

function readTable(payload) {
    return {
        table_id: payload.table_id,
        table_number: payload.table_number,
        seating_capacity: payload.seating_capacity,
    };
}

async function getTableById(table_id) {
    return TableRepository().where('table_id', table_id).select('*').first();
}

async function getTableByNumber(table_number) {
    return TableRepository().where('table_number', table_number).select('*').first();
}

async function createTable(payload) { 
    const table = readTable(payload);
    return await knex.transaction(async trx => {
        const existingTable = await trx('restaurant_table')
            .where('table_number', table.table_number)
            .first();
        if (existingTable) {
            return {
                message: 'The table name already exists, please enter another name!'
            };
        }
        const [tableId] = await trx('restaurant_table').insert(table);
        return {
            message: 'The table has been created successfully!',
            data: { tableId, ...table }
        };
    });
}

async function deleteTable(table_id) {
    const deleteTable = await TableRepository()
        .where('table_id', table_id)
        .first();

    if (!deleteTable) return null;

    await TableRepository().where('table_id', table_id).del();
    return deleteTable;
}

async function getManyTables(query) {
    const { table_number, page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);
    
    let results = await TableRepository()
        .where((builder) => {
            if (table_number) {
                builder.where('table_number', 'like', `%${table_number}%`);
            }
        })
        .select(
            knex.raw('count(table_id) OVER() AS recordCount'),
            'table_id',
            'table_number',
            'seating_capacity',
        )
        .limit(paginator.limit)
        .offset(paginator.offset);

    let totalRecords = 0;
    results = results.map((result) => {
        totalRecords = result.recordCount;
        delete result.recordCount;
        return result;
    });

    return {
        metadata: paginator.getMetadata(totalRecords),
        tables: results,
    };
}

module.exports = {
    getTableById,
    getTableByNumber,
    createTable,
    deleteTable,
    getManyTables,
};
