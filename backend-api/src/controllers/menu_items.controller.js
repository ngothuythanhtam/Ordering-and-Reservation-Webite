const menu_itemsService = require('../services/menu_items.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

// FUNCTION FOR STAF
async function addMenuItems(req, res, next) {
    if (!req.body?.item_name || typeof req.body.item_name !== 'string') {
        return next(new ApiError(400, 'Invalid input', { code: 'INVALID_INPUT' }));
    }

    try {
        // Kiểm tra tên món đã tồn tại hay chưa
        const existingItem = await menu_itemsService.getItemByName(req.body.item_name);
        if (existingItem) {
            return next(new ApiError(400, 'Item name already exists. Please choose a different name.', { code: 'DUPLICATE_ITEM_NAME' }));
        }

        const newItems = await menu_itemsService.addMenuItems({
            ...req.body,
            img_url: req.file ? `/public/uploads/${req.file.filename}` : null,
        });

        return res
          .status(201)
          .set({
            Location: `${req.baseUrl}/${newItems.id}`, 
          })
          .json(
            JSend.success({ 
              newItems
            })
          );
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while creating the new menu items'));
    }
}

async function updateMenuItemsByName(req, res, next) {
    if (Object.keys(req.body).length === 0 && !req.file) {
        return next(new ApiError(400, 'Data to update cannot be empty'));
    }
    
    try {
        // Kiểm tra tên món đã tồn tại hay chưa
        const existingItem = await menu_itemsService.getItemByName(req.body.item_name);
        if (existingItem) {
            return next(new ApiError(400, 'Item name already exists. Please choose a different name.', { code: 'DUPLICATE_ITEM_NAME' }));
        }
        const { name } = req.params;  // Use name from params
        const updated = await menu_itemsService.updateMenuItemsByName(name, {
            ...req.body,
            img_url: req.file ? `/public/uploads/${req.file.filename}` : null,
        });
        if (!updated) {
            return next(new ApiError(404, 'Menu item not found'));
        }
        return res.json(
            JSend.success({
                item: updated,
            })
        );
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error updating menu item with name=${name}`));
    }
}

async function deleteMenuItemByName(req, res, next) {
    const { name } = req.params;  // Use name from params

    try {
        const deletedItem  = await menu_itemsService.deleteMenuItemByName(name);
        if (!deletedItem ){
            return next(new ApiError(404, `Menu item with name=${name} not found`));
        }
        return res.json(JSend.success({
            message: `Menu item with name = ${name} has been deleted`,
            item: deletedItem
        }));
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error deleting menu item with name=${name}`));
    }
}

// FUNCTION FOR USER (STAFF & CUSTOMER)
async function getItemByName(req, res, next) {
  const { name } = req.query;  // get the 'name' from query parameters

  try {
    const menu_items = await menu_itemsService.getItemByName(name);  // use name to find item
    if (!menu_items) {
      return next(new ApiError(404, 'Item not found'));
    }
    return res.json(JSend.success({ menu_items }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving item with name=${name}`));
  }
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

async function getTypeItemsByFilter(req, res, next) {
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
        result = await menu_itemsService.getManyItemsByType(req.query);
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

async function getManyMenuItemsByType_Price(req, res, next) {
    try {
        // Extract query parameters, including min_price and max_price
        const { item_name, item_type, item_status, min_price, max_price, page, limit } = req.query;

        // Call the menu_itemsService function to get filtered menu items
        const result = await menu_itemsService.getManyMenuItemsByType_Price({
            item_name,
            item_type,
            item_status,
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
    addMenuItems,
    updateMenuItemsByName,
    deleteMenuItemByName,
    getItemByName,
    getItemsByFilter,
    getTypeItemsByFilter,
    getManyMenuItemsByPrice,
    getManyMenuItemsByType_Price,
};
