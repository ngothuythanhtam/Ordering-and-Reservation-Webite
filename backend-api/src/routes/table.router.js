const express = require('express');
const tableController = require('../controllers/table.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');
const avatarUpload = require('../middlewares/avatar-upload.middleware'); 

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/table', router);

/**
 * @swagger
 * /api/table/table_number:
 *   get:
 *     summary: Get table by number
 *     description: Get table by number
 *     parameters:
 *       - in: query
 *         name: table_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Find table by number
 *     tags:
 *       - Table (staff)
 *     responses:
 *       200:
 *         description: Found table with number
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
    router.get('/table_number', tableController.getTableByNumber);  // using GET with a query parameter

/**
 * @swagger
 * /api/table/seating_capacity:
 *   get:
 *     summary: Get table by seating capacity
 *     description: Get table by seating capacity
 *     parameters:
 *       - $ref: '#/components/parameters/seating_capacity'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - Table (staff)
 *     responses:
 *       200:
 *         description: Found table with seating capacity
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
    router.get('/seating_capacity', tableController.getTableBySeating);  // using GET with a query parameter

/**
 * @swagger
 * /api/table/table_status:
 *   get:
 *     summary: Get many tables by filter status
 *     description: Retrieve tables by filtering status
 *     parameters:
 *       - $ref: '#/components/parameters/tableStatusParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - Table (staff)
 *     responses:
 *       200:
 *         description: A list of filtered table
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
    router.get('/table_status', tableController.getTableByFilter);

/** 
 * @swagger
 * /api/table/update/table-status/{table_number}:
 *   put:
 *     summary: Update the status of a restaurant table
 *     description: Update the status of a table using form-data
 *     parameters:
 *       - name: table_number
 *         in: path
 *         required: true
 *         description: The number of the table to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the table
 *                 enum: ['available', 'reserved', 'occupied']
 *     tags:
 *       - Table (staff)
 *     responses:
 *       200:
 *         description: Table status updated successfully
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
 *                     table:
 *                       $ref: '#/components/schemas/Table'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/400'
 *       404:
 *         description: Table not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/404'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/500'
 */
    router.put('/update/table-status/:table_number', upload.none(), tableController.updateTableStatus);
/**
 * @swagger
 * /api/table/create_table:
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
 *       - Table (staff)
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
    router.post('/create_table', avatarUpload,tableController.createTable);

/**
 * @swagger
 * /api/table/remove_table:
 *   delete:
 *     summary: Delete table by ID
 *     description: Delete table by ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: integer
 *                 description: Mã bàn cần xóa
 *     tags:
 *       - Table (staff)
 *     responses:
 *       200:
 *         description: Table deleted
 *         $ref: '#/components/responses/200NoData'
 *       404:
 *         description: Không tìm thấy bàn!
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 */    
    router.delete('/remove_table', avatarUpload, tableController.deleteTable);
    // Catch all methods that are not allowed for these routes and return 405 error

};
