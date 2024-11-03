const knex = require('../database/knex');
const Paginator = require('./paginator');

function reservationRepository() {
    return knex('reservation'); // table from database
}

async function getReservation(id, query) {
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
            .where('u.userid', id)
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
async function getReservationByStatus(id, status) {
    try {
        // Fetch reservations by status
        const reservations = await knex('reservation')
            .where({ 'userid:': id,status })
            .select('reservation_id', 'status', 'reservation_date', 'special_request');

        return reservations;
    } catch (error) {
        console.error('Error fetching reservations by status:', error);
        throw new Error('Could not fetch reservations by status.');
    }
}

module.exports = {
    getReservation,
    getReservationByStatus,
};
