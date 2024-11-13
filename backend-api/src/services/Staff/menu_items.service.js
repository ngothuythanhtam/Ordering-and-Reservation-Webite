const knex = require('../../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')

function ItemRepository() {
    return knex('menu_items');
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

async function createItem(payload) {
    const item = readItem(payload);
    const [item_id] = await ItemRepository().insert(item);
    return { item_id, ...item };
}

async function getManyItems(query) {
    const { item_name, page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);
    
    let results = await ItemRepository()
        .where((builder) => {
            if (item_name) {
                builder.where('item_name', 'like', `%${item_name}%`);
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

async function getItemById(item_id) {
    console.log(`Querying item by id: ${item_id}`);
    const item = await ItemRepository().where('item_id', item_id).select('*').first();
    console.log(`Queried item result: ${item}`);
    return item;
}

async function updateItem(item_id, payload) {
    const updatedItem = await ItemRepository()
        .where('item_id', item_id)
        .select("*")
        .first();
    if (!updatedItem) {
        return null;
    }

    const update = readItem(payload);
    if (!update.img_url) {
        delete update.img_url;
    }

    await ItemRepository().where('item_id', item_id).update(update);

    if (
        update.img_url &&
        updatedItem.img_url &&
        update.img_url !== updatedItem.img_url &&
        updatedItem.img_url.startsWith('/public/uploads')
    ) {
        unlink(`.${updatedItem.img_url}`, (err) => {});
    }
    return { ...updatedItem, ...update };
}

async function deleteItem(item_id) {
    const deletedItem  = await ItemRepository()
        .where('item_id', item_id)
        .select('*')
        .first();

    if (!deletedItem){
        return null;
    }

    await ItemRepository().where('item_id', item_id).del();

    if (
        deletedItem.img_url && 
        deletedItem.img_url.startsWith('/public/uploads')
    ) {
        unlink(`.${deletedItem.img_url}`, (err) => {
            if (err) {
                console.error(`Failed to delete image file: ${err.message}`);
            }
        });
    }

    return deleteItem;
}

async function deleteAllItems() {
    const items = await ItemRepository().select('img_url');
    await ItemRepository().del();
    
    items.forEach((item) => {
        if (item.img_url && item.img_url.startsWith('public/uploads')) {
            unlink(`.${item.img_url}`, (err) => {});
        }
    });
}

async function getItemByName(item_name) {
    return ItemRepository().where('item_name', item_name).select('*').first();
}

module.exports = {
    createItem,
    getManyItems,
    getItemById,
    updateItem,
    deleteItem,
    deleteAllItems,
    getItemByName,
    
};