const express = require('express');
const JSend = require('./jsend');
const usersRouter = require('./routes/users.router');
const receiptsRouter = require('./routes/receipts.router');
const { serve } = require('swagger-ui-express');
const crypto = require('crypto');
const session = require('express-session');
const cors = require('cors');
const menu_itemsRouter = require('./routes/menu_items.router');
const tableRouter = require('./routes/table.router');
const reservationRouter = require('./routes/reservation.router');

const{
    resourceNotFound,
    handleError,
} = require('./controllers/Customer/errors.controller')
const { specs, swaggerUi } = require('./docs/swagger');
const app = express();
const multer = require('multer');
const secretKey = crypto.randomBytes(32).toString('hex');
app.use(session({
    secret: secretKey,
    resave: false,              // Không lưu session nếu không thay đổi
    saveUninitialized: false,   // Không lưu session nếu chưa khởi tạo
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Session tồn tại trong 1 ngày
    }
}));
app.use('/public', express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    return res.json(JSend.success());
});
app.get('/api-docs/session', (req, res) => {
    if (req.session.user && req.session.user.userid) {
        res.json({ userId: req.session.user.userid });
    } else {
        res.status(401).json({ message: 'Chưa đăng nhập' });
    }
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

usersRouter.setup(app);
receiptsRouter.setup(app);
menu_itemsRouter.setup(app);
tableRouter.setup(app);
reservationRouter.setup(app);

app.use(resourceNotFound);
app.use(handleError);
module.exports = app;