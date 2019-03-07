import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, LoadingController, ToastController, AlertController} from 'ionic-angular';
import {HomePage} from "../home/home";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
//import { AndroidFingerprintAuth } from '@ionic-native/android-fingerprint-auth';
import * as $ from "jquery";
import {ApiProvider} from "../../providers/api/api";
import {HttpHeaders} from "@angular/common/http";
import {RegisterPage} from "../register/register";
import {PasswordRecoveryPage} from "../password-recovery/password-recovery";
import {SubscriptionPage} from "../subscription/subscription";
import { FingerprintAIO } from '@ionic-native/fingerprint-aio';
import { Keyboard } from 'ionic-angular';


/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

    form: any = {errors: {}, login: {username: {label: ''}, password: {label: ''}}};
    errors: any;
    header: any = {};
    user: any = {id: '', name: ''};
    fingerAuth: any;
    enableFingerAuth: any;
    setEnableFingerAuth: any;

    constructor(
          public navCtrl: NavController,
          public navParams: NavParams,
          public api: ApiProvider,
          public loadingCtrl: LoadingController,
          public toastCtrl: ToastController,
          public alertCtrl: AlertController,
          private faio: FingerprintAIO,
          private keyboard: Keyboard
    ) {

        this.api.storage.get('faio').then((val: any) => {
            if(val){
                this.enableFingerAuth = (typeof val.isAvailable != 'undefined') ? val.isAvailable : 0;
                this.fingerAuth = (typeof val.password != 'undefined') ? true : false;
                this.setEnableFingerAuth = (typeof val.setEnableFingerAuth != 'undefined') ? Boolean(parseInt(val.setEnableFingerAuth)) : true;
            }else{
                this.fingerAuth = false;
                this.enableFingerAuth = 0;
                this.setEnableFingerAuth = true;
            }
        }).catch((error: any) => {
            this.fingerAuth = false;
            this.enableFingerAuth = 0;
        });

        this.api.http.get(api.url + '/user/form/login/', api.setHeaders(false)).subscribe(data => {
            this.form = data;
            if(navParams.get('login') && this.api.status != 'block'){
                this.api.setHeaders(false, null, null);
                // Removing data storage
                this.api.storage.remove('user_data');
                //this.api.storage.remove('faio');
                var login = navParams.get('login');
                this.form.login.password.value = login.password;
                this.form.login.username.value = this.user.name = login.username;
                this.formSubmit();
            }else {
                this.api.storage.get('username').then((username) => {
                    if (username) {
                        this.form.login.username.value = username;
                        this.user.name = username;
                    }
                });
            }
            this.api.storage.remove('fingerAuth');

        });

        if (navParams.get('page') && navParams.get('page')._id == "logout") {

          this.api.setHeaders(false, null, null);
          // Removing data storage
          this.api.storage.remove('user_data');
          this.api.storage.remove('faio');
          this.api.myId = null;
          //this.storage.remove('password');
          //this.storage.remove('user_id');
          //this.storage.remove('user_photo');
        }

        if(navParams.get('error')){
            console.log('Login Error: ' + navParams.get('error'));
            this.api.setHeaders(false, null, null);
            // Removing data storage
            this.api.storage.remove('user_data');
            this.api.storage.remove('faio');
            this.errors = navParams.get('error');
        }
        if(this.api.status == 'block' && this.api.errorMess != ''){
            this.errors = this.api.errorMess;
        }
        //alert(this.keyboard.isVisible);


    }

    formSubmit() {
        this.form.login.username.value = this.user.name;
        let username = encodeURIComponent(this.form.login.username.value);
        let password = encodeURIComponent(this.form.login.password.value);

        //alert(encodeURIComponent(this.form.login.username.value));
        if (username == "") {
            username = "nologin";
        }

        if (password == "") {
            password = "nopassword";
        }


        this.api.http.post(this.api.url + '/user/login/', '', this.setHeaders(username,password)).subscribe(data => { //.map((res: Response) => res.json())

            setTimeout(function () {
                //this.errors = 'משתמש זה נחסם על ידי הנהלת האתר';
            }, 300);

            this.validate(data);

        }, err => {
            //console.log(err.status);
            //alert(JSON.stringify(err))
            this.errors = err.error;
        });
    }

    setHeaders(username,password) {
        //alert(username+':'+ password);
        let myHeaders = new HttpHeaders();
        myHeaders = myHeaders.append('Content-type', 'application/json');
        myHeaders = myHeaders.append('Accept', '*/*');
        myHeaders = myHeaders.append('Access-Control-Allow-Origin', '*');
        myHeaders = myHeaders.append("Authorization", "Basic " + btoa(username + ':' + password));

        this.header = {
            headers: myHeaders
        };
        return this.header;
    }


    setFaio(){
        var that = this;
        if(typeof this.enableFingerAuth == 'undefined'){
            setTimeout(function () {
                that.setFaio();
            },500);
        }else {
            this.api.storage.get('faio').then((val:any)=>{
                if(val){
                    if(typeof val.username != 'undefined') {
                        if (val.username != this.form.login.username.value) {
                            this.api.storage.set('faio', {
                                isAvailable: 1,
                                setEnableFingerAuth: this.setEnableFingerAuth,
                                username: this.form.login.username.value,
                                password: this.form.login.password.value
                            });
                        }
                    }
                }
            });
            if (this.enableFingerAuth === 0) {
                this.faio.isAvailable().then((result: any) => {
                    this.enableFingerAuth = 1;
                    this.api.storage.set('faio', {
                        isAvailable: 1,
                        setEnableFingerAuth: this.setEnableFingerAuth
                    });
                    this.faio.show({
                        clientId: 'zigzug-faio',
                        clientSecret: this.form.login.password.value, //Only necessary for Android
                        disableBackup: true  //Only for Android(optional)
                    }).then((result: any) => {
                        this.api.storage.set('faio', {
                            isAvailable: 1,
                            setEnableFingerAuth: this.setEnableFingerAuth,
                            username: this.form.login.username.value,
                            password: this.form.login.password.value
                        });
                        this.fingerAuth = true;
                    })
                        .catch((error: any) => {
                            this.fingerAuth = false;
                        });
                }).catch((error: any) => {
                    this.api.storage.remove('faio');
                    this.enableFingerAuth = 0;
                });
            }
        }
    }


    useFaio(){
        var that = this;
        if(typeof this.fingerAuth == 'undefined'){
            setTimeout(function () {
                that.useFaio();
            },500);
        }else {
            if (this.fingerAuth) {
                this.api.storage.get('faio').then((val: any) => {
                    if (val) {
                        if (typeof val.password == 'undefined') {
                            this.setFaio();
                        } else {
                            this.faio.show({
                                clientId: 'zigzug-faio',
                                clientSecret: val.password, //Only necessary for Android
                                disableBackup: true  //Only for Android(optional)
                            }).then((result: any) => {
                                this.form.login.password.value = val.password;
                                this.form.login.username.value = val.username
                                this.formSubmit();
                            }).catch((error: any) => {
                                this.setFaio();
                            });
                        }
                    } else {
                        setTimeout(function () {
                            that.useFaio();
                        }, 500);
                    }
                });
            } else {
                this.setFaio();
            }
        }
    }


    validate(response) {

        //if (response.status != "not_activated") {
            this.api.storage.set('user_data',{
                username: this.form.login.username.value,
                password: this.form.login.password.value,
                status: response.status,
                user_id: response.id,
                user_photo: response.photo,
                userIsPaying: response.userIsPaying
            });
            this.api.myId = response.id;
            this.api.storage.set('username', this.form.login.username.value);
            // this.api.storage.set('password', this.form.login.password.value);
            // this.api.storage.set('status', response.status);
            // this.api.storage.set('user_id', response.id);
            // this.api.storage.set('user_photo', response.photo);

            this.api.setHeaders(true, this.form.login.username.value, this.form.login.password.value);
            //if(!this.navParams.get('login')) {
                //this.setFaio();
                this.api.fAllInOne({username: this.form.login.username.value, password: this.form.login.password.value});
                this.api.sendBrowserPhoneId();
            //}
        //}
        if (response.status == "login") {

            this.api.storage.set('user_photo', response.photo);
            this.navCtrl.setRoot(HomePage, {
                params: 'login',
                username: this.form.login.username.value,
                password: this.form.login.password.value
            });

        } else if (response.status == "no_photo") {
            this.user.id = response.id;

            let toast = this.toastCtrl.create({
                message: response.texts.photoMessage,
                showCloseButton: true,
                closeButtonText: 'אישור'
            });

            toast.present();
            this.navCtrl.push('RegistrationPage', {
                user: this.user,
                username: this.form.login.username.value,
                password: this.form.login.password.value
            });
        } else if (response.status == "not_activated") {
            // let toast = this.toastCtrl.create({
            //     message: response.texts.notActiveMessage,
            //     showCloseButton: true,
            //     closeButtonText: 'אישור'
            // });
            // toast.present();
            if((this.api.notActivateAlert == null || this.api.notActivateAlert == undefined)) {
                this.api.notActivateAlert = this.alertCtrl.create({
                    title: response.texts.notActiveTitleMess,
                    message: response.texts.notActiveMessage,
                    buttons: [
                        {
                            text: response.texts.notActiveButton,
                            role: 'cancel',
                            handler: () => {
                                console.log('Cancel clicked');
                                this.api.notActivateAlert = undefined;
                            }
                        }
                    ]
                });
                this.api.notActivateAlert.present();
            }
            this.navCtrl.push('LoginPage');
        } else if (response.status == "toPay") {
            this.navCtrl.setRoot(SubscriptionPage);
            this.navCtrl.popToRoot();
        }

        this.api.storage.get('deviceToken').then((deviceToken) => {
            this.api.sendPhoneId(deviceToken);
        });
    }

    onRegistrationPage() {
        this.navCtrl.push(RegisterPage);
    }

    onPasswordRecoveryPage() {
        this.navCtrl.push(PasswordRecoveryPage);
    }

    ionViewWillEnter() {
        this.api.pageName = 'LoginPage';
        $('.back-btn').hide();
    }

}
