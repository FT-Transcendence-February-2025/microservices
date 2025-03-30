import { postApiData, postApiFormData } from './APIManager.js'

interface ApiResponse {
    success: boolean;
    errorMessage?: string;
}

export default class User {
    static displayName: string = '';
    static email: string = '';
    static avatar: HTMLImageElement = new Image();

    static async login(email: string, password: string): Promise<ApiResponse> {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            console.log(response);
            const data = await response.json();
            
            if (data.token) {
                localStorage.setItem('accessToken', data.token);
                return { success: true };
            }
            else {
                return {
                    success: false,
                    errorMessage: data.error || "Server returned an error.",
                };
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message || "An unexpected error occurred.",
            };
        }
    }

    static async register(displayName: string, email: string, password: string): Promise<ApiResponse> {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, displayName, password })
            });

            const data = await response.json();

            if (response.ok)
                return { success: true };
            else {
                return {
                    success: false,
                    errorMessage: data.error || "Server returned an error.",
                };
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message || "An unexpected error occurred.",
            };
        }
    }

    static async logout(): Promise<ApiResponse> {
        try {
            const response = await postApiData('/api/user/display-name', {});
            const data = await response.json();
    
            if (response.ok) { 
                // remove refresh token cookie !!!!!
                localStorage.removeItem('accessToken');
                return { success: true };
            }
            else {
                return {
                    success: false,
                    errorMessage: data.error || "Server returned an error.",
                };
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message || "An unexpected error occurred.",
            };
        }
    }

    static async changeDisplayName(displayName: string): Promise<ApiResponse> {
        try {
            const body = JSON.stringify({ displayName });
            const response = await postApiData('/api/user/display-name', body);
            const data = await response.json();
        
            if (response.ok) {
                User.displayName = displayName;
                return { success: true };
            }
            else {
                return {
                    success: false,
                    errorMessage: data.error || "Server returned an error.",
                };
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message || "An unexpected error occurred.",
            };
        }
    }

    static async changeEmail(email: string): Promise<ApiResponse> {
        try {
            const body = JSON.stringify({ email });
            const response = await postApiData('/api/auth/email', body);
            
            const data = await response.json();
    
            if (response.ok) {
                User.email = email;
                return { success: true };
            }
            else {
                return {
                    success: false,
                    errorMessage: data.error || "Server returned an error.",
                };
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message || "An unexpected error occurred.",
            };
        }
    }

    static async changePassword(password: string): Promise<ApiResponse> {
        try {
            const body = JSON.stringify({ password });
            const response = await postApiData('/api/auth/password', body);
            const data = await response.json();
    
            if (response.ok) {
                return { success: true };
            }
            else {
                return {
                    success: false,
                    errorMessage: data.error || "Server returned an error.",
                };
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message || "An unexpected error occurred.",
            };
        }
    }

    static async changeAvatar(file: File): Promise<ApiResponse> {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await postApiFormData('/api/user/avatar-change', formData);
            const data = await response.json();
    
            if (response.ok) {
                const avatarUrl = data.filePath;
                User.avatar.src = avatarUrl;
                return { success: true };
            }
            else {
                return {
                    success: false,
                    errorMessage: data.error || "Server returned an error.",
                };
            }
        } catch (error: any) {
            return {
                success: false,
                errorMessage: error.message || "An unexpected error occurred.",
            };
        }
    }
}