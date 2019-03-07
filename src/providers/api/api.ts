import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import {
    AlertController, LoadingController, ModalController, Platform
} from "ionic-angular";

import { DomSanitizer } from "@angular/platform-browser";
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
//import * as $ from 'jquery';
import {FingerprintAIO} from "@ionic-native/fingerprint-aio";

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
    public myId: null;

    public status: any = '';
    public errorMess: any = '';
    public back: any = false;
    public storageRes: any;
    public footer: any = true;
    public pageName: any = false;
    public loading: any;
    public testingMode: any = false;
    public enableFingerAuth: any;
    public fingerAuth: any = false;
    public setEnableFingerAuth: any = true;
    public notActivateAlert: any;
    public faioData: any;
    public browserToken: any;
    public appVersion: any = 3;

    constructor(
        public storage: Storage,
        public http: HttpClient,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        private sanitizer: DomSanitizer,
        private geolocation: Geolocation,
        public plt: Platform,
        public keyboard: Keyboard,
        public modalCtrl: ModalController,
        public fingerAIO: FingerprintAIO
    ) {
        this.url = 'http://localhost:8100';
        //this.url = 'http://10.0.0.7:8100';
        //this.url = 'https://m.zigzug.co.il/new/api';
        //this.url = 'https://www.zigzug.co.il/api/v1';
        //this.testingMode = true;



    }


    fAllInOne(data: any = {}){

        // this.storage.get('faio').then((val:any)=>{
        //     this.setEnableFingerAuth = (val && typeof val.setEnableFingerAuth != 'undefined') ? Boolean(parseInt(val.setEnableFingerAuth)) : true;
        //     this.faioData = val;

            this.fingerAIO.isAvailable().then((result: any) => {

                this.enableFingerAuth = 1;
                //alert(this.setEnableFingerAuth);
                //alert(JSON.stringify(this.faioData));
                if(this.faioData){
                    if(typeof this.faioData.username != 'undefined' && typeof data.username != 'undefined') {
                        //alert(1);
                        //change data after relogin
                        if (this.faioData.username != data.username && typeof data.username != 'undefined' && this.fingerAuth) {
                            this.storage.set('fingerAIO', {
                                //isAvailable: 1,
                                setEnableFingerAuth: this.faioData.setEnableFingerAuth,
                                username: data.username,
                                password: data.password
                            });
                        }
                    }else if(this.setEnableFingerAuth && typeof data.username == 'undefined'){
                        //alert(2);
                        //authorization by fingerprint
                        this.fingerAIO.show({
                            clientId: 'zigzug-faio',
                            clientSecret: this.faioData.password, //Only necessary for Android
                            disableBackup: true  //Only for Android(optional)
                        }).then((result: any) => {

                            // data.navCtrl.push('LoginPage',{
                            //     'login':{
                            //         username: this.faioData.username,
                            //         password: this.faioData.password
                            //     }
                            // });
                            data.navCtrl.setRoot('LoginPage',{
                                'login':{
                                    username: this.faioData.username,
                                    password: this.faioData.password
                                }
                            });
                            data.navCtrl.popToRoot();
                            //this.fingerAuth = true;
                        })
                        .catch((error: any) => {
                            //this.fingerAuth = false;
                        });

                    }
                }else if(typeof data.username != 'undefined'){
                    //set data
                    if(typeof data.register != 'undefined'){
                        let alert = this.alertCtrl.create({
                            title: 'כניסה לזיגזוג באמצעות טביעת אצבע',
                            message: 'לכניסה מהירה לזיגזוג יש להכניס טביעת אצבע לחצו לאישור',
                            buttons: [
                                {
                                    text: 'ביטול',
                                    role: 'cancel',
                                    handler: () => {
                                        //console.log('Cancel clicked');
                                    }
                                },
                                {
                                    text: 'אישור',
                                    handler: () => {
                                        this.fingerAIO.show({
                                            clientId: 'zigzug-faio',
                                            clientSecret: data.password, //Only necessary for Android
                                            disableBackup: true  //Only for Android(optional)
                                        }).then((result: any) => {
                                            //alert(JSON.stringify(result));
                                            this.faioData = {
                                                //isAvailable: 1,
                                                setEnableFingerAuth: 1,
                                                username: data.username,
                                                password: data.password
                                            };
                                            this.storage.set('fingerAIO', this.faioData);
                                            this.fingerAuth = true;
                                        }).catch((error: any) => {
                                            //alert('ERROR: ' + JSON.stringify(error));
                                            this.fingerAuth = false;
                                            this.faioData = false;
                                            this.storage.remove('fingerAIO');
                                        });
                                    }
                                }
                            ]
                        });
                        alert.present();
                    }else {
                        this.fingerAIO.show({
                            clientId: 'zigzug-faio',
                            clientSecret: data.password, //Only necessary for Android
                            disableBackup: true  //Only for Android(optional)
                        }).then((result: any) => {
                            //alert(JSON.stringify(result));
                            this.faioData = {
                                //isAvailable: 1,
                                setEnableFingerAuth: 1,
                                username: data.username,
                                password: data.password
                            };
                            this.storage.set('fingerAIO', this.faioData);
                            this.fingerAuth = true;
                        }).catch((error: any) => {
                            //alert('ERROR: ' + JSON.stringify(error));
                            this.fingerAuth = false;
                            this.faioData = false;
                            this.storage.remove('fingerAIO');
                        });
                    }
                }

            }).catch((error: any) => {
                //alert('Error: ' + JSON.stringify(error));
                this.enableFingerAuth = 0;
                this.fingerAuth = false;
                this.faioData = false;
                this.storage.remove('fingerAIO');
            });
        // });
    }

    safeHtml(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    sendPhoneId(idPhone) {
        let data = JSON.stringify({deviceId: idPhone});
        let os = (this.plt.is('IOS')) ? 'iOS' : 'Android';
        //alert(os);
        this.http.post(this.url + '/user/deviceId/OS:' + os, data, this.setHeaders(true)).subscribe(data => {
            //alert(JSON.stringify(data));
        });
    }

    sendBrowserPhoneId(){

        this.storage.get('fcmToken').then((token) => {
            if(token) {
                let data = JSON.stringify({deviceId: token});
                let os = 'Browser';
                //alert(os);
                this.http.post(this.url + '/user/deviceId/OS:' + os, data, this.setHeaders(true)).subscribe(data => {
                    //alert(JSON.stringify(data));
                });
            }
        });
    }

    setLocation() {

        this.geolocation.getCurrentPosition().then((pos) => {
            let params = JSON.stringify({
                latitude: pos.coords.latitude.toString(),
                longitude: pos.coords.longitude.toString()
            });

            this.http.post(this.url + '/user/location', params, this.setHeaders(true)).subscribe(data => {
            });
        });
    }

    showLoad(txt = 'אנא המתן...') {
        if (this.isLoaderUndefined()) {
              this.loading = this.loadingCtrl.create({
                  content: txt
              });

              this.loading.present();
        }
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
        //myHeaders = myHeaders.append('Origin', 'https://www.zigzug.co.il/');

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
