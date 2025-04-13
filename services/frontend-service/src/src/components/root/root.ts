export default class RootContainer extends HTMLElement {
    constructor() {
        super();
        
        // if (this._hasCookie())
        //     this._loadProfile();
        // else
            // redirect to login
    }

    // private _hasCookie(name: string): boolean {
    //     const cookieName = `${name}=`;
    //     return document.cookie.includes(cookieName);
    //   }

    private _loadProfile() {

    }
}

customElements.define("root-container", RootContainer);