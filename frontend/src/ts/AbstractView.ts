import type Router from "./Router.js"

export default abstract class AbstractView {
    protected router: Router;

    constructor(router: Router) {
        this.router = router;
    }

    async getHtml() {
        return ``;
    }

    init () {}
    
    clean () {}
}