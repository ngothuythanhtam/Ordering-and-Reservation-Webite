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

    async function fetchReceipts(page, limit = 8) {
        let url = `${baseUrl}/ByStaff/?page=${page}&limit=${limit}`;
        const data = await efetch(url);

        data.receipts = data.receipts.map((receipt) => {
            return {
                ...receipt,
            };
        });
        return data;
    }

    async function fetchReceipt(order_id) {
        const response = await efetch(`${baseUrl}/ByStaff/${order_id}`);
        const { receipt_info: receipt } = response;

        return {
            ...receipt,
            order_items: receipt.order_items || []  // Bao gồm mảng order_items nếu tồn tại
        };
    }

    async function getReceipts(page, limit = 10) {
        let url = `${baseUrl}/ByStaff/?page=${page}&limit=${limit}`;
        const data = await efetch(url);
        data.receipts = data.receipts.map((receipt) => {
            return {
                ...receipt,
            };
        });
        return data;
    }

    async function updateReceipt(order_id, receipt) {
        try {
            const response = await fetch(`${baseUrl}/verify/ByStaff/${order_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(receipt),
            });
            const result = await response.json();
            console.log("API Response:", result); // Check if the server updated the status
            return result;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }
    return {
        fetchReceipts,
        fetchReceipt,
        getReceipts,
        updateReceipt,
    }
}
export default makeReceiptService();