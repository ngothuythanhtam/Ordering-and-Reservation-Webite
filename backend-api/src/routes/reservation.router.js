const express = require('express');
const reservationController = require('../controllers/reservation.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/v1/reservation', router);
/**
 * @swagger
 * /api/v1/reservation/get/:
 *   get:
 *     summary: Get reservation
 *     description: Get reservation
 *     tags:
 *       - Reservation
 *     parameters:
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     responses:
 *       '200':
 *         description: Successfully retrieved favorite items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   description: The response status
 *                 items:
 *                   type: array
 *                   reservation:
 *                     type: object
 *                     properties:
 *                       reservation_id:
 *                         type: integer
 *                         description: 
 *                       userid:
 *                         type: integer
 *                         description: The ID of the user.             
 *                       username:
 *                         type: string
 *                         description: The username of the user.
 *                       useremail:
 *                         type: integer
 *                         description: The ID of the menu item.
 *                       userphone:
 *                         type: string
 *                         description: The name of the menu item.
 *                       reservation_date:
 *                         type: string
 *                         fortmat: date
 *                         description: The date of reservation
 *                       special_request:
 *                         type: string
 *                         description: A brief request of user.
 *                       create_at:
 *                         type: string
 *                         description: The date time that reservation created.
 *                       status:
 *                         type: string
 *                         description: Status of reservation.
 *                 metadata:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *       '400':
 *         description: Invalid user email supplied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                   description: The response status
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       '404':
 *         description: No reservation found for the specified user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                   description: The response status
 *                 message:
 *                   type: string
 *                   description: Error message.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                   description: The response status
 *                 message:
 *                   type: string
 *                   description: Error message.
 */
    router.get('/get/', reservationController.getReservation);

/**
 * @swagger
 * /api/v1/reservation/status:
 *   get:
 *     summary: Get reservations by status
 *     description: Retrieve reservations by status.
 *     tags:
 *       - Reservation
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         description: Filter reservations by status
 *         schema:
 *           type: string
 *           enum: ['booked', 'confirmed', 'completed', 'canceled']
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     responses:
 *       '200':
 *         description: Successfully retrieved reservations by status
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reservation_id:
 *                         type: integer
 *                         description: The ID of the reservation
 *                       status:
 *                         type: string
 *                         description: The status of the reservation
 *                       reservation_date:
 *                         type: string
 *                         format: date
 *                         description: The date of the reservation
 *                       special_request:
 *                         type: string
 *                         description: Any special request for the reservation
 *       '400':
 *         description: Invalid request, missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                   description: The response status
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '404':
 *         description: No reservations found for the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                   description: The response status
 *                 message:
 *                   type: string
 *                   description: Error message
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [fail]
 *                   description: The response status
 *                 message:
 *                   type: string
 *                   description: Error message
 */
    router.get('/status', reservationController.getReservationByStatus);
    router.all('/', methodNotAllowed);
};