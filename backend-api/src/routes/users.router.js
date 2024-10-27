const express = require('express');
const usersController = require('../controllers/users.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');
const imgUpload = require('../middlewares/img-upload.middleware');

const multer = require('multer');
const upload = multer();
const router = express.Router();
module.exports.setup = (app) => {
    app.use('/api/v1/users', router);

/**
 * @swagger
 * /api/v1/users/user/role/{role_name}:
 *   get:
 *     summary: Get user by role
 *     description: Retrieve users by filter role
 *     parameters:
 *       - $ref: '#/components/parameters/roleNameParam'
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: A list of filtered users
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
 *                     users_by_role:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Users'
 *                     metadata:
 *                       $ref: '#/components/schemas/PaginationMetadata'
 *       400:
 *         description: Invalid request, missing or invalid fields
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         description: Not Found
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500InternalServerError'
 */
    router.get('/user/role/:role_name', usersController.getManyUsersByRole);

/**
 * @swagger
 * /api/v1/users/email:
 *   get:
 *     summary: Get user by email
 *     description: Get user by email
 *     parameters:
 *       - $ref: '#/components/parameters/useremailParam'
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Get user by email
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
 *                     user_by_mail:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Users'
 *       400:
 *         description: Invalid request, missing or invalid fields
 *         $ref: '#/components/responses/400BadRequest'
 *       404:
 *         description: Not Found
 *         $ref: '#/components/responses/404NotFound'
 *       500:
 *         description: Internal server error
 *         $ref: '#/components/responses/500InternalServerError'
 */
    router.get('/email', usersController.getUserByMail);
    
    // Catch all methods that are not allowed for these routes and return 405 error
    router.all('/', methodNotAllowed);
};
