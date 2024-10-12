const favoriteService = require('../services/favorite.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');
/**
 * Controller to handle getting tables by seating capacity.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */

// Function to get favorite items by user ID
async function getFavoriteItems(req, res, next) {
    const { userid } = req.params; // Get user ID from the URL parameters

    // Validate the user ID
    if (!userid || isNaN(userid)) {
        return next(new ApiError(400, 'Invalid user ID. It should be a valid number.'));
    }

    let result = {
        items: [],
        metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 5, // Default limit, can be adjusted based on the query
        }
    };

    try {
        // Retrieve favorite items for the specified user ID with pagination support
        result = await favoriteService.getFavoriteItems(userid, req.query);

        // Check if any items were found
        if (result.items.length === 0) {
            return res.status(404).json(JSend.fail({ message: 'No favorite items found for this user.' }));
        }

        // Return the favorite items with metadata
        return res.status(200).json(JSend.success({
            items: result.items,
            metadata: result.metadata,
        }));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while fetching favorite items.'));
    }
}

async function getFavId(req, res, next) {
    const { userid, item_id } = req.params;

    try {
        const fav = await favoriteService.getFavIdByUserIdAndItemId(userid, item_id);
        
        if (!fav) {
            return next(new ApiError(404, 'Favorite item not found'));
        }

        return res.json(JSend.success({
            fav_id: fav.fav_id,
        }));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Error retrieving favorite item'));
    }
}

async function deleteItem(req, res, next) {
    const { userid, item_id } = req.params;

    try {
        const deletedFavItem = await favoriteService.deleteItemFromCart(userid, item_id);
        
        if (!deletedFavItem) {
            return next(new ApiError(404, 'Favorite item not found'));
        }

        return res.json(JSend.success({
            message: `Item with fav_id = ${deletedFavItem.fav_id} has been removed from favorite`,
            item: deletedFavItem,
        }));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Error removing item from favorite'));
    }
}

async function addFavoriteItem(req, res, next) {
    const { userid, item_id } = req.params;

    try {
        // Check if userid and item_id are provided
        if (!userid || !item_id) {
            return next(new ApiError(400, 'User ID and Item ID are required'));
        }

        // Check if the item already exists in the user's favorites
        const itemExists = await favoriteService.checkIfItemExistsInFavorites(userid, item_id);

        if (itemExists) {
            return next(new ApiError(400, 'Item already exists in favorites'));
        }

        // If item doesn't exist, proceed to add it
        const favorite = await favoriteService.addFavorite(userid, item_id);

        // Return success response
        return res.json(JSend.success({
            message: 'Item added to favorites',
            item: favorite
        }));
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'Error adding item to favorites'));
    }
}


module.exports = {
    getFavoriteItems,
    getFavId,
    deleteItem,
    addFavoriteItem,
};
