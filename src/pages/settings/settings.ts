import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

    form: any = {newMessPushNotif: '', userGetMsgToEmail: ''};
    fingerprintAuth: any = false;

    constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public api:ApiProvider) {
        this.api.http.get(api.url + '/user/settings', api.setHeaders(true)).subscribe(data => {
            let res:any = data;
            //this.form = data.json().settings;
            this.form.newMessPushNotif = Boolean(parseInt(res.settings.newMessPushNotif));
            this.form.userGetMsgToEmail = Boolean(parseInt(res.settings.userGetMsgToEmail));
        });
    }

    presentToast() {
        let toast = this.toastCtrl.create({
            message: 'נשמר',
            duration: 3000
        });

        toast.present();
    }

    submit(type) {

        let name;
        let value;

        if (type == 'email') {

            name = 'userGetMsgToEmail';
            value = this.form.userGetMsgToEmail;

            this.presentToast();

            this.api.http.post(this.api.url + '/user/settings/' + name + '/' + value, {}, this.api.setHeaders(true)).subscribe(data => {
            });

        } else if (type == 'push') {
            name = 'newMessPushNotif';
            value = this.form.newMessPushNotif;

            this.presentToast();

            this.api.http.post(this.api.url + '/user/settings/' + name + '/' + value, {}, this.api.setHeaders(true)).subscribe(data => {
            });
        } else if ('fingerprint') {
            if (this.form.fingerprint == true) {
                this.api.storage.set('enableFingerAuth', '1');
            } else {
                this.api.storage.set('enableFingerAuth', '0');
            }
        }


    }

    ionViewWillEnter() {
        this.api.pageName = 'SettingsPage';
    }

}
