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
        const formData = new FormData();
        formData.append('useremail', useremail);
        formData.append('userpwd', userpwd);
        const data = await efetch(`${baseUrl}/login/`, {
            method: 'POST',
            body: formData,
        });
        return data.data;
    }

    async function logout() {
        return efetch(`${baseUrl}/logout/`, {
            method: 'POST',
        });
    }

    async function createUser(user) {
        return efetch(`${baseUrl}/registration/`, {
            method: 'POST',
            body: user,
        });
    }
    async function getUser() {
        const userid = localStorage.getItem('userid');
        const { user } = await efetch(`${baseUrl}/info/`);
        return {
            ...user,
            useravatar: user.useravatar ?? DEFAULT_AVATAR
        };
    }
    async function updateUser(user) {
        const userid = localStorage.getItem('userid');
        return efetch(`${baseUrl}/updateProfile/`, {
            method: 'PUT',
            body: user,
        });
    }

    async function deleteUser() {
        const userid = localStorage.getItem('userid');
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
        deleteUser,
    };
}

export default makeUserService() ;
