const knex = require('../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')
const ApiError = require('../api-error');

function TableRepository() {
    return knex('restaurant_table');
}

async function getTableByNumber(table_number) {
    return TableRepository().where('table_number', table_number).select('*').first();
}


async function getTableBySeating(query) {
    const { seating_capacity, page = 1, limit = 5 } = query;
    
    if (!seating_capacity || seating_capacity <= 0) {
        throw new ApiError(400, 'Seating capacity must be greater than 0');
    }

    const paginator = new Paginator(page, limit);
    
    let results = await TableRepository()
        .where((builder) => {
            if (seating_capacity) {
                builder.where('seating_capacity', '>=', seating_capacity);
            }
        })
        .select(
            knex.raw('count(table_id) OVER() AS recordCount'),
            'table_id',
            'table_number',
            'seating_capacity',
            'status'
        )
        .limit(paginator.limit)
        .offset(paginator.offset);

    let totalRecords = 0;
    results = results.map((result) => {
        totalRecords = result.recordCount;
        delete result.recordCount;
        return result;
    });

    if (totalRecords === 0) {
        throw new ApiError(404, 'No tables found for the given seating capacity');
    }
    return {
        metadata: paginator.getMetadata(totalRecords),
        tables: results,
    };
}

async function getManyTableByStatus(query) {
    const { status, page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);
    
    let results = await TableRepository()
        .where((builder) => {
            if (status !== undefined) {
                builder.where('status', status);
            }
        })
        .select(
            knex.raw('count(table_id) OVER() AS recordCount'),
            'table_id',
            'table_number',
            'seating_capacity',
            'status',
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

async function updateTable(table) {
    try {
        await knex('restaurant_table')
            .where({ table_number: table.table_number })
            .update({ status: table.status });
        return table;
    } catch (error) {
        console.error('Error updating table status:', error);
        throw new Error('Could not update the table status');
    }
}

function readTable(payload) {
    return {
        table_number: payload.table_number,
        seating_capacity: payload.seating_capacity,
        status: payload.status,
    };
}
async function createTable(payload) { 
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
async function deleteTable(requestId) {
    const deleteTable = await TableRepository()
        .where('table_id', requestId)
        .first();

    if (!deleteTable) return null;

    await TableRepository().where('table_id', requestId).del();
    return deleteTable;
}

module.exports = {
    getTableByNumber,
    getTableBySeating,
    getManyTableByStatus,
    updateTable,
    createTable,
    deleteTable,
};
