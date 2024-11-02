const knex = require('../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')
const ApiError = require('../api-error');

function FavoriteRepository() {
    return knex('favorite');
}

async function getFavoriteItems(userid, query) {
    const { page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);

    try {
        let favoriteItems = await FavoriteRepository() 
            .join('menu_items as mi', 'favorite.item_id', 'mi.item_id') 
            .join('users as u', 'u.userid', 'favorite.userid') 
            .select(
                knex.raw('count(favorite.fav_id) OVER() AS recordCount'), 
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
            .where('favorite.userid', userid) 
            .limit(paginator.limit)
            .offset(paginator.offset); 

        let totalRecords = 0;
        favoriteItems = favoriteItems.map((item) => {
            totalRecords = item.recordCount; 
            delete item.recordCount; 
            return item;
        });

        return {
            metadata: paginator.getMetadata(totalRecords), 
            items: favoriteItems, 
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
        .first(); 
}

async function deleteItemFromCart(userid, item_id) {
   
    const favItem = await getFavIdByUserIdAndItemId(userid, item_id);
    
    if (!favItem) {
        return null; 
    }

    await FavoriteRepository().where('fav_id', favItem.fav_id).del();
    
    return favItem; 
}

async function checkIfItemExistsInFavorites(userid, item_id) {
    try {
        const existingItems = await getItemIdsByUserIdfromFav(userid);

        console.log("Existing Favorite Items:", existingItems);

        return existingItems.some(item => item.item_id === parseInt(item_id));
    } catch (error) {
        console.error("Error checking favorite item:", error);
        throw new Error("Could not check if item exists in favorites.");
    }
}

async function getItemIdsByUserIdfromFav(userid) {
    try {
        const itemIds = await knex('favorite')
            .where('userid', userid) 
            .select('item_id'); 

        return itemIds;
    } catch (error) {
        console.error('Error retrieving item IDs:', error);
        throw new Error('Could not retrieve item IDs for the user.');
    }
}

async function addFavorite(userid, item_id) {
    try {
        const [newFavId] = await FavoriteRepository()
            .insert({ userid, item_id });  

        const newFavorite = await FavoriteRepository()
            .where('fav_id', newFavId)
            .select('*')
            .first();

        return newFavorite;  
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
