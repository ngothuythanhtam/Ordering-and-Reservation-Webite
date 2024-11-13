const knex = require('../../database/knex');
const Paginator = require('./paginator');

function TableRepository() {
    return knex('restaurant_table');
}
async function getManyTableByStatus(query) {
    const { page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);
    let results = await TableRepository()
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
    getManyTableByStatus,
};
