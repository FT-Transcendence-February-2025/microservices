import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        // this.setTitle("Register"); 
    }

    async getHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
           <form id="register-form" class="bg-white p-6 rounded-lg">
                <label for="display-name" class="block text-gray-700 text-sm font-bold mb-2">Display Name:</label>
                <input type="text" id="display-name" name="display-name" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4">
                <label for="register-email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <input type="email" id="register-email" name="email" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4">
                <label for="register-password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                <input type="password" id="register-password" name="password" required class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-6">
                <div class="flex justify-center">
                    <button type="submit" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Register</button>
                </div>
            </form>
        </div>   
        `;
    }

    async afterRender() {
        (document.getElementById('register-form') as HTMLElement).addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = (document.getElementById('register-email') as HTMLInputElement).value;
            const displayName = (document.getElementById('display-name') as HTMLInputElement).value;
            const password = (document.getElementById('register-password') as HTMLInputElement).value;

            const response = await fetch('http://127.0.0.1:3001/register', {
            	method: 'POST',
            	headers: {
            		'Content-Type': 'application/json',
            	},
            	body: JSON.stringify({ email, displayName, password })
            });

            const data = await response.json();
            if (data.success) {
            	alert(data.success);
            } else {
            	alert(data.error);
            }
        });
    }
}