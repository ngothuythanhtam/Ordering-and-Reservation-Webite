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

function makeReceiptService() {
    const baseUrl = '/api/receipts';

    async function addItemToReceipt({ item_id, quantity }) {
        const userid = localStorage.getItem('userid');
        return efetch(`${baseUrl}/addItem`, {
            method: 'POST',
            body: JSON.stringify({ item_id, quantity }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async function deleteItemdfromReceipt({ item_id, quantity }) {
        const userid = localStorage.getItem('userid');
        return efetch(`${baseUrl}/removeFromCart/`, {
            method: 'DELETE',
            body: JSON.stringify({ item_id, quantity }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async function addTableToReceipt({ table_number, reservation_date, special_request }) {
        const userid = localStorage.getItem('userid');
        return efetch(`${baseUrl}/addTable/`, {
            method: 'POST',
            body: JSON.stringify({ table_number, reservation_date, special_request }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async function myCart() {
        const response = await fetch(`${baseUrl}/mycart/`, {
            method: 'GET',
        });
        return await response.json();
    }
    async function verify(status) {
        const userid = localStorage.getItem('userid');
        const formData = new FormData();
        formData.append('status', status);
        return efetch(`${baseUrl}/customer/verify/`, {  // Fix the URL here
            method: 'PUT',
            body: formData, 
        });
    }
    async function cancel(order_id, status) {
        const userid = localStorage.getItem('userid');
        const formData = new FormData();
        formData.append('order_id', order_id);
        formData.append('status', status);
        const response = await efetch(`${baseUrl}/customer/cancel/`, {
            method: 'PUT',
            body: formData // Using FormData instead of JSON
        });
        return response.json();
    }
    async function filterReceipts(page, limit = 8) {
        let url = `${baseUrl}/filterreceipt/?page=${page}&limit=${limit}`;
        const data = await efetch(url)
        data.receipts = data.receipts.map((receipts) => {
            return {
                ...receipts,
            };
        });
        console.error("Đến từ service:",data);
        return data;
    }
    return {
        addItemToReceipt,
        addTableToReceipt,
        myCart,
        deleteItemdfromReceipt,
        verify,
        cancel,
        filterReceipts
    };
}
export default makeReceiptService() ;
