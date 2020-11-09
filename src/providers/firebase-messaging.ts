import { Injectable } from "@angular/core";
import { FirebaseApp } from 'angularfire2';
// I am importing simple ionic storage (local one), in prod this should be remote storage of some sort.
import { Storage } from '@ionic/storage';
import { messaging } from 'firebase/app';

@Injectable()
export class FirebaseMessagingProvider {
    private appMessaging;
    private unsubscribeOnTokenRefresh = () => {};

    constructor(
        private storage: Storage,
        private app: FirebaseApp
    ) {

        if (messaging.isSupported()) {
            this.appMessaging = this.app.messaging();

        //if(this.messaging.isSupported()) {



            navigator.serviceWorker.register('service-worker.js').then((registration) => {
                this.appMessaging.useServiceWorker(registration);
                this.appMessaging.usePublicVapidKey("BLjW6pAAGm4FZ-GEkhcpSG9Fj3jXh-vgqdjkFyFqGPbNAx5tMEcCNl3xXGuZU0F4W1D7HxJSEorDCQLb9TKV1q8");
                //this.messaging.usePublicVapidKey("BEM_SOAC6SjHhZcroNqy15UnlSiTt7E3SLY9f_IyIx8wto_TWq4KNDgI3VB6gC7j0xPtEbfDTISI0tKLi0nSBYw");
                //this.disableNotifications()
                this.enableNotifications();
            });
        }
    }

    public enableNotifications() {
        console.log('Requesting permission...');
        return this.appMessaging.requestPermission().then(() => {
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
        return this.appMessaging.getToken().then((currentToken) => {
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
        this.unsubscribeOnTokenRefresh = this.appMessaging.onTokenRefresh(() => {
            console.log("Token refreshed");
            this.storage.set('fcmToken','').then(() => { this.updateToken(); });
        });
    }

}