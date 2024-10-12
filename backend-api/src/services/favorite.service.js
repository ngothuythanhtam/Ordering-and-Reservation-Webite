const knex = require('../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')
const ApiError = require('../api-error');
/**
 * Retrieves tables based on seating capacity with pagination.
 * @param {object} query - Query parameters.
 * @returns {object} - Metadata and tables data.
 */

// Repository for interacting with the `favorite` table
function FavoriteRepository() {
    return knex('favorite');
}

async function getFavoriteItems(userid, query) {
    const { page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);

    try {
        // Query for favorite items with pagination
        let favoriteItems = await FavoriteRepository() // Using the FavoriteRepository function here
            .join('menu_items as mi', 'favorite.item_id', 'mi.item_id') // Join menu_items table
            .join('users as u', 'u.userid', 'favorite.userid') // Join users table
            .select(
                knex.raw('count(favorite.fav_id) OVER() AS recordCount'), // Total records
                'favorite.fav_id',
                'u.userid',
                'u.username',
                'mi.item_id',
                'mi.item_name',
                'mi.item_type',
                'mi.item_description',
                'mi.item_price',
                'mi.img_url'
            )
            .where('favorite.userid', userid) // Filter by user ID
            .limit(paginator.limit) // Apply limit for pagination
            .offset(paginator.offset); // Apply offset for pagination

        // Extract total records
        let totalRecords = 0;
        favoriteItems = favoriteItems.map((item) => {
            totalRecords = item.recordCount; // Extract total records
            delete item.recordCount; // Remove recordCount from each item
            return item;
        });

        return {
            metadata: paginator.getMetadata(totalRecords), // Return pagination metadata
            items: favoriteItems, // Return favorite items
        };
    } catch (error) {
        console.error("Error fetching favorite items:", error);
        throw new Error("Could not fetch favorite items.");
    }
}

async function getFavIdByUserIdAndItemId(userid, item_id) {
    return FavoriteRepository()
        .select('fav_id')
        .where({ userid, item_id })
        .first(); // Chỉ lấy một kết quả
}

async function deleteItemFromCart(userid, item_id) {
    // Lấy fav_id dựa trên userid và item_id
    const favItem = await getFavIdByUserIdAndItemId(userid, item_id);
    
    if (!favItem) {
        return null; // Nếu không tìm thấy, trả về null
    }

    // Xóa món ăn khỏi giỏ hàng
    await FavoriteRepository().where('fav_id', favItem.fav_id).del();
    
    return favItem; // Trả về món đã xóa
}

async function checkIfItemExistsInFavorites(userid, item_id) {
    try {
        // Retrieve all favorite item_ids for the user
        const existingItems = await getItemIdsByUserIdfromFav(userid);

        // Log the existing items to check what's being returned
        console.log("Existing Favorite Items:", existingItems);

        // Check if the item_id is already in the user's favorites
        return existingItems.some(item => item.item_id === parseInt(item_id));
    } catch (error) {
        console.error("Error checking favorite item:", error);
        throw new Error("Could not check if item exists in favorites.");
    }
}

// Function to retrieve item_ids by user
async function getItemIdsByUserIdfromFav(userid) {
    try {
        const itemIds = await knex('favorite')
            .where('userid', userid) // Use correct column name
            .select('item_id'); // Select only item_id

        return itemIds; // Return an array of item_ids
    } catch (error) {
        console.error('Error retrieving item IDs:', error);
        throw new Error('Could not retrieve item IDs for the user.');
    }
}

async function addFavorite(userid, item_id) {
    try {
        // Thêm mục vào bảng favorite
        const [newFavId] = await FavoriteRepository()
            .insert({ userid, item_id });  // Chèn userid và item_id vào bảng favorite

        // Truy vấn lại mục vừa thêm để trả về chi tiết
        const newFavorite = await FavoriteRepository()
            .where('fav_id', newFavId)
            .select('*')
            .first();

        return newFavorite;  // Trả về đối tượng yêu thích mới
    } catch (error) {
        console.error("Error adding favorite item:", error);
        throw new Error("Could not add favorite item.");
    }
}

module.exports = {
    getFavoriteItems,
    getFavIdByUserIdAndItemId,
    deleteItemFromCart,
    getItemIdsByUserIdfromFav,
    checkIfItemExistsInFavorites,
    addFavorite,
};
