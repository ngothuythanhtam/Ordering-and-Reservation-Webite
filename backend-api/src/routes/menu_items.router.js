const express = require('express');
const menu_itemsController = require('../controllers/menu_items.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/v1/menu_items', router);
/**
 * @swagger
 * /api/v1/menu_items/name:
 *   get:
 *     summary: Get menu items by name
 *     description: Retrieve menu items by item name
 *     parameters:
 *       - in: query
 *         name: item_name
 *         schema:
 *           type: string
 *         description: Filter by menu item name
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - User / Menu
 *     responses:
 *       200:
 *         description: A list of filtered menu items
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MenuItem'
 *                     metadata:
 *                       $ref: '#/components/schemas/PaginationMetadata'
 *       400:
 *         description: Invalid request, missing or invalid fields
 *         $ref: '#/components/responses/400'
 *       404:
 *         description: Not Found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500'
 */
    router.get('/name', menu_itemsController.getItemByName);  // using GET with a query parameter

/**
 * @swagger
 * /api/v1/menu_items/items:
 *   get:
 *     summary: Get menu items by applying optional filters (name, type, status)
 *     description: Retrieve menu items by applying optional filters (item name, type, status).
 *     parameters:
 *       - in: query
 *         name: item_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Filter by menu item name
 *       - in: query
 *         name: item_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['Salad','Soup', 'Side Dish','Dessert','Beverage', 'Snack', 'Breakfast', 'Lunch', 'Dinner']
 *         description: Filter by menu item type (e.g., 'Food', 'Drink')
 *       - in: query
 *         name: item_status
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filter by availability (1 for available, 0 for unavailable)
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - User / Menu
 *     responses:
 *       200:
 *         description: A list of filtered menu items
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MenuItem'
 *                     metadata:
 *                       $ref: '#/components/schemas/PaginationMetadata'
 *       400:
 *         description: Invalid request, missing or invalid fields
 *         $ref: '#/components/responses/400'
 *       404:
 *         description: Not Found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500'
 */
    router.get('/items', menu_itemsController.getItemsByFilter);

/**
 * @swagger
 * /api/v1/menu_items/price:
 *   get:
 *     summary: Get menu items by price
 *     description: Retrieve menu items by applying optional filters price.
 *     parameters:
 *       - in: query
 *         name: min_price
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Filter by minimum price.
 *       - in: query
 *         name: max_price
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Filter by maximum price.
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - User / Menu
 *     responses:
 *       200:
 *         description: A list of filtered menu items
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MenuItem'
 *                     metadata:
 *                       $ref: '#/components/schemas/PaginationMetadata'
 *       400:
 *         description: Invalid request, missing or invalid fields
 *         $ref: '#/components/responses/400'
 *       404:
 *         description: Not Found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500'
 */
    router.get('/price', menu_itemsController.getManyMenuItemsByPrice);

    // Catch all methods that are not allowed for these routes and return 405 error
    router.all('/', methodNotAllowed);
};
