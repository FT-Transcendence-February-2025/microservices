import Router from "./Router.js";

const router = new Router();

document.addEventListener("DOMContentLoaded", () => {
    router.route()
});

window.addEventListener("popstate", () => router.route());
