const reservationService = require('../services/reservation.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');
async function getReservation(req, res, next) {
    if (!req.session.user) return next(new ApiError(401,'Vui lòng đăng nhập để xem thông tin của bạn!'));
    const id = req.session.user.userid;
    let result = {
        reservation: [],
        metadata: {
            totalRecords: 0,
            firstPage: 1,
            lastPage: 1,
            page: 1,
            limit: 5, 
        }
    };
    try {
        result = await reservationService.getReservation(id, req.query);
        if (result.reservation.length === 0) {
            return next(new ApiError(500,  'No reservation found for this user.' ));
        }
        return res.status(200).json(JSend.success({
            reservation: result.reservation,
            metadata: result.metadata,
        }));
    } catch (error) {
        return next(new ApiError(500, 'An error occurred while fetching reservation.'));
    }
}

async function getReservationByStatus(req, res, next) {
    try {
        if (!req.session.user) return next(new ApiError(401,'Vui lòng đăng nhập để xem thông tin của bạn!'));
        const id = req.session.user.userid;
    
        const { status } = req.query; 

        if (!status) {
            return res.status(400).json(JSend.fail({ message: 'Status is required.' }));
        }

        const reservations = await reservationService.getReservationByStatus(id, status);

        if (reservations.length === 0) {
            return res.status(404).json(JSend.fail({ message: 'No reservations found for this status.' }));
        }

        return res.status(200).json(JSend.success({ reservations }));

    } catch (error) {
        console.error('Error fetching reservations by status:', error);
        return res.status(500).json(JSend.fail({ message: 'An error occurred while fetching reservations.' }));
    }
}

module.exports = {
    getReservation,
    getReservationByStatus
};
