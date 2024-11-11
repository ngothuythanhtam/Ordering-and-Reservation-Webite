const express = require('express'); 
const multer = require('multer');
const upload = multer();
const receiptsController = require('../controllers/receipts.controller'); 
const { methodNotAllowed } = require('../controllers/errors.controller'); 
const avatarUpload = require('../middlewares/avatar-upload.middleware'); 
const router = express.Router(); 

module.exports.setup = (app) => { 
    app.use('/api/receipts', router); 
    
/**
 * @swagger
 * /api/receipts/{id}/addItem:
 *   post:
 *     summary: Add a item to Receipt
 *     description: Add a item to Receipt
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/OrderItem'
 *     tags:
 *       - receipts
 *     responses:
 *       201:
 *         description: Add a item to OrderItem
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
 *                     contact:
 *                         $ref: '#/components/schemas/OrderItem'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 *       400:
 *         description: Bad Request - Invalid input or missing parameters
 *         $ref: '#/components/responses/400' 
 */
    router.post('/:id/addItem', avatarUpload,receiptsController.addItemToReceipt);

/**
 * @swagger
 * /api/receipts/verify/{order_id}:
 *   put:
 *     summary: Change status of a specific receipt
 *     description: Please check carefully before change status ordering.
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order to change status.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ReceiptStatus'
 *     tags:
 *       - (staff)
 *     responses:
 *       200:
 *         description: Change status of a specific receipt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The response status
 *                   enum:
 *                     - success
 *                 data:
 *                   type: object
 *                   properties:
 *                     receipt:
 *                       $ref: '#/components/schemas/ReceiptStatus'
 *         $ref: '#/components/responses/200NoData'
 *       400:
 *         description: Bad Request - Invalid input or missing parameters
 *         $ref: '#/components/responses/400'
 *       404:
 *         description: Not Found - Resource not found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 */
    router.put('/verify/:order_id', upload.none(),receiptsController.staffVerifyReceipt);  

/**
 * @swagger
 * /api/receipts:
 *   get:
 *     summary: Get many user's receipts by filtering
 *     description: Retrieve many users' receipts by filtering
 *     parameters:
 *       - in: query
 *         name: userid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filter by table number
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - (staff)
 *     responses:
 *       200:
 *         description: A list of filtered user's receipts
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
 *                         $ref: '#/components/schemas/Receipt'
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
    router.get('/', receiptsController.staffGetReceiptsByFilter)

/**
 * @swagger
 * /api/receipts/{order_id}:
 *   get:
 *     summary: Get receipt by id along with its order items
 *     description: Retrieve receipt information along with all order items for a specific order_id
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Find receipt by order_id
 *     tags:
 *       - (staff)
 *     responses:
 *       200:
 *         description: Found receipt with order items
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
 *                     receipt_info:
 *                       type: object
 *                       $ref: '#/components/schemas/GetReceipt'
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
    router.get('/:order_id', receiptsController.staffGetReceipt);
    router.all('/',methodNotAllowed);

}; 