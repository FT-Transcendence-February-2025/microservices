import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Start"); 
    }

    async getHtml() {
        return `
        <div class="h-screen w-screen flex justify-center items-center bg-[url('/images/background.jpg')] bg-cover bg-no-repeat">
            <div class="flex flex-col space-y-4 items-center">
                <div class="flex flex-col space-y-4">
                    <button onclick="navigateTo('/menu/play')" class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Play</button>
                    <button class="bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-lg border-b-8 border-pink-800 active:border-pink-900 active:translate-y-1 duration-150">Tournament</button>
                </div>
            </div>
        </div>
        `;
    }
}