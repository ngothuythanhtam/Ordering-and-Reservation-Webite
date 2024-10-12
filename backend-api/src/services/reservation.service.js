const knex = require('../database/knex');
const Paginator = require('./paginator');
const {unlink} = require('node:fs')
const ApiError = require('../api-error');

function reservationRepository() {
    return knex('reservation'); // table from database
}

async function createReservation(useremail, table_number, reservationData) {
    try {
        // Fetch the user details by email
        const user = await knex('users')
            .select('userid', 'username', 'useremail')
            .where({ useremail })
            .first();

        if (!user) {
            throw new Error('User not found');
        }

        // Fetch table details based on table_number
        const table = await knex('restaurant_table')
            .select('table_id', 'table_number', 'seating_capacity', 'status')
            .where({ table_number })
            .first();

        if (!table) {
            throw new Error('Table not found');
        }

        if (table.status !== 'available') {
            throw new Error('Table is not available');
        }

        // Insert new reservation
        const [newReservationId] = await knex('reservation').insert({
            userid: user.userid,
            table_id: table.table_id,
            reservation_date: reservationData.reservation_date,
            special_request: reservationData.special_request || null,
            status: 'booked'  // Default reservation status
        });

        // Update table status to 'reserved'
        await knex('restaurant_table')
            .where({ table_id: table.table_id })
            .update({ status: 'reserved' });

        // Return the newly created reservation details along with user and table info
        return {
            reservation_id: newReservationId,
            reservation_date: reservationData.reservation_date,
            special_request: reservationData.special_request || null,
            status: 'booked',
            user: {
                username: user.username,
                useremail: user.useremail,
            },
            table: {
                table_number: table.table_number,
                seating_capacity: table.seating_capacity,
                table_status: 'reserved'  // Updated status
            }
        };

    } catch (error) {
        console.error("Error creating reservation:", error);
        throw new Error(error.message || "Could not create reservation");
    }
}

async function updateReservationStatus(reservation) {
    try {
        // Update reservation status
        await knex('reservation')
            .where({ reservation_id: reservation.reservation_id })
            .update({ status: reservation.status });

        return reservation;

    } catch (error) {
        console.error('Error updating reservation status:', error);
        throw new Error('Could not update reservation status');
    }
}

async function getReservationByEmail(useremail, query) {
    const { page = 1, limit = 5 } = query;
    const paginator = new Paginator(page, limit);

    try{
        let reserv = await reservationRepository()
            .join ('users as u', 'reservation.userid', 'u.userid')
            .select(
                knex.raw('count(reservation.reservation_id) OVER() AS recordCount'),
                'reservation.reservation_id',
                'u.userid',
                'u.username',
                'u.useremail',
                'u.userphone',
                'reservation.*',
            )
            .where('u.useremail', useremail)
            .limit(paginator.limit) // Apply limit for pagination
            .offset(paginator.offset); 

        // Extract total records
        let totalRecords = 0;
        reserv = reserv.map((item) => {
            totalRecords = item.recordCount; // Extract total records
            delete item.recordCount; // Remove recordCount from each item
            return item;
        });

        return {
            metadata: paginator.getMetadata(totalRecords), // Return pagination metadata
            reservation: reserv, // Return favorite items
        };
    } catch (error) {
        console.error("Error fetching favorite items:", error);
        throw new Error("Could not fetch favorite items.");
    }
    
}

async function getReservationByStatus(status) {
    try {
        // Fetch reservations by status
        const reservations = await knex('reservation')
            .where({ status })
            .select('reservation_id', 'status', 'reservation_date', 'special_request');

        return reservations;
    } catch (error) {
        console.error('Error fetching reservations by status:', error);
        throw new Error('Could not fetch reservations by status.');
    }
}

module.exports = {
    createReservation,
    updateReservationStatus,
    getReservationByEmail,
    getReservationByStatus,
};
