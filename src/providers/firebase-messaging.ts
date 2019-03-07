import { Injectable } from "@angular/core";
import { FirebaseApp } from 'angularfire2';
// I am importing simple ionic storage (local one), in prod this should be remote storage of some sort.
import { Storage } from '@ionic/storage';

@Injectable()
export class FirebaseMessagingProvider {
    private messaging;
    private unsubscribeOnTokenRefresh = () => {};

    constructor(
        private storage: Storage,
        private app: FirebaseApp
    ) {
        this.messaging = this.app.messaging();

        this.messaging.usePublicVapidKey("BPunHJu5oktw_RQwzb_Il4jyPRzDK5Uwgy5Wxh0ITdiXCgFpIBCaU4i08HlWZ2TT1tk1lt6IU443COQvIWDX0R8");

        navigator.serviceWorker.register('service-worker.js').then((registration) => {
            this.messaging.useServiceWorker(registration);
            //this.messaging.usePublicVapidKey("BEM_SOAC6SjHhZcroNqy15UnlSiTt7E3SLY9f_IyIx8wto_TWq4KNDgI3VB6gC7j0xPtEbfDTISI0tKLi0nSBYw");
            //this.disableNotifications()
            this.enableNotifications();
        });
    }

    public enableNotifications() {
        console.log('Requesting permission...');
        return this.messaging.requestPermission().then(() => {
            console.log('Permission granted');
            // token might change - we need to listen for changes to it and update it
            this.setupOnTokenRefresh();
            return this.updateToken();
        },(error) => {
            console.log('Permission Error' + JSON.stringify(error));
        });
    }

    public disableNotifications() {
        this.unsubscribeOnTokenRefresh();
        this.unsubscribeOnTokenRefresh = () => {};
        return this.storage.set('fcmToken','').then();
    }

    private updateToken() {
        return this.messaging.getToken().then((currentToken) => {
            if (currentToken) {
                // we've got the token from Firebase, now let's store it in the database
                console.log('fcmToken: ' + currentToken);
                //this.api.browserToken = currentToken;
                //this.api.sendBrowserPhoneId();
                return this.storage.set('fcmToken', currentToken);
            } else {
                console.log('No Instance ID token available. Request permission to generate one.');
            }
        });
    }

    private setupOnTokenRefresh(): void {
        this.unsubscribeOnTokenRefresh = this.messaging.onTokenRefresh(() => {
            console.log("Token refreshed");
            this.storage.set('fcmToken','').then(() => { this.updateToken(); });
        });
    }

}