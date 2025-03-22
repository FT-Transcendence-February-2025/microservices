export default class User {
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

    // static isLoggedIn(): boolean {
        

    // }

    // static logout(): void {

    // }

    // static changeDisplayName(): Promise<boolean> {

    // }

    // static changeEmail(): Promise<boolean> {

    // }

    // static changePassword(): Promise<boolean> {

    // }

    // static changeAvatar(): Promise<boolean> {

    // }
}