const express = require('express');
const reservationController = require('../controllers/Staff/reservation.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/reservation', router);

/**
 * @swagger
 * /api/reservation:
 *   get:
 *     summary: Get many tables by filtering
 *     description: Retrieve many tables by filtering
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
 *                         $ref: '#/components/schemas/Reservation'
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
    router.get('/', reservationController.getReservationByFilter)

/**
 * @swagger
 * /api/reservation/{reservation_id}:
 *   get:
 *     summary: Get table by id
 *     description: Get table by id
 *     parameters:
 *       - in: path
 *         name: reservation_id
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
 *                     reservation_info:
 *                       type: object
 *                       $ref: '#/components/schemas/GetReservation'
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
    router.get('/:reservation_id', reservationController.getReservation);

/**
 * @swagger
 * /api/reservation/ByStaff:
 *   post:
 *     summary: Staff create a new reservation for customer
 *     description: Create a reservation by providing useremail, reservation_date, party_size, and optional special_request.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               useremail:
 *                 type: string
 *                 description: The email of the user making the reservation
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
 *       - (staff)
 *     responses:
 *       201:
 *         description: Reservation successfully created
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
 *                     reservation_id:
 *                       type: integer
 *                       description: The ID of the created reservation
 *                     reservation_date:
 *                       type: string
 *                       format: date
 *                       description: The reservation date
 *                     party_size:
 *                       type: integer
 *                       description: The size of the party
 *                     special_request:
 *                       type: string
 *                       description: The user's special request (if any)
 *                     status:
 *                       type: string
 *                       description: The status of the reservation
 *                       enum: [booked, confirmed, completed, canceled]
 *                     user:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           description: Name of the user who made the reservation
 *                         useremail:
 *                           type: string
 *                           description: Email of the user who made the reservation
 *                     table:
 *                       type: object
 *                       properties:
 *                         table_number:
 *                           type: string
 *                           description: number of table
 *                         seating_capacity:
 *                           type: integer
 *                           description: size of table
 *                         table_status:
 *                           type: string
 *                           description: table status
 *       400:
 *         description: Missing required fields or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [error]
 *                 message:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [error]
 *                 message:
 *                   type: string
 *                   description: User not found error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [error]
 *                 message:
 *                   type: string
 *                   description: Internal server error message
 */
    router.post('/ByStaff', upload.none(),reservationController.staffCreateReservation);
    
    // Catch all methods that are not allowed for these routes and return 405 error
    router.all('/', methodNotAllowed);
};