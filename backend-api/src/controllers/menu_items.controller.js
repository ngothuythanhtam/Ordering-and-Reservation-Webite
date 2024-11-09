const menu_itemsService = require('../services/menu_items.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function getItemByName(req, res, next) {
    let result = {
        items: [],
        metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 5,
        }
    };
    try {
        // Pass query parameters (item_name) for filtering
        result = await menu_itemsService.getManyItems(req.query);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while retrieving menu items'));
    }
    return res.json(
        JSend.success({
            items: result.items,
            metadata: result.metadata,
        })
    );
}

async function getItemsByFilter(req, res, next) {
    let result = {
        items: [],
        metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 5,
        }
    };

    try {
        // Pass query parameters (e.g., item_name, item_type, item_status) for filtering
        result = await menu_itemsService.getManyItems(req.query);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while retrieving menu items'));
    }

    return res.json(
        JSend.success({
            items: result.items,
            metadata: result.metadata,
        })
    );
}

async function getManyMenuItemsByPrice(req, res, next) {
    try {
        // Extract query parameters, including min_price and max_price
        const { min_price, max_price, page, limit } = req.query;

        // Call the menu_itemsService function to get filtered menu items
        const result = await menu_itemsService.getManyMenuItemsByPrice({
            min_price,
            max_price,
            page,
            limit
        });

        return res.json(JSend.success({ 
            menu_items: result.menu_items,
            metadata: result.metadata
        }));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while retrieving menu items'));
    }
}


module.exports = {
    getItemByName,
    getItemsByFilter,
    getManyMenuItemsByPrice,
};
