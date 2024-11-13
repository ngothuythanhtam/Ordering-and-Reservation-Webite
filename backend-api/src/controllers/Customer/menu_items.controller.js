const menu_itemsService = require('../../services/Customer/menu_items.service');
const ApiError = require('../../api-error');
const JSend = require('../../jsend');

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

module.exports = {
    getItemByName,
    
};
