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

function makeTableService(){
    const baseUrl = '/api/table';

    async function fetchTables(page, limit = 10) {
        let url = `${baseUrl}/ByStaff/?page=${page}&limit=${limit}`;
        const data = await efetch(url);

        data.tables = data.tables.map((table) => {
            return {
                ...table,
            };
        });
        return data;
    }

    async function fetchTable(table_id) {
        const { table } = await efetch(`${baseUrl}/ByStaff/${table_id}`);
        return {
            ...table,
        };
    }

    async function createTable(table) {
        return efetch(`${baseUrl}/ByStaff`, {
            method: 'POST',
            body: table,
        });
    }

    async function deleteTable(table_id) {
        return efetch(`${baseUrl}/ByStaff/${table_id}`, {
            method: 'DELETE',
        });
    }

    async function getTables(page, limit = 10) {
        let url = `${baseUrl}/ByStaff/?page=${page}&limit=${limit}`;
        const data = await efetch(url);
        data.tables = data.tables.map((table) => {
            return {
                ...table,
            };
        });
        return data;
    }

    return {
        fetchTables,
        fetchTable,
        createTable,
        deleteTable,
        getTables,
    }
}
export default makeTableService();