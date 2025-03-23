export default class User {
    static async login(email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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

    // static async refreshToken(): Promise<boolean> {

    // }

    // static isLoggedIn(): boolean {
        
    // check only for token in storagre? or check if token is vaild on server ?
    // }

    // static logout(): void {

    // }

    static async register(displayName: string, email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, displayName, password })
            });

            const data: { success?: string } = await response.json();

            if (data.success)
                return true;
            else 
                return false;
        }
        catch (error) {
            console.error('Register error:', error);
            return false;
        }
    }


    // static changeDisplayName(): Promise<boolean> {

    // }

    // static changeEmail(): Promise<boolean> {

    // }

    // static changePassword(): Promise<boolean> {

    // }

    // static changeAvatar(): Promise<boolean> {

    // }
}