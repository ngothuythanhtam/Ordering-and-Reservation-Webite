const express = require('express');
const tableControllerCustomer = require('../controllers/Customer/table.controller');
const tableControllerStaff = require('../controllers/Staff/table.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/table', router);
/**
 * @swagger
 * /api/table/table_status:
 *   get:
 *     summary: Get many tables by filter status
 *     description: Retrieve tables by filtering status
 *     parameters:
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - Table
 *     responses:
 *       200:
 *         description: A list of filtered table
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 table_number:
 *                   type: string
 *                   description: The response name
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Table'
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
    router.get('/table_status', tableControllerCustomer.getTableByFilter);


/**
 * @swagger
 * /api/table/ByStaff:
 *   get:
 *     summary: Get many tables by filtering
 *     description: Retrieve many tables by filtering
 *     parameters:
 *       - in: query
 *         name: table_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Filter by table number
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - (staff)
 *     responses:
 *       200:
 *         description: A list of filtered tables
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
 *                         $ref: '#/components/schemas/Table'
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
    router.get('/ByStaff', tableControllerStaff.getManyTablesByFilter)

/**
 * @swagger
 * /api/table/ByStaff/{table_id}:
 *   get:
 *     summary: Get table by id
 *     description: Get table by id
 *     parameters:
 *       - in: path
 *         name: table_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Find table by id
 *     tags:
 *       - (staff)
 *     responses:
 *       200:
 *         description: Found table with id
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
 *                     table_info:
 *                       type: object
 *                       $ref: '#/components/schemas/Table'
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
    router.get('/ByStaff/:table_id', tableControllerStaff.getTable);

/**
 * @swagger
 * /api/table/ByStaff:
 *   post:
 *     summary: Create a new table
 *     description: Chỉ có Staff mới có thể thực hiện tác vụ này!!!
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Table'
 *     tags:
 *       - (staff)
 *     responses:
 *       201:
 *         description: A new table
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
 *                     table:
 *                         $ref: '#/components/schemas/Table'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *       400:
 *         description: Bad Request - Invalid input or missing parameters
 */
    router.post('/ByStaff', imgUpload,tableControllerStaff.createTable);

/**
 * @swagger
 * /api/table/ByStaff/{table_id}:
 *   delete:
 *     summary: Delete table by id
 *     description: Delete table by id
 *     parameters:
 *       - in: path
 *         name: table_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Delete table by id
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
    router.delete('/ByStaff/:table_id', imgUpload, tableControllerStaff.deleteTable); 
    // Catch all methods that are not allowed for these routes and return 405 error
    router.all('/', methodNotAllowed);
};
