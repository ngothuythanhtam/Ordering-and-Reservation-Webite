import { DEFAULT_AVATAR } from '@/constants';

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

function makeUserService() {
    const baseUrl = '/api/users';

    async function login(useremail, userpwd) {
        const data = await efetch(`${baseUrl}/login/`, {
            method: 'POST',
            body: JSON.stringify({ useremail: useremail, userpwd: userpwd }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return data;
    }

    async function logout() {
        return efetch(`${baseUrl}/logout/`, {
            method: 'POST',
        });
    }

    async function createUser(user) {
        return efetch(`${baseUrl}/registration/`, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async function getUser() {
        const { user } = await efetch(`${baseUrl}/info/`);
        return {
            ...user,
            useravatar: user.useravatar ?? DEFAULT_AVATAR
        };
    }

    async function updateUser(user) {
        return efetch(`${baseUrl}/updateProfile/`, {
            method: 'PUT',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async function deleteUser() {
        return efetch(`${baseUrl}/deleteAccount/`, {
            method: 'DELETE',
        });
    }

    return {
        login,
        logout,
        createUser,
        getUser,
        updateUser,
        deleteUser
    };
}

// Xuất makeUserService dưới dạng một hàm
export { makeUserService }; // Đảm bảo rằng bạn xuất hàm này