const express = require('express');
const menu_itemsController = require('../controllers/Customer/menu_items.controller');
const { methodNotAllowed } = require('../controllers/Customer/errors.controller');

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
    router.get('/name', menu_itemsController.getItemByName);
    // Catch all methods that are not allowed for these routes and return 405 error
    router.all('/', methodNotAllowed);
};
