const express = require('express');
const reservationController = require('../controllers/reservation.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/reservation', router);

/**
 * @swagger
 * /api/reservation/add:
 *   post:
 *     summary: User create a new reservation
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
 *       - Reservation
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
    // Route to add item to favorites
    router.post('/add', upload.none(),reservationController.addReservation);

/**
 * @swagger
 * /api/reservation/update/{reservation_id}:
 *   put:
 *     summary: Staff update the status of a reservation
 *     tags: [Reservation (staff)]
 *     description: Update the status of a reservation.
 *     parameters:
 *       - name: reservation_id
 *         in: path
 *         required: true
 *         description: The reservation ID.
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
 *                 description: The new status of the reservation
 *                 enum: ['booked', 'confirmed', 'completed', 'canceled']
 *     responses:
 *       200:
 *         description: Reservation status updated.
 *       400:
 *         description: Invalid request or missing fields.
 *       500:
 *         description: Error updating reservation status.
 */
    router.put('/update/:reservation_id',upload.none(), reservationController.updateReservationStatus);

/**
 * @swagger
 * /api/reservation/status:
 *   get:
 *     summary: Staff get reservations by status
 *     description: Retrieve reservations by status.
 *     tags:
 *       - Reservation (staff)
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
    // Catch all methods that are not allowed for these routes and return 405 error
    router.all('/', methodNotAllowed);
};