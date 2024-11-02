const express = require('express');
const favoriteController = require('../controllers/favorite.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/v1/favorite', router);

/**
 * @swagger
 * /api/v1/favorite/get-favItems-from-userid/{userid}:
 *   get:
 *     summary: Get favorite items by user ID
 *     description: Retrieve a paginated list of favorite menu items for a specific user by their user ID.
 *     tags:
 *       - Favorite
 *     parameters:
 *       - name: userid
 *         in: path
 *         required: true
 *         description: The ID of the user whose favorite items are being retrieved.
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     responses:
 *       '200':
 *         description: Successfully retrieved favorite items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   description: The response status
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fav_id:
 *                         type: integer
 *                         description: The unique identifier for the favorite item.
 *                       userid:
 *                         type: integer
 *                         description: The ID of the user.             
 *                       username:
 *                         type: string
 *                         description: The username of the user.
 *                       item_id:
 *                         type: integer
 *                         description: The ID of the menu item.
 *                       item_name:
 *                         type: string
 *                         description: The name of the menu item.
 *                       item_type:
 *                         type: string
 *                         description: The type of the menu item (e.g., Main Course, Dessert).
 *                       item_description:
 *                         type: string
 *                         description: A brief description of the menu item.
 *                       item_price:
 *                         type: number
 *                         format: float
 *                         description: The price of the menu item.
 *                       img_url:
 *                         type: string
 *                         description: The URL of the menu item image.
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *       '400':
 *         description: Invalid user ID supplied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                   description: The response status
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       '404':
 *         description: No favorite items found for the specified user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                   description: The response status
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                   description: The response status
 *                 message:
 *                   type: string
 *                   description: Error message.
 */
    router.get('/get-favItems-from-userid/:userid', favoriteController.getFavoriteItems);

/**
 * @swagger
 * /api/v1/favorite/{userid}/{item_id}/fav-id:
 *   get:
 *     summary: Retrieve fav_id by user ID and item ID
 *     description: Fetch the fav_id for a favorite item using user ID and item ID
 *     parameters:
 *       - name: userid
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: integer
 *       - name: item_id
 *         in: path
 *         required: true
 *         description: The ID of the item
 *         schema:
 *           type: integer
 *     tags:
 *       - Favorite
 *     responses:
 *       200:
 *         description: Successfully retrieved fav_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The response status
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     fav_id:
 *                       type: integer
 *       404:
 *         description: Favorite item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
    router.get('/:userid/:item_id/fav-id', favoriteController.getFavId);

/**
 * @swagger
 * /api/v1/favorite/delete-from-favorite/{userid}/{item_id}:
 *   delete:
 *     summary: Remove item from favorite by user ID and item ID
 *     description: Delete an item from the favorite for a specific user using user ID and item ID
 *     parameters:
 *       - name: userid
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: integer
 *       - name: item_id
 *         in: path
 *         required: true
 *         description: The ID of the item
 *         schema:
 *           type: integer
 *     tags:
 *       - Favorite
 *     responses:
 *       200:
 *         description: Successfully removed item from favorite
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The response status
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     item:
 *                       type: object
 *                       properties:
 *                         fav_id:
 *                           type: integer
 *       404:
 *         description: Favorite item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
    // Route to delete item from cart
    router.delete('/delete-from-favorite/:userid/:item_id', favoriteController.deleteItem);

/**
 * @swagger
 * /api/v1/favorite/add/{userid}/{item_id}:
 *   post:
 *     summary: Add item to favorites
 *     description: Add a new item to the user's favorite list, checking if the item already exists
 *     parameters:
 *       - name: userid
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: integer
 *       - name: item_id
 *         in: path
 *         required: true
 *         description: The ID of the item
 *         schema:
 *           type: integer
 *     tags:
 *       - Favorite
 *     responses:
 *       200:
 *         description: Successfully added item to favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The response status
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     item:
 *                       type: object
 *                       properties:
 *                         fav_id:
 *                           type: integer
 *                         item_id:
 *                           type: integer
 *                         userid:
 *                           type: integer
 *       400:
 *         description: Item already exists in favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
    // Route to add item to favorites
    router.post('/add/:userid/:item_id', favoriteController.addFavoriteItem);

    // Catch all methods that are not allowed for these routes and return 405 error
    router.all('/', methodNotAllowed);
};