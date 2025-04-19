import FriendsTemplate from './friends.html?raw';
import User from '../../../services/UserService';

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
    private _friendAddButton: HTMLButtonElement;
    private _friendAddInput: HTMLInputElement;

    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._friendsTable = this.querySelector('#friendsTable') as HTMLTableElement;
        if (!this._friendsTable)
            throw new Error("Could not find friends Table element");
        this._friendAddButton = this.querySelector('#friendAddButton') as HTMLButtonElement;
        if (!this._friendAddButton)
            throw new Error("Could not find friendAddButton element");
        this._friendAddInput = this.querySelector('#friendAddInput') as HTMLInputElement;
        if (!this._friendAddInput)
            throw new Error("Could not find friendAddInput element");
        this._friendAddButton.addEventListener('click', this._handleFriendAddButton.bind(this));
        this._fillFriendTable();
    }

    private _handleFriendAddButton() {
        const friendDisplayName = this._friendAddInput.value;

        User.addFriend(friendDisplayName)
        .then(success => {
            if (success)
                alert('Send friend request successful');
            else
                alert(`Sending friend request failed!`);
        });
        this._friendAddInput.value = '';
    }

    private _fillFriendTable() {
        this._friendsTable.innerHTML = '';
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

        const maxLength = 12;
        let title = '';
        let friendsDisplayName = friend.displayName;
        if (friendsDisplayName.length > maxLength) {
            friendsDisplayName = friendsDisplayName.slice(0, maxLength - 1) + '.';
            title = `title="${friend.displayName}"`;
        }
        this._friendsTable.innerHTML += `
        <tr>
            <td class="flex items-center space-x-2 text-center align-middle" ${title}>
                <div class="relative mr-4">
                    <img id="avatar" src="${friend.avatarPath}" class="w-10 h-10 rounded-full border-2 border-pink-600 cursor-pointer">
                    <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-${onlineStatusColor}-500"></span>
                </div>
                <a class="hover:text-pink-600" href="/profile#${friend.displayName}">${friendsDisplayName}</a>
            </td>
        </tr>`;
    }
}

customElements.define("friend-list", Friends);