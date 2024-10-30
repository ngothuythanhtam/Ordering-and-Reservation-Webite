const express = require('express');
const cors = require('cors');
const JSend = require('./jsend');
const usersRouter = require('./routes/users.router');
const tablesRouter = require('./routes/tables.router');
const receiptsRouter = require('./routes/receipts.router');
const { serve } = require('swagger-ui-express');
const{
    resourceNotFound,
    handleError,
} = require('./controllers/errors.controller')
const { specs, swaggerUi } = require('./docs/swagger');
const app = express();
const multer = require('multer');
app.use('/public', express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    return res.json(JSend.success());
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

usersRouter.setup(app);
tablesRouter.setup(app);
receiptsRouter.setup(app);

app.use(resourceNotFound);
app.use(handleError);
module.exports = app;