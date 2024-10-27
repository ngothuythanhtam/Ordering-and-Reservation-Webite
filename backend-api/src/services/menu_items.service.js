const knex = require('../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')
const ApiError = require('../api-error');

function ItemRepository() {
    return knex('menu_items'); // table from database
}

function readItem(payload) {
    return {
        item_name: payload.item_name,
        item_type: payload.item_type,
        item_description: payload.item_description,
        item_price: parseFloat(payload.item_price), // Ensure price is a number
        item_status: payload.item_status,
        img_url: payload.img_url || null,
    };
}

// FUNCTION FOR STAFF
async function addMenuItems(payload) {
    const newItems = readItem(payload);
    const [id] = await ItemRepository().insert(newItems);
    
    return { id, ...newItems };
}

async function updateMenuItemsByName(item_name, payload) {
    const updatedMenuItem = await ItemRepository()
        .where('item_name', item_name)
        .select("*")
        .first();
    if (!updatedMenuItem) {
        return null;
    }

    const update = readItem(payload);
    if (!update.img_url) {
        delete update.img_url;
    }

    await ItemRepository().where('item_name', item_name).update(update);

    if (
        update.img_url &&
        updatedMenuItem.img_url &&
        update.img_url !== updatedMenuItem.img_url &&
        updatedMenuItem.img_url.startsWith('/public/uploads')
    ) {
        unlink(`.${updatedMenuItem.img_url}`, (err) => {});
    }
    return { ...updatedMenuItem, ...update };
}

async function deleteMenuItemByName(item_name) {
    const itemToDelete  = await ItemRepository()
        .where('item_name', item_name)
        .select('*')
        .first();

    if (!itemToDelete){
        return null;
    }

    await ItemRepository().where('item_name', item_name).del();

    if (
        itemToDelete.img_url && 
        itemToDelete.img_url.startsWith('/public/uploads')
    ) {
        unlink(`.${itemToDelete.img_url}`, (err) => {
            if (err) {
                console.error(`Failed to delete image file: ${err.message}`);
            }
        });
    }

    return itemToDelete;
}

// FUNCTION FOR USER (STAFF & CUSTOMER)
async function getItemByName(item_name) {
    return ItemRepository().where('item_name', item_name).select('*').first();
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

async function getManyItemsByType(query) {
    const { item_name, item_type, item_status, page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);
    
    let results = await ItemRepository()
        .where((builder) => {
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

async function getManyMenuItemsByPrice(query) {
    const { min_price, max_price, page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);

    let results = await knex('menu_items')
        .where((builder) => {
            if (min_price) {
                builder.where('item_price', '>=', min_price);
            }
            if (max_price) {
                builder.where('item_price', '<=', max_price);
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
        menu_items: results
    };
}

async function getManyMenuItemsByType_Price(query) {
    const { item_name, item_type, item_status, min_price, max_price, page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);

    let results = await knex('menu_items')
        .where((builder) => {
            if (item_name) {
                builder.where('item_name', 'like', `%${item_name}%`);
            }
            if (item_type) {
                builder.where('item_type', item_type);
            }
            if (item_status !== undefined) {
                builder.where('item_status', item_status);
            }
            if (min_price) {
                builder.where('item_price', '>=', min_price);
            }
            if (max_price) {
                builder.where('item_price', '<=', max_price);
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
        menu_items: results
    };
}

module.exports = {
    addMenuItems,
    updateMenuItemsByName,
    deleteMenuItemByName,
    getItemByName,
    getManyItems,
    getManyItemsByType,
    getManyMenuItemsByPrice,
    getManyMenuItemsByType_Price,
};