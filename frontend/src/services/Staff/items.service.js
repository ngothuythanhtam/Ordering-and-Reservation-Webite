import { DEFAULT_IMG } from '@/constants';
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

function makeItemsService() {
    const baseUrl = '/api/menu_items';

    async function fetchItems(page, limit = 10) {
        let url = `${baseUrl}/ByStaff?page=${page}&limit=${limit}`;
        const data = await efetch(url);

        data.items = data.items.map((item) => {
            return {
                ...item,
                img_url: item.img_url ?? DEFAULT_IMG
            };
        });

        return data;
    }

    async function fetchItem(item_id) {
        const { item } = await efetch(`${baseUrl}/ByStaff/${item_id}`);
        return {
            ...item,
            img_url: item.img_url ?? DEFAULT_IMG
        };
    }

    async function createItem(item_name, item_type, item_description, item_price, item_status, img_url) {
        const data = await efetch(`${baseUrl}/ByStaff`, {
            method: 'POST',
            body: item_name, item_type, item_description, item_price, item_status, img_url,
        });
        return data.item;
    }
    async function deleteAllItems() {
        return efetch(`${baseUrl}/ByStaff`, {
            method: 'DELETE',
        });
    }
    
    async function updateItem(item_id, item) {
        return efetch(`${baseUrl}/ByStaff/${item_id}`, {
            method: 'PUT',
            body: item,
        });
    }
    async function deleteItem(item_id) {
        return efetch(`${baseUrl}/ByStaff/${item_id}`, {
            method: 'DELETE',
        });
    }
    async function getItems(page, limit = 10) {
        let url = `${baseUrl}/ByStaff/?page=${page}&limit=${limit}`;
        const data = await efetch(url);
        data.items = data.items.map((item) => {
            return {
                ...item,
                img_url: item.img_url ?? DEFAULT_IMG
            };
        });
        return data;
    }
    return {
        fetchItems,
        fetchItem,
        createItem,
        updateItem,
        deleteItem,
        deleteAllItems,
        getItems,
    };
}
export default makeItemsService();