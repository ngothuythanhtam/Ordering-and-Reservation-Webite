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
    return {
        addItemToReceipt,
        addTableToReceipt
    };
}
export default makeReceiptService() ;
