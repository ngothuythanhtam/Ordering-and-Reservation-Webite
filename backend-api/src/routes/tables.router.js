const express = require('express'); 
const tablesController = require('../controllers/tables.controller'); 
const { methodNotAllowed } = require('../controllers/errors.controller'); 
const avatarUpload = require('../middlewares/avatar-upload.middleware'); 

const router = express.Router(); 

module.exports.setup = (app) => { 
    app.use('/api/tables', router); 

/**
 * @swagger
 * /api/tables/create/{id}:
 *   post:
 *     summary: Create a new table
 *     description: Chỉ có Staff mới có thể thực hiện tác vụ này!!!
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Table'
 *     tags:
 *       - tables 
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
    router.post('/create/:id', avatarUpload,tablesController.createTable);
    router.all('/', methodNotAllowed);

/**
 * @swagger
 * /api/tables/remove/{id}:
 *   delete:
 *     summary: Delete table by ID
 *     description: Delete table by ID
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
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
 *       - tables
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
    router.delete('/remove/:id', avatarUpload, tablesController.deleteTable);
    router.all('/:id', methodNotAllowed);
}