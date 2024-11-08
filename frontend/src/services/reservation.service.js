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
        const { reservation } = await efetch(`${baseUrl}/${reservation_id}`);
        return {
            ...reservation,
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

    return {
        fetchReservations,
        fetchReservation,
        getReservations,
    }
}
export default makeReservationService();