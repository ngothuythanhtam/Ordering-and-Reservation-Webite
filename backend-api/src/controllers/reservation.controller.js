const reservationService = require('../services/reservation.service');
const ApiError = require('../api-error');
const JSend = require('../jsend');

async function addReservation(req, res, next) {
    try {
        const { useremail, table_number, reservation_date, special_request } = req.body;

        if (!useremail || !reservation_date || !table_number) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields: useremail, table_number, or reservation_date"
            });
        }

        const newReservation = await reservationService.createReservation(useremail, table_number, {
            reservation_date,
            special_request
        });

        return res.status(201).json({
            status: "success",
            data: {
                reservation_id: newReservation.reservation_id,
                reservation_date: newReservation.reservation_date,
                special_request: newReservation.special_request,
                status: newReservation.status,
                user: {
                    username: newReservation.user.username,
                    useremail: newReservation.user.useremail
                },
                table: {
                    table_number: newReservation.table.table_number,
                    seating_capacity: newReservation.table.seating_capacity,
                    table_status: newReservation.table.table_status
                }
            }
        });

    } catch (error) {
        console.error("Error adding reservation:", error);
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

async function getReservationByStatus(req, res, next) {
    try {
        const { status } = req.query; 

        if (!status) {
            return res.status(400).json(JSend.fail({ message: 'Status is required.' }));
        }

        const reservations = await reservationService.getReservationByStatus(status);

        if (reservations.length === 0) {
            return res.status(404).json(JSend.fail({ message: 'No reservations found for this status.' }));
        }

        return res.status(200).json(JSend.success({ reservations }));

    } catch (error) {
        console.error('Error fetching reservations by status:', error);
        return res.status(500).json(JSend.fail({ message: 'An error occurred while fetching reservations.' }));
    }
}

async function getReservation(req, res, next) {
    const { reservation_id } = req.params;  

    if (!reservation_id) {
        return next(new ApiError(400, 'reservation_id is required'));
    }

    try {
        const reservation = await reservationService.getReservationById(reservation_id);  
        if (!reservation) {
            return next(new ApiError(404, 'reservation not found'));
        }
        return res.json(JSend.success({ reservation_info: reservation }));  
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, `Error retrieving item with reservation id = ${reservation_id}`));
    }
}

async function getReservationByFilter(req, res, next) {
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

module.exports = {
    addReservation,
    getReservationByStatus,
    getReservation,
    getReservationByFilter,
};
