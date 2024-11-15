const reservationService = require('../../services/Staff/reservation.service');
const receiptsService = require('../../services/Customer/receipts.service');

const usersService = require('../../services/Customer/users.service');
const ApiError = require('../../api-error');
const JSend = require('../../jsend');

async function getReservation(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission to edit this information!'));
    }
    const { reservation_id } = req.params;  

    if (!reservation_id) {
        return next(new ApiError(400, 'reservation_id is required'));
    }

    try {
        const reservation = await reservationService.getReservationById(reservation_id); 
        console.log({ reservation_info: reservation }); 
        if (!reservation) {
            return next(new ApiError(404, 'No reservation found!'));
        }
        return res.json(JSend.success({ reservation_info: reservation }));  
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, `Unable to get reservation information from id = ${reservation_id}`));
    }
}

async function getReservationByFilter(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in!'));
    }   
    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: Bạn không có quyền chỉnh sửa thông tin này!'));
    }
    let result = {
        reservations: [],
        metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 5,
        }
    };

    try {
        result = await reservationService.getManyReservations(req.query);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, 'An error occurred while retrieving reservations'));
    }

    return res.json(
        JSend.success({
            reservations: result.reservations,
            metadata: result.metadata,
        })
    );
}

async function staffCreateReservation(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Please log in!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: You do not have permission!'));
    }
    const { useremail, table_number } = req.body;
    const reservationData = {
        reservation_date: req.body.reservation_date,
        special_request: req.body.special_request
    };
    const checktable = await receiptsService.checktable(table_number, reservationData.reservation_date);
    if (checktable) {
        return next(new ApiError(401, 'This table is already booked for that time. Please choose a different date or table!'));
    }
    console.log(checktable);

    try {
        const result = await reservationService.staffCreateReservation(useremail, table_number, reservationData);

        res.status(201).json({
            status: 'success',
            message: 'Successfully created a table reservation order',
            data: result
        });
    } catch (error) {
        console.error(error);
        next(new ApiError(500, error.message || 'Error! Unable to create table reservation.'));
    }
}

module.exports = {
    getReservation,
    getReservationByFilter,
    staffCreateReservation,
};
