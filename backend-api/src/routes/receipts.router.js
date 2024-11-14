const express = require('express'); 
const receiptsControllerCustomer = require('../controllers/Customer/receipts.controller'); 
const receiptsControllerStaff = require('../controllers/Staff/receipts.controller'); 

const { methodNotAllowed } = require('../controllers/errors.controller'); 
const avatarUpload = require('../middlewares/avatar-upload.middleware'); 
const router = express.Router(); 
const multer = require('multer');
const upload = multer();


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
    router.post('/addTable/', avatarUpload, receiptsControllerCustomer.addReservation);
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
    router.get('/filterreceipt/', receiptsControllerCustomer.getReceiptsByFilter);
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
    router.post('/cart/', avatarUpload,receiptsControllerCustomer.createReceipt);
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
    router.post('/addItem', avatarUpload,receiptsControllerCustomer.addItemToReceipt);
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
    router.delete('/removeFromCart/', avatarUpload, receiptsControllerCustomer.deleteItemFromReceipt);
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
    router.put('/customer/verify/', avatarUpload, receiptsControllerCustomer.verifyCustomer);  
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
 *               order_id:
 *                 type: integer
 *                 description: Order ID
 *                 required: true
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
    router.put('/customer/cancel/', avatarUpload, receiptsControllerCustomer.cancelCustomer);
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
    router.get('/mycart/', receiptsControllerCustomer.getCart);

/**
 * @swagger
 * /api/receipts/verify/ByStaff/{order_id}:
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
    router.put('/verify/ByStaff/:order_id', upload.none(),receiptsControllerStaff.staffVerifyReceipt);  

/**
 * @swagger
 * /api/receipts/ByStaff/:
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
    router.get('/ByStaff/', receiptsControllerStaff.staffGetReceiptsByFilter)

/**
 * @swagger
 * /api/receipts/ByStaff/{order_id}:
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
    router.get('/ByStaff/:order_id', receiptsControllerStaff.staffGetReceipt);


    router.all('/',methodNotAllowed);
}; 