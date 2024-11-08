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

function makeReceiptService(){
    const baseUrl = '/api/receipts';

    async function fetchReceipts(page, limit = 10) {
        let url = `${baseUrl}/?page=${page}&limit=${limit}`;
        const data = await efetch(url);

        data.receipts = data.receipts.map((receipt) => {
            return {
                ...receipt,
            };
        });
        return data;
    }

    async function fetchReceipt(order_id) {
        const { receipt } = await efetch(`${baseUrl}/${order_id}`);
        return {
            ...receipt,
        };
    }

    async function getReceipts(page, limit = 10) {
        let url = `${baseUrl}?page=${page}&limit=${limit}`;
        const data = await efetch(url);
        data.receipts = data.receipts.map((receipt) => {
            return {
                ...receipt,
            };
        });
        return data;
    }

    return {
        fetchReceipts,
        fetchReceipt,
        getReceipts,
    }
}
export default makeReceiptService();