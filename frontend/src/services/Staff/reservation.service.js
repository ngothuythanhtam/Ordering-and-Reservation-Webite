/**
* @param {string} url
* @param {RequestInit} options
* @returns Promise<Response>
*/

async function efetch(url, options = {}) {
    let result = {};
    let json = {};
    try {
        result = await fetch(url, options);
        json = await result.json();
    } catch (error) {
        throw new Error(error.message);
    }
    if (!result.ok || json.status !== 'success') {
        throw new Error(json.message);
    }
    return json.data;
}

function makeReservationService(){
    const baseUrl = '/api/reservation';

    async function fetchReservations(page, limit = 10) {
        let url = `${baseUrl}?page=${page}&limit=${limit}`;
        const data = await efetch(url);

        data.reservations = data.reservations.map((reservation) => {
            return {
                ...reservation,
            };
        });
        return data;
    }

    async function fetchReservation(reservation_id) {
        const response = await efetch(`${baseUrl}/${reservation_id}`);
        const { reservation_info: reservation } = response
        return {
            ...reservation,
            table_number: reservation.table_number,
        };
    }
    

    async function getReservations(page, limit = 10) {
        let url = `${baseUrl}?page=${page}&limit=${limit}`;
        const data = await efetch(url);
        data.reservations = data.reservations.map((reservation) => {
            return {
                ...reservation,
            };
        });
        return data;
    }

    async function createReserv(reservation) {
        return efetch(`${baseUrl}/ByStaff`, {
            method: 'POST',
            body: reservation,
        });
    }


    return {
        fetchReservations,
        fetchReservation,
        getReservations,
        createReserv,
    }
}
export default makeReservationService();