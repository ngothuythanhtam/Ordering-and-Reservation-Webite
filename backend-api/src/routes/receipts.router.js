const express = require('express'); 
const receiptsController = require('../controllers/receipts.controller'); 
const { methodNotAllowed } = require('../controllers/errors.controller'); 
const avatarUpload = require('../middlewares/avatar-upload.middleware'); 
const router = express.Router(); 

module.exports.setup = (app) => { 
    app.use('/api/receipts', router); 

/**
 * @swagger
 * /api/receipts/cart/{id}:
 *   post:
 *     summary: Create a new receipt
 *     description: Create a new receipt
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
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
    router.post('/cart/:id', avatarUpload,receiptsController.createReceipt);
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
 * /api/receipts/removeFromCart/{id}:
 *   delete:
 *     summary: Delete table by ID
 *     description: Xóa món từ giỏ hàng
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
    router.delete('/removeFromCart/:id', avatarUpload, receiptsController.deleteItemFromReceipt);
/**
 * @swagger
 * /api/receipts/customer/verify/{id}:
 *   put:
 *     summary: Verify Receipt
 *     description: Please check carefully before verifying ordering.
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
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
    router.put('/customer/verify/:id', avatarUpload, receiptsController.verifyCustomer);  
/**
 * @swagger
 * /api/receipts/customer/cancel/{id}:
 *   put:
 *     summary: Cancel Receipt
 *     description: Please check carefully before verifying ordering.
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
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
    router.put('/customer/cancel/:id', avatarUpload, receiptsController.cancelCustomer);
// /**
//  * @swagger
//  * /api/receipts/staff/verify/{id}:
//  *   put:
//  *     summary: Complete Receipt
//  *     description: Please check carefully before Completing ordering.
//  *     parameters:
//  *       - $ref: '#/components/parameters/userIdParam'
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             $ref: '#/components/schemas/Complete'
//  *     tags:
//  *       - receipts
//  *     responses:
//  *       200:
//  *         description: Complete Ordering
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   description: The response status
//  *                   enum:
//  *                     - success
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     contact:
//  *                       $ref: '#/components/schemas/Complete'
//  *         $ref: '#/components/responses/200NoData'
//  *       400:
//  *         description: Bad Request - Invalid input or missing parameters
//  *         $ref: '#/components/responses/400'
//  *       404:
//  *         description: Not Found - Resource not found
//  *         $ref: '#/components/responses/404'
//  *       500:
//  *         description: Internal Server Error - Unexpected error on the server
//  *         $ref: '#/components/responses/500'
//  */
//     router.put('/customer/staff/:id', avatarUpload, receiptsController.verifyStaff);      
    router.all('/',methodNotAllowed);
}; 