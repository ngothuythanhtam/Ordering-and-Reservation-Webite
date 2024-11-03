const express = require('express'); 
const receiptsController = require('../controllers/receipts.controller'); 
const { methodNotAllowed } = require('../controllers/errors.controller'); 
const avatarUpload = require('../middlewares/avatar-upload.middleware'); 
const router = express.Router(); 

module.exports.setup = (app) => { 
    app.use('/api/receipts', router); 
/**
 * @swagger
 * /api/receipts/addTable/:
 *   post:
 *     summary: Add reservation
 *     description: Add table to Receipt
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               table_number:
 *                 type: string
 *                 description: The number of table that you want to book
 *               reservation_date:
 *                 type: string
 *                 format: date
 *                 description: The date of the reservation
 *               special_request:
 *                 type: string
 *                 description: Any special request from the user
 *     tags:
 *       - receipts
 *     responses:
 *       201:
 *         description: Add table to Receipt
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
 *                         $ref: '#/components/schemas/Receipt'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 *       400:
 *         description: Bad Request - Invalid input or missing parameters
 *         $ref: '#/components/responses/400' 
 */
    router.post('/addTable/', avatarUpload, receiptsController.addReservation);
/**
 * @swagger
 * /api/receipts/filterreceipt/:
 *   get:
 *     summary: Get receipts by filter
 *     description: Get receipts by filter
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['Pending', 'Ordered', 'Completed', 'Canceled']
 *         description: Filter by receipt status
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     tags:
 *       - receipts
 *     responses:
 *       200:
 *         description: A list of receipts
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
 *                     contacts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Receipt'
 *                     metadata:
 *                       $ref: '#/components/schemas/PaginationMetadata'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 */
    router.get('/filterreceipt/', receiptsController.getReceiptsByFilter);
/**
 * @swagger
 * /api/receipts/cart/:
 *   post:
 *     summary: Create a new receipt
 *     description: Create a new receipt
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Receipt'
 *     tags:
 *       - receipts
 *     responses:
 *       201:
 *         description: A new receipt
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
 *                         $ref: '#/components/schemas/Receipt'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 *       400:
 *         description: Bad Request - Invalid input or missing parameters
 *         $ref: '#/components/responses/400' 
 */
    router.post('/cart/', avatarUpload,receiptsController.createReceipt);
/**
 * @swagger
 * /api/receipts/addItem:
 *   post:
 *     summary: Add a item to Receipt
 *     description: Add a item to Receipt
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
    router.post('/addItem', avatarUpload,receiptsController.addItemToReceipt);
/**
 * @swagger
 * /api/receipts/removeFromCart/:
 *   delete:
 *     summary: Remove from Cart by ID
 *     description: Xóa món từ giỏ hàng
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/OrderItem'
 *     tags:
 *       - receipts
 *     responses:
 *       200:
 *         description: Remove from cart successfully
 *         $ref: '#/components/responses/200NoData'
 *       404:
 *         description: Không tìm thấy bàn!
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 */    
    router.delete('/removeFromCart/', avatarUpload, receiptsController.deleteItemFromReceipt);
/**
 * @swagger
 * /api/receipts/customer/verify/:
 *   put:
 *     summary: Verify Receipt
 *     description: Please check carefully before verifying ordering.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['Ordered']
 *                 description: Trạng thái đơn hàng
 *     tags:
 *       - receipts
 *     responses:
 *       200:
 *         description: Verifying Ordering
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
 *                     contact:
 *                       $ref: '#/components/schemas/Verify'
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
    router.put('/customer/verify/', avatarUpload, receiptsController.verifyCustomer);  
/**
 * @swagger
 * /api/receipts/customer/cancel/:
 *   put:
 *     summary: Cancel Receipt
 *     description: Please check carefully before verifying ordering.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['Canceled']
 *                 description: Trạng thái đơn hàng
 *     tags:
 *       - receipts
 *     responses:
 *       200:
 *         description: Verifying Ordering
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
 *                     contact:
 *                       $ref: '#/components/schemas/Verify'
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
    router.put('/customer/cancel/', avatarUpload, receiptsController.cancelCustomer);
/**
 * @swagger
 * /api/receipts/mycart/:
 *   get:
 *     summary: My cart
 *     description: Details about My Cart
 *     tags:
 *       - receipts
 *     responses:
 *       200:
 *         description: A list of detail about my cart
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
 *                     contacts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Receipt'
 *                     metadata:
 *                       $ref: '#/components/schemas/PaginationMetadata'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 */
    router.get('/mycart/', receiptsController.getCart);
/**
 * @swagger
 * /api/receipts/history/{order_id}:
 *   get:
 *     summary: Detail history Invoice
 *     description: Details history Invoice
 *     tags:
 *       - receipts
 *     parameters:
 *       - in: query
 *         name: order_id
 *         schema:
 *           type: integer
 *         description: Get Detail Invoice
 *     responses:
 *       '200':
 *         description: Successfully retrieved receipt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   description: The response status
 *                 receipt:
 *                   type: object
 *                   properties:
 *                     order_id:
 *                       type: integer
 *                     userid:
 *                       type: integer
 *                     total_price:
 *                       type: number
 *                     status:
 *                       type: string
 *                     order_date:
 *                       type: string
 *                       format: date-time
 *                 reservation:
 *                   type: object
 *                   properties:
 *                     reservation_id:
 *                       type: integer
 *                     table_id:
 *                       type: integer
 *                     reservation_date:
 *                       type: string
 *                       format: date-time
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_name:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       price:
 *                         type: number
 *       '404':
 *         description: Receipt not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error
 */
    router.get('/history/:order_id', receiptsController.getCart);
    router.all('/',methodNotAllowed);
}; 