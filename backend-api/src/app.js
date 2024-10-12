const express = require('express');
const cors = require('cors');
    
// Middleware to use CORS
const JSend = require('./jsend');

const usersRouter = require('./routes/users.router');
const menu_itemsRouter = require('./routes/menu_items.router');
const favoriteRouter = require('./routes/favorite.router');
const tableRouter = require('./routes/table.router');
const reservationRouter = require('./routes/reservation.router');

const{
    resourceNotFound,
    handleError,
} = require('./controllers/errors.controller');
const { specs, swaggerUi } = require('./docs/swagger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/public', express.static('public'));

// Routes
app.get('/', (req, res) => {
    return res.json(
        JSend.success()
    );
});

usersRouter.setup(app);
menu_itemsRouter.setup(app);
favoriteRouter.setup(app);
tableRouter.setup(app);
reservationRouter.setup(app);

//Handle 404    
app.use(resourceNotFound);

//Define error-handling middleware last, after other app.use() and routes calls
app.use(handleError);

module.exports = app;

