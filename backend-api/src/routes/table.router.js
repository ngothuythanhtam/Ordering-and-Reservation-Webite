const express = require('express');
const tableController = require('../controllers/table.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/v1/table', router);
/**
 * @swagger
 * /api/v1/table/table_status:
 *   get:
 *     summary: Get many tables by filter status
 *     description: Retrieve tables by filtering status
 *     parameters:
 *       - $ref: '#/components/parameters/tableStatusParam'
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
    // Catch all methods that are not allowed for these routes and return 405 error
    router.all('/', methodNotAllowed);
};
