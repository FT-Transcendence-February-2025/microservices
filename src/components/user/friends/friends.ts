import FriendsTemplate from './friends.html?raw';
import User from '../../../utils/User';

const template = document.createElement('template');
template.innerHTML = FriendsTemplate;

interface IFriend {
    id: number
    displayName: string
    avatarPath: string
    wins: number
    loses: number
    onlineStatus: boolean
}

export default class Friends extends HTMLElement {
    private _friendsTable: HTMLTableElement;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._friendsTable = this.querySelector('#friendsTable') as HTMLTableElement;
        if (!this._friendsTable)
            throw new Error("Could not find friends Table element");
        this._fillFriendTable();
    }

    private _fillFriendTable() {
        User.getFriendList()
        .then((friendsData: IFriend[]) => {
            if (friendsData) {
                friendsData.forEach((friend) => {
                    this._addFriendToTable(friend);
                });
            }
        });
    }

    private _addFriendToTable(friend: IFriend) {
        const onlineStatusColor = friend.onlineStatus ? 'green' : 'red';
        this._friendsTable.innerHTML += `
        <tr>
        <td class="flex items-center space-x-2">
            <div class="relative">
                <img id="avatar" src="${friend.avatarPath}" class="w-10 h-10 rounded-full border-2 border-pink-600 cursor-pointer">
                <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-${onlineStatusColor}-500"></span>
            </div>
            <a href="/profile#${friend.displayName}">${friend.displayName}</a>
            </td>
        </tr>`;
    }
}

customElements.define("friend-list", Friends);