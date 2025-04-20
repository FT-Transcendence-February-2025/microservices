import { postApiData, postApiFormData, getApiData } from './ApiService.js'
import config from '../config/config.js';

export default class UserService {
    static displayName: string = '';
    static email: string = '';
    static avatarPath: string = '';
    static isloggedIn: boolean = false;

    static async checkAndRestoreSession(): Promise<void>{
        const accessToken = localStorage.getItem('accessToken');
    
        const hasCookie = (name: string): boolean  => {
            const cookieName = `${name}=`;
            return document.cookie.includes(cookieName);
        }

        if (hasCookie('refreshToken') || accessToken) {
            this.getProfile('')
            .then(profile => {
                if (profile) {
                    this.displayName = profile.displayName;
                    this.email = profile.email;
                    this.avatarPath = profile.avatarPath;
                    this.isloggedIn = true;
                    return;
                }
            });
        }
        // @ts-ignore
        window.navigateTo('/login');
    }

    static async login(email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`http://${config.toBackend.auth}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.token);
                this.isloggedIn = true;
                return true;
            }
            else {
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Login failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Login failed: ${error.message}`);
            return false;
        }
    }

    static async register(displayName: string, email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`http://${config.toBackend.auth}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, displayName, password })
            });

            if (response.ok)
                return true;
            else {
                const data = await response.json();
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Register failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Register failed: ${error.message}`);
            return false;
        }
    }

    static async logout(): Promise<boolean> {
        try {
            const response = await postApiData(`http://${config.toBackend.auth}/logout`, {});

            if (response.ok) {
                localStorage.removeItem('accessToken');
                this.isloggedIn = false;
                return true;
            }
            else {
                const data = await response.json();
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Logout failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Logout failed: ${error.message}`);
            return false;
        }
    }

    static async changeDisplayName(displayName: string): Promise<boolean> {
        try {
            const body = JSON.stringify({ displayName });
            const response = await postApiData(`http://${config.toBackend.user}/display-name`, body);

            if (response.ok) {
                UserService.displayName = displayName;
                return true;
            }
            else {
                const data = await response.json();
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Changing DisplayName failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Changing DisplayName failed: ${error.message}`);
            return false;
        }
    }

    static async changeEmail(email: string): Promise<boolean> {
        try {
            const body = JSON.stringify({ email });
            const response = await postApiData(`${config.toBackend}.auth}/email`, body);
           
            if (response.ok) {
                UserService.email = email;
                return true;
            }
            else {
                const data = await response.json();
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Changing email failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Changing email failed: ${error.message}`);
            return false;
        }
    }

    static async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        try {
            const body = JSON.stringify({ currentPassword: oldPassword, newPassword: newPassword });
            const response = await postApiData(`${config.toBackend}.auth}/password`, body);

            if (response.ok)
                return true;
            else {
                const data = await response.json();
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Changing Password failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Changing Password failed: ${error.message}`);
            return false;
        }
    }

    static async changeAvatar(file: File): Promise<boolean> {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await postApiFormData(`http://${config.toBackend.user}/avatar`, formData);
            const data = await response.json();

            if (response.ok) {
                UserService.avatarPath = data.filePath;
                return true;
            }
            else {
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Changing Avatar failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Changing Avatar failed: ${error.message}`);
            return false;
        }
    }

    static async getFriendList(): Promise<any> {
        try {
            const response = await getApiData(`http://${config.toBackend.user}/get-friends`);
            const data = await response.json();

            if (response.ok) {
                return data;
            }
            else {
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Getting friend list failed: ${error}`);
                return null;
            }
            
        } catch (error: any) {
            console.error(`Getting friend list failed: ${error.message}`);
            return null;
        }
    }

    static async addFriend(displayName: string): Promise<boolean> {
        try {
            const body = JSON.stringify({ invitedDisplayName: displayName });
            const response = await postApiData(`http://${config.toBackend.user}/invite-friend`, body);

            if (response.ok) {
                return true;
            }
            else {
                const data = await response.json();
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Adding friend failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Adding friend failed: ${error.message}`);
            return false;
        }
    }

    static async removeFriend(displayName: string): Promise<boolean> {
        try {
            const body = JSON.stringify({ displayNameToRemove: displayName });
            const response = await postApiData(`http://${config.toBackend.user}/remove-friend`, body);

            if (response.ok) {
                return true;
            }
            else {
                const data = await response.json();
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Removing friend failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Removing friend failed: ${error.message}`);
            return false;
        }
    }

    static async respondFriend(displayName: string, accepted: boolean): Promise<boolean> {
        try {
            const body = JSON.stringify({ invitingDisplayName: displayName, accepted: accepted });
            const response = await postApiData(`http://${config.toBackend.user}/respond-friend`, body);

            if (response.ok) {
                return true;
            }
            else {
                const data = await response.json();
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Respond friend request failed: ${error}`);
                return false;
            }
        } catch (error: any) {
            console.error(`Respond friend request friend failed: ${error.message}`);
            return false;
        }
    }

    static async getProfile(displayName: string): Promise<any> {
        try {
            const response = await getApiData(`http://${config.toBackend.user}/profile/${displayName}`);
            const data = await response.json();

            if (response.ok) {
                return data;
            }
            else {
                const error = data?.error || response.statusText || "Server returned an error.";
                console.error(`Getting ${displayName} profile failed: ${error}`);
                return null;
            }
            
        } catch (error: any) {
            console.error(`Getting ${displayName} profile failed: ${error.message}`);
            return null;
        }
    }

    // static async blockUser() {

    // }

    // static async unBlockUser() {
        
    // }

    // static async getBlockList() {
        
    // }
}