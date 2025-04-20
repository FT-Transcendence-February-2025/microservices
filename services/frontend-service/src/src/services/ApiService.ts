import User from "./UserService.js"

async function fetchWithToken(url: string, options: any) {
    const response = await fetch(url, options);

    if (response.status === 401)
    {
        const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (refreshResponse.ok)
        {
            const data = await refreshResponse.json();
            const accessToken = data.token;
            localStorage.setItem('accessToken', accessToken);
            options.headers.Authorization = `Bearer ${accessToken}`;
            return fetch(url, options);
        }
        localStorage.removeItem('accessToken');
        User.isloggedIn = false;
        // @ts-ignore
        window.navigateTo('/login');
        alert('Unable to refresh token');
    }
    return response;
}

export async function postApiData(url: string, body: any) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetchWithToken(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: body
    });
    return response;
}

export async function postApiFormData(url: string, body: any) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetchWithToken(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: body
    });
    return response;
}

export async function getApiData(url: string) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetchWithToken(url, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        }
    });
    return response;
}