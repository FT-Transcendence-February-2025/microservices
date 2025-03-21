export default class Auth {
    // static isLoggedIn(): boolean {
    //     // Check if the user is logged in
    //     // This could be checking for a token in localStorage, or a cookie, etc.
    //     return localStorage.getItem('userToken') !== null;
    // }

    static async login(email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data: { token?: string } = await response.json();

            if (data.token) {
                localStorage.setItem('accesstoken', data.token);
                return true;
            } 
            else
                return false;
        }
        catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    // static logout(): void {
    //     // Remove the token when the user logs out
    //     localStorage.removeItem('userToken');
    // }
}