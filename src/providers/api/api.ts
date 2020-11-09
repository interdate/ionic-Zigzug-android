import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import {
    AlertController, LoadingController, ModalController, Platform, ToastController
} from "ionic-angular";

import { DomSanitizer } from "@angular/platform-browser";
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import * as $ from 'jquery';
import {InAppBrowser} from "@ionic-native/in-app-browser";

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

    public textMess: any;
    public status: any = '';
    public userIsPaying: any;
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
    public notActivateAlert: any = false;
    public faioData: any;
    public browserToken: any;
    public appVersion: any = 9;
    public callAlertShow:any = false;
    public videoChat: any = null;
    public videoTimer: any = null;
    public callAlert: any;
    public audioCall: any;
    public audioWait: any;
    public videoShow: any = true;
    public isAndroid: any = false;

    constructor(
        public storage: Storage,
        public http: HttpClient,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        private sanitizer: DomSanitizer,
        public toastCtrl: ToastController,
        private geolocation: Geolocation,
        public plt: Platform,
        public keyboard: Keyboard,
        public modalCtrl: ModalController,
        public iab: InAppBrowser
    ) {
        this.url = 'http://localhost:8100';
        //this.url = 'http://10.0.0.7:8100';
        //this.url = 'https://m.zigzug.co.il/api/v2';
        //this.url = '/api/v2';
        //this.testingMode = true;
    }

  openVideoChat(param){
    this.storage.get('user_data').then((data) => {
      if(this.callAlert && this.callAlert != null) {
        this.callAlert.dismiss();
        this.callAlert = null;
      }
      this.playAudio('call');

      this.http.post(this.url + '/user/call/' + param.id,{message: 'call', id: param.chatId}, this.setHeaders(true)).subscribe((res:any) => {
        this.stopAudio();
        console.log('init');
        console.log(res);
        if(res.error != '') {
          let toast = this.toastCtrl.create({
            message: res.error,
            showCloseButton: true,
            closeButtonText: 'אישור'
          });

          toast.present();
        } else {
          // /user/call/push/
          if(res.call.sendPush) {
            this.http.post(this.url + '/user/call/push/' + param.id, {}, this.setHeaders(true)).subscribe((data: any) => {

            });
          }
          param.chatId = res.call.msgId;
          $('#close-btn,#video-iframe').remove();
          const closeButton = document.createElement('button');
          closeButton.setAttribute('id', 'close-btn');
          closeButton.style.backgroundColor = 'transparent';
          closeButton.style.margin = '0 10px';
          closeButton.style.width = '40px';
          closeButton.style.height = '40px';
          closeButton.style['font-size'] = '0px';
          closeButton.style['text-align'] = 'center';
          closeButton.style.background = 'url(/assets/img/video/buzi_b.png) no-repeat center';
          closeButton.style['background-size'] = '100%';
          closeButton.style.position = 'absolute';
          closeButton.style.bottom = '10px';
          closeButton.style.left = 'calc(50% - 25px)';
          closeButton.style.zIndex = '9999999';
          closeButton.onclick = (e) => {
            console.log('close window');
            $('#close-btn,#video-iframe').remove();
            this.http.post(this.url + '/user/call/' + param.id,{message: 'close', id: param.chatId}, this.setHeaders(true)).subscribe((data:any) => {
              // let res = data.json();
            });
            this.videoChat = null;
          };

          this.videoChat = document.createElement('iframe');
          this.videoChat.setAttribute('id', 'video-iframe');
          this.videoChat.setAttribute('src', '/video.html?id='+data.user_id+'&to='+param.id);
          this.videoChat.setAttribute('allow','camera; microphone');
          this.videoChat.style.position = 'absolute';
          this.videoChat.style.top = '0';
          this.videoChat.style.left = '0';
          this.videoChat.style.boxSizing = 'border-box';
          this.videoChat.style.width = '100vw';
          this.videoChat.style.height = '95vh';
          this.videoChat.style.backgroundColor = 'rgba(255,255,255,0.8)';
          this.videoChat.style.zIndex = '999999';
          this.videoChat.style['text-align'] = 'center';

          document.body.appendChild(this.videoChat);
          document.body.appendChild(closeButton);

          if(param.alert == false) {
            this.checkVideoStatus(param);
          }
        }
      }, error => {
        this.stopAudio();
      });


    });
  }

  playAudio(audio) {
    if(this.callAlertShow == false) {
      this.showLoad();
    }
    if(audio == 'call') {
      this.audioCall.play();
      this.audioCall.loop = true;
    } else {
      this.audioWait.play();
      this.audioWait.loop = true;
    }
  }

  stopAudio() {
    this.audioCall.pause();
    this.audioCall.currentTime = 0;
    this.audioWait.pause();
    this.audioWait.currentTime = 0;
    this.hideLoad();
  }

  checkVideoStatus(param){
    console.log('check call');
    console.log(param);
    this.http.get(this.url + '/user/call/status/' + param.chatId, this.setHeaders(true)).subscribe((res: any) => {
      // let res = data.json();
      console.log('check');
      console.log(res);
      this.status = res.status;
      if (res.status == 'answer') {
      }
      if (res.status == 'close' || res.status == 'not_answer') {


        this.stopAudio();
        if (this.videoChat != null || this.callAlert != null) {

          let toast = this.toastCtrl.create({
            message: (this.status == 'not_answer' && this.videoChat && this.videoChat != null) ? ('השיחה עם ' + param.username + ' נדחתה') : 'השיחה הסתיימה',
            showCloseButton: true,
            closeButtonText: 'אישור'
          });
          toast.present();
        }
        if(this.callAlert && this.callAlert != null) {
          this.callAlert.dismiss();
          this.callAlert = null;
        }
        if(this.videoChat && this.videoChat != null) {
          $('#close-btn,#video-iframe').remove();
          this.videoChat = null;
        }
      }

      if (this.videoChat != null || this.callAlert != null) {
        let that = this;
        setTimeout(function () {
          that.checkVideoStatus(param)
        }, 3000);
      }
    });

  }

    fAllInOne(data: any = {}){
      this.fingerAuth = false;
      this.faioData = false;
    }

    logout(){
      this.setHeaders(false, null, null);
      // Removing data storage
      this.storage.remove('user_data');
      this.storage.remove('faio');
      this.myId = null;
      this.notActivateAlert = false;
      this.status = '';
      this.userIsPaying = null;
      this.textMess = false;
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
        // myHeaders = myHeaders.append('Origin', 'https://www.zigzug.co.il/');

        if (is_auth == true) {
            myHeaders = myHeaders.append("Authorization", "Basic " + btoa(this.username + ':' + this.password));
            /*@encodeURIComponent(this.username)*/
        }
        this.header = {
            headers: myHeaders
        };
        return this.header;
    }
}
