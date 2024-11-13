const express = require('express');
const usersController = require('../controllers/Customer/users.controller');
const { methodNotAllowed } = require('../controllers/errors.controller');

const avatarUpload = require('../middlewares/avatar-upload.middleware');
const router = express.Router(); 
module.exports.setup = (app) => { 
    app.use('/api/users', router);

/**
 * @swagger
 * /api/users/login/:
 *   post:
 *     summary: Login
 *     description: Login into System
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               useremail:
 *                 type: string
 *                 format: email
 *                 description: Email của người dùng
 *               userpwd:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu tài khoản của người dùng
 *     tags:
 *       - users
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The response status
 *                   enum: [success]
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 *       400:
 *         description: Bad Request - Invalid input or missing parameters
 *         $ref: '#/components/responses/400' 
 */
    router.post('/login/', avatarUpload,usersController.login);
/**
 * @swagger
 * /api/users/logout/:
 *   post:
 *     summary: Logout
 *     description: Logout into System
 *     tags:
 *       - users
 *     responses:
 *       200:
 *         description: Logout success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: The response status
 *                   enum: [success]
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 *       400:
 *         description: Bad Request - Invalid input or missing parameters
 *         $ref: '#/components/responses/400' 
 */
    router.post('/logout/',usersController.logout);
/**
 * @swagger
 * /api/users/registration/:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userrole:
 *                 type: integer
 *                 enum: [1]
 *                 description: ID của vai trò người dùng
 *               username:
 *                 type: string
 *                 description: Tên người dùng
 *               userbirthday:
 *                 type: string
 *                 format: date
 *                 description: Ngày sinh của người dùng
 *               userphone:
 *                 type: string
 *                 description: Số điện thoại của người dùng
 *               useremail:
 *                 type: string
 *                 format: email
 *                 description: Email của người dùng
 *               userpwd:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu tài khoản của người dùng
 *               useraddress:
 *                 type: string
 *                 description: Địa chỉ của người dùng
 *               useravatar:
 *                 type: string
 *                 readOnly: true
 *                 description: Đường dẫn ảnh đại diện người dùng
 *               useravatarFile:
 *                 type: string
 *                 format: binary
 *                 writeOnly: true
 *                 description: Ảnh đại diện người dùng
 *     tags:
 *       - users
 *     responses:
 *       201:
 *         description: A new user
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
 *                         $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 *       400:
 *         description: Bad Request - Invalid input or missing parameters
 *         $ref: '#/components/responses/400' 
 */
router.post('/registration/', avatarUpload, usersController.createUser);
router.all('/',methodNotAllowed);
/** 
 * @swagger
 * /api/users/info/:
 *   get:
 *     summary: Get user by ID
 *     description: Get user by ID
 *     tags:
 *       - users
 *     responses:
 *       200:
 *         description: A user
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
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Not Found - Resource not found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 */
router.get('/info/', usersController.getUser);
/**
 * @swagger
 * /api/users/updateProfile/:
 *   put:
 *     summary: Update user by ID 
 *     description: Update user by ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     tags:
 *       - users
 *     responses:
 *       200:
 *         description: An updated user
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
 *                       $ref: '#/components/schemas/User'
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
router.put('/updateProfile/',avatarUpload, usersController.updateUser); 

/**
 * @swagger
 * /api/users/deleteAccount/:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete user by ID
 *     tags:
 *       - users
 *     responses:
 *       200:
 *         description: User deleted
 *         $ref: '#/components/responses/200NoData'
 *       404:
 *         description: Not Found - Resource not found
 *         $ref: '#/components/responses/404'
 *       500:
 *         description: Internal Server Error - Unexpected error on the server
 *         $ref: '#/components/responses/500'
 * 
 */    
    router.delete('/deleteAccount/', avatarUpload, usersController.deleteUser);
    router.all('/:id',methodNotAllowed);
};