import { postApiData, postApiFormData } from './APIManager.js'

export default class User {
    static displayName: string = '';
    static email: string = '';
    static avatar: HTMLImageElement = new Image();

    static async login(email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            // const data = response.bodyUsed ? await response.json() : null;
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.token);
                return true;
            }
            else {
                const error = data ? data : response.statusText || "Server returned an error.";
                console.error(`Login failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Login failed: ${error.message}`);
            return false;
        }
    }

    static async register(displayName: string, email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch('http://localhost:3001/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, displayName, password })
            });

            if (response.ok)
                return true;
            else {
                const data = response.bodyUsed ? await response.json() : null;
                const error = data ? data : response.statusText || "Server returned an error.";
                console.error(`Register failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Register failed: ${error.message}`);
            return false;
        }
    }

    static async logout(): Promise<boolean> {
        try {
            const response = await postApiData('http://localhost:3001/logout', {});

            if (response.ok) {
                // remove refresh token cookie !!!!!
                localStorage.removeItem('accessToken');
                return true;
            }
            else {
                const data = response.bodyUsed ? await response.json() : null;
                const error = data ? data : response.statusText || "Server returned an error.";
                console.error(`Logout failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Logout failed: ${error.message}`);
            return false;
        }
    }

    static async changeDisplayName(displayName: string): Promise<boolean> {
        try {
            const body = JSON.stringify({ displayName });
            const response = await postApiData('/api/user/display-name', body);

            if (response.ok) {
                User.displayName = displayName;
                return true;
            }
            else {
                const data = response.bodyUsed ? await response.json() : null;
                const error = data ? data : response.statusText || "Server returned an error.";
                console.error(`Changing DisplayName failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Changing DisplayName failed: ${error.message}`);
            return false;
        }
    }

    static async changeEmail(email: string): Promise<boolean> {
        try {
            const body = JSON.stringify({ email });
            const response = await postApiData('/api/auth/email', body);
           
            if (response.ok) {
                User.email = email;
                return true;
            }
            else {
                const data = response.bodyUsed ? await response.json() : null;
                const error = data ? data : response.statusText || "Server returned an error.";
                console.error(`Changing email failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Changing email failed: ${error.message}`);
            return false;
        }
    }

    static async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        try {
            const body = JSON.stringify({ currentPassword: oldPassword, newPassword: newPassword });
            const response = await postApiData('/api/auth/password', body);

            if (response.ok)
                return true;
            else {
                const data = response.bodyUsed ? await response.json() : null;
                const error = data ? data : response.statusText || "Server returned an error.";
                console.error(`Changing Password failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Changing Password failed: ${error.message}`);
            return false;
        }
    }

    static async changeAvatar(file: File): Promise<boolean> {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await postApiFormData('/api/avatar-change', formData);
            const data = response.body ? await response.json() : null;

            if (response.ok) {
                const avatarUrl = data.filePath;
                User.avatar.src = avatarUrl;
                return true;
            }
            else {
                const data = response.bodyUsed ? await response.json() : null;
                const error = data ? data : response.statusText || "Server returned an error.";
                console.error(`Changing Avatar failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Changing Avatar failed: ${error.message}`);
            return false;
        }
    }
}