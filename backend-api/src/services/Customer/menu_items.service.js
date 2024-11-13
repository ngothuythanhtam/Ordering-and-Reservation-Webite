const knex = require('../../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')

function ItemRepository() {
    return knex('menu_items'); // table from database
}
function readItem(payload) {
    return {
        item_name: payload.item_name,
        item_type: payload.item_type,
        item_description: payload.item_description,
        item_price: parseFloat(payload.item_price),
        item_status: payload.item_status,
        ...(payload.img_url != null && { img_url: payload.img_url }),
    };
}

async function getManyItems(query) {
    const { item_name, item_type, item_status, page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);
    
    let results = await ItemRepository()
        .where((builder) => {
            if (item_name) {
                builder.where('item_name', 'like', `%${item_name}%`);
            }
            if (item_type) {
                builder.where('item_type', 'like', `%${item_type}%`);
            }
            if (item_status !== undefined) {
                builder.where('item_status', item_status);
            }
        })
        .select(
            knex.raw('count(item_id) OVER() AS recordCount'),
            'item_id',
            'item_name',
            'item_type',
            'item_description',
            'item_price',
            'item_status',
            'img_url'
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
        items: results,
    };
}

module.exports = {
    getManyItems    
};