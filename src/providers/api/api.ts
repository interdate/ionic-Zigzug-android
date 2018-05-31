import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import {AlertController, LoadingController, ModalController, Platform} from "ionic-angular";
import { DomSanitizer } from "@angular/platform-browser";
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {

    public url: any;
    public header: any = {};
    public response: any;
    public username: any;
    public password: any;
    public status: any = '';
    public back: any = false;
    public storageRes: any;
    public footer: any = true;
    public pageName: any = false;
    public loading: any;

  constructor(
      public storage: Storage,
      public http: HttpClient,
      public alertCtrl: AlertController,
      public loadingCtrl: LoadingController,
      private sanitizer: DomSanitizer,
      private geolocation: Geolocation,
      public plt: Platform,
      public keyboard: Keyboard,
      public modalCtrl: ModalController
  ) {
      this.url = 'http://localhost:8100';
      //this.url = 'https://www.zigzug.co.il/api/v1';
      this.storage.get('user_data').then((val) => {
          if(val) {
              this.username = val.username;
              this.password = val.password;
          }
      });
  }

    safeHtml(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    sendPhoneId(idPhone) {
        let data = JSON.stringify({deviceId: idPhone});
        let os = (this.plt.is('IOS')) ? 'iOS' : 'Android';
        this.http.post(this.url + '/user/deviceId/OS:' + os, data, this.setHeaders(true)).subscribe(data => {
        });
    }

    setLocation() {

        this.geolocation.getCurrentPosition().then((pos) => {
            var params = JSON.stringify({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            });

            this.http.post(this.url + '/user/location', params, this.setHeaders(true)).subscribe(data => {
            });
        });
    }

    showLoad(txt = 'אנא המתיני...') {

        this.loading = this.loadingCtrl.create({
            content: txt
        });

        this.loading.present();
    }

    functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
            if (arraytosearch[i][key] == valuetosearch) {
                return i;
            }
        }
        return null;
    }

    hideLoad() {
        if (!this.isLoaderUndefined())
            this.loading.dismiss();
        this.loading = undefined;
    }

    isLoaderUndefined(): boolean {
        return (this.loading == null || this.loading == undefined);
    }

    getUserData() {
        this.storage.get('user_id').then((val) => {
            this.storage.get('username').then((username) => {
                this.username = username;
            });
            this.storage.get('password').then((password) => {
                this.password = password;
            });
        });
        return {username: this.username, password: this.password}
    }

    setHeaders(is_auth = false, username = false, password = false) {

        if (username != false) {
            this.username = username;
        }

        if (password != false) {
            this.password = password;
        }

        let myHeaders = new HttpHeaders();

        myHeaders = myHeaders.append('Content-type', 'application/json');
        myHeaders = myHeaders.append('Accept', '*/*');
        myHeaders = myHeaders.append('Access-Control-Allow-Origin', '*');

        if (is_auth == true) {
            myHeaders = myHeaders.append("Authorization", "Basic " + btoa(encodeURIComponent(this.username) + ':' + encodeURIComponent(this.password)));
            /*@encodeURIComponent(this.username)*/
        }
        this.header = {
            headers: myHeaders
        };
        return this.header;
    }
}
