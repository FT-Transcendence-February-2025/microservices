import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        // this.setTitle("Login"); 
    }

    async getHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <form id="login-form" method="post" class="bg-white p-6 rounded-lg">
                <label for="login-email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <input type="email" id="login-email" name="email" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4">
                <label for="login-password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                <input type="password" id="login-password" name="password" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-6">
                <div class="flex justify-center">
                    <button type="submit" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Login</button>
                </div>
            </form>
        </div>
        `;
    }

    async afterRender() {
        (document.getElementById('login-form') as HTMLElement).addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = (document.getElementById('login-email') as HTMLInputElement).value;
            const password = (document.getElementById('login-password') as HTMLInputElement).value;
    
            const response = await fetch('/login', {
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