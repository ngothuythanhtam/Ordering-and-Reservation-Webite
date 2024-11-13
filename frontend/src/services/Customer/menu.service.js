import { DEFAULT_ITEM } from '@/constants';

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

function makeMenuService() {
    const baseUrl = '/api/menu_items';

    async function fetchItems(page, limit = 8) {
        let url = `${baseUrl}/name/?page=${page}&limit=${limit}`;
        const data = await efetch(url);
        data.items = data.items.map((item) => {
            return {
                ...item,
                img_url: item.img_url ?? DEFAULT_ITEM
            };
        });
        return data;
    }
    return {
        fetchItems,
    };
}

export default makeMenuService() ;
