const menu_itemsService = require('../../services/Staff/menu_items.service');
const usersService = require('../../services/Customer/users.service');
const ApiError = require('../../api-error');
const JSend = require('../../jsend');

async function getItemsByFilter(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission to edit this information!'));
    }
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

async function deleteAllItems(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission to edit this information!'));
    }
    try{
        await menu_itemsService.deleteAllItems();

        return res.json(JSend.success());
    } catch(error){
        console.log(error)
        return next(
            new ApiError(500, 'An error occured while removing all items')
        );
    }
}

async function getItem(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId);
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission to edit this information!'));
    }

    const { item_id } = req.params;
    try {
        console.log(`Received item_id: ${item_id}`);
        const parsedItemId = parseInt(item_id, 10);

        // Validate parsed item_id
        if (isNaN(parsedItemId)) {
            return next(new ApiError(400, 'Invalid item ID'));
        }

        const item = await menu_itemsService.getItemById(parsedItemId);
        console.log({ item_id, item });

        if (!item) {
            return next(new ApiError(404, 'Item not found'));
        }

        return res.json(JSend.success({ item }));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, `Error retrieving item with id=${item_id}`));
    }
}


async function createItem(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);

    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission to edit this information!'));
    }
    try {

        if (!req.body?.item_name || typeof req.body.item_name !== 'string') {
            return next(new ApiError(400, 'Invalid input', { code: 'INVALID_INPUT' }));
        }

        // Kiểm tra tên món đã tồn tại hay chưa
        const existingItem = await menu_itemsService.getItemByName(req.body.item_name);
        if (existingItem) {
            return next(new ApiError(400, 'Item name already exists. Please choose a different name.', { code: 'DUPLICATE_ITEM_NAME' }));
        }

        const item = await menu_itemsService.createItem({
            ...req.body,
            img_url: req.file ? `/public/uploads/${req.file.filename}` : null,
        });
        console.log(item);
        return res
          .status(201)
          .set({
            Location: `${req.baseUrl}/${item.item_id}`, 
          })
          .json(
            JSend.success({ 
              item
            }));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while creating the new menu item'));
    }
}

async function updateItem(req, res, next) {
    // Kiểm tra nếu session không tồn tại hoặc không có userid
    if (!req.session.user) {
        return next(new ApiError(401,'Please log in!'));
    }
    console.log(req.session.user.userid);

    // Lấy userID từ session
    const userId  = req.session.user.userid;
    try {

        // // Kiểm tra vai trò người dùng
        const userRole = await usersService.checkRole(userId);
        if (userRole !== 2  ) {
            return next(new ApiError(403, 'Forbidden: You do not have permission to add menu items', { code: 'FORBIDDEN' }));
        }

        // Check if both req.body and req.file are empty
        if (Object.keys(req.body).length === 0 && !req.file) {
            return next(new ApiError(400, 'Data to update cannot be empty'));
        }

        const { item_id } = req.params;

        // Fetch the current item from the database
        const currentItem = await menu_itemsService.getItemById(item_id);
        if (!currentItem) {
            return next(new ApiError(404, 'Menu item not found'));
        }

        // If the new name is different, check for duplicates
        if (req.body.item_name && req.body.item_name !== currentItem.item_name) {
            const existingItem = await menu_itemsService.getItemByName(req.body.item_name);
            if (existingItem) {
                return next(new ApiError(400, 'Item name already exists. Please choose a different name.', { code: 'DUPLICATE_ITEM_NAME' }));
            }
        }

        // Proceed to update the item
        const updated = await menu_itemsService.updateItem(item_id, {
            ...req.body,
            img_url: req.file ? `/public/uploads/${req.file.filename}` : currentItem.img_url,
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
        return next(new ApiError(500, `Error updating menu item with name=${item_id}`));
    }
}

async function deleteItem(req, res, next) {
    // Kiểm tra nếu session không tồn tại hoặc không có userid
    if (!req.session.user) {
        return next(new ApiError(401,'Please log in!'));
    }
    console.log(req.session.user.userid);

    // Lấy userID từ session
    const userId  = req.session.user.userid;
    
    try {
        // Kiểm tra vai trò người dùng
        const userRole = await usersService.checkRole(userId);
        if (userRole !== 2  ) {
            return next(new ApiError(403, 'Forbidden: You do not have permission to add menu items', { code: 'FORBIDDEN' }));
        }
        const { item_id } = req.params;  // Use item_name from params
        const deleted  = await menu_itemsService.deleteItem(item_id);
        if (!deleted ){
            return next(new ApiError(404, `Menu item with id=${item_id} not found`));
        }
        return res.json(JSend.success({
            message: `Menu item with id = ${item_id} has been deleted`,
            item: deleted
        }));
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error deleting menu item with id=${item_id}`));
    }
}



module.exports = {
    getItemsByFilter,
    deleteAllItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
};
