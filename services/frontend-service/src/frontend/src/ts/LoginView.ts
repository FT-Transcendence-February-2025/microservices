import AbstractView from "./AbstractView.js";
import type Router from "./Router.js"

export default class LoginView extends AbstractView {
    constructor(router: Router) {
        super(router);
    }

    async getHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <form id="loginForm" method="post" class="bg-white p-6 rounded-lg">
                <label for="email" class="block text-sm font-bold mb-2">Email:</label>
                <input type="email" id="email" name="email" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 mb-4">
                
                <label for="password" class="block text-sm font-bold mb-2">Password:</label>
                <input type="password" id="password" name="password" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 mb-6">
                
                <div class="flex justify-center">
                    <button type="submit" class="btn-primary">Login</button>
                </div>
            </form>    
        </div>
        `;
    }

    init() {
        (document.getElementById('loginForm') as HTMLElement).addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
    
            const response = await fetch('http://127.0.0.1:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
    
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                alert('Login successful');
            } else {
                alert('Login failed');
            }
        });
    }
}