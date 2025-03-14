import AbstractView from "./AbstractView.js";
import type Router from "./Router.js"

export default class UserView extends AbstractView {
    constructor(router: Router) {
        super(router);
    }

    async getHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="bg-white rounded-lg shadow-md p-6 flex items-center max-w">
                <img src="/images/shrek.jpg" alt="avatar" class="w-24 h-24 rounded-full mr-6">

                <div>
                    <h2 id="userName" class="text-xl font-semibold mb-2">John Doe</h2>
                    <p id="userEmail" class="text-gray-600 mb-4">john.doe@example.com</p>

                    <button onclick="changeInfo()" class="btn-primary"">Change Data</button>
                </div>
            </div>
        </div>
        `;
    }

    init() {

    }
}