const reservationService = require('../services/reservation.service');
const usersService = require('../services/users.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function getReservation(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: Bạn không có quyền chỉnh sửa thông tin này!'));
    }
    const { reservation_id } = req.params;  

    if (!reservation_id) {
        return next(new ApiError(400, 'reservation_id là bắt buộc'));
    }

    try {
        const reservation = await reservationService.getReservationById(reservation_id); 
        console.log({ reservation_info: reservation }); 
        if (!reservation) {
            return next(new ApiError(404, 'Không tìm thấy reservation nào!'));
        }
        return res.json(JSend.success({ reservation_info: reservation }));  
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, `Không thể lấy thông tin reservationtừ id = ${reservation_id}`));
    }
}

async function getReservationByFilter(req, res, next) {
    if (!req.session.user) {
        return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
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
        return next(new ApiError(401, 'Vui lòng đăng nhập để xem thông tin của bạn!'));
    }

    const userId = req.session.user.userid;
    console.log("staffid: ", userId)
    const userRole = await usersService.checkRole(userId);
    
    if (userRole !== 2) {
        return next(new ApiError(403, 'Forbidden: Bạn không có quyền để tạo đơn đặt bàn!'));
    }
    const { useremail, table_number } = req.body;
    const reservationData = {
        reservation_date: req.body.reservation_date,
        special_request: req.body.special_request
    };

    try {
        // Gọi hàm từ service
        const result = await reservationService.staffCreateReservation(useremail, table_number, reservationData);

        res.status(201).json({
            status: 'success',
            message: 'Tạo đơn đặt bàn thành công',
            data: result
        });
    } catch (error) {
        console.error(error);
        next(new ApiError(500, error.message || 'Lỗi! Không thể tạo đơn đặt bàn.'));
    }
}

module.exports = {
    getReservation,
    getReservationByFilter,
    staffCreateReservation,
};
