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

function makeTableService() {
    const baseUrl = '/api/table';

    async function fetchTables(page, limit = 4) {
        let url = `${baseUrl}/table_status?&limit=${limit}&page=${page}`;
        const data = await efetch(url);
        data.items = data.items.map((table) => {
            return { ...table };
        });
        return data;
    }
    return {
        fetchTables,
    };
}
export default makeTableService() ;
