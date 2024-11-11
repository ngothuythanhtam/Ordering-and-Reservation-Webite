const express = require('express');
const menu_itemsController = require('../controllers/menu_items.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/menu_items', router);

/**
 * @swagger
 * /api/menu_items:
 *   get:
 *     summary: Get menu items by filter
 *     description: Retrieve menu items by item filter
 *     parameters:
 *       - in: query
 *         name: item_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Filter by menu item name
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - (staff)
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
    router.get('/', menu_itemsController.getItemsByFilter);

/**
 * @swagger
 * /api/menu_items:
 *   post:
 *     summary: Staff create a new menu item
 *     description: Add a new menu item to the database
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     tags:
 *       - (staff)
 *     responses:
 *       201:
 *         description: Successfully created a new menu item
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
 *                     newItem:
 *                       $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Bad request, either invalid input or the item name already exists
 *         $ref: '#/components/responses/400'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500'
 */
    router.post('/',imgUpload, menu_itemsController.createItem);

/**
 * @swagger
 * /api/menu_items/{item_id}:
 *   get:
 *     summary: Get item by id
 *     description: Get item by id
 *     parameters:
 *       - $ref: '#/components/parameters/itemIdParam'
 *     tags:
 *       - (staff)
 *     responses:
 *       200:
 *         description: menu items
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
 *       404:
 *         description: Contact not found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500'
 */
    router.get('/:item_id', menu_itemsController.getItem);

/**
 * @swagger
 * /api/menu_items/{item_id}:
 *   put:
 *     summary: Staff update item by id
 *     description: Update an existing menu item by id
 *     parameters:
 *       - $ref: '#/components/parameters/itemIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     tags:
 *       - (staff)
 *     responses:
 *       200:
 *         description: Successfully updated menu item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   description: Response status
 *                 data:
 *                   type: object
 *                   properties:
 *                     item:
 *                       $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Bad request
 *         $ref: '#/components/responses/400'
 *       404:
 *         description: Item not found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500'
 */
    router.put('/:item_id', imgUpload, menu_itemsController.updateItem);

/**
 * @swagger
 * /api/menu_items/{item_id}:
 *   delete:
 *     summary: Staff delete item by id
 *     description: Delete an existing menu item by id
 *     parameters:
 *       - $ref: '#/components/parameters/itemIdParam'
 *     tags:
 *       - (staff)
 *     responses:
 *       200:
 *         description: Menu item deleted
 *         $ref: '#/components/responses/200NoData'
 *       400:
 *         description: Bad request
 *         $ref: '#/components/responses/400'
 *       404:
 *         description: Item not found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500'
 */
    router.delete('/:item_id', menu_itemsController.deleteItem);
    router.all('/:item_id', methodNotAllowed);

/**
 * @swagger
 * /api/menu_items:
 *   delete:
 *     summary: Staff delete all items
 *     description: Delete all menu items
 *     tags:
 *       - (staff)
 *     responses:
 *       200:
 *         description: Menu item deleted
 *         $ref: '#/components/responses/200NoData'
 *       400:
 *         description: Bad request
 *         $ref: '#/components/responses/400'
 *       404:
 *         description: Item not found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500'
 */
    router.delete('/', menu_itemsController.deleteAllItems);

    // Catch all methods that are not allowed for these routes and return 405 error
    router.all('/', methodNotAllowed);
};
