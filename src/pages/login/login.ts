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
import { Keyboard } from 'ionic-angular';
import {ActivationPage} from "../activation/activation";


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
                if(this.api.status == 'not_activated'){
                  this.navCtrl.push(ActivationPage);
                  // if((this.api.notActivateAlert == true)) {
                  //   this.api.notActivateAlert = this.alertCtrl.create({
                  //     title: this.api.textMess.notActiveTitleMess,
                  //     message: this.api.textMess.notActiveMessage,
                  //     buttons: [
                  //       {
                  //         text: this.api.textMess.notActiveButton,
                  //         role: 'cancel',
                  //         handler: () => {
                  //           console.log('Cancel clicked');
                  //           this.api.notActivateAlert = true;
                  //         }
                  //       }
                  //     ]
                  //   });
                  //   this.api.notActivateAlert.present();
                  // }else {
                  //   if(navParams.get('redirect')) {
                  //     this.errors = this.api.textMess.notActiveMessageLogin;
                  //   }
                  // }
                }

            }
            this.api.storage.remove('fingerAuth');

        });

        if (navParams.get('page') && navParams.get('page')._id == "logout") {

          this.api.logout();
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

    loginByFinger(){
      this.api.fAllInOne({navCtrl: this.navCtrl, page: LoginPage});
    }

    onFocus(){
        setTimeout(function () {
            $('.keyboardClose').hide();
        },10);
    }

    onBlur(){
        setTimeout(function () {
            $('.keyboardClose').show();
        },9);

    }

    formSubmit() {
        this.form.login.username.value = this.user.name;
        let username = this.form.login.username.value;
        let password = this.form.login.password.value;

        //alert(encodeURIComponent(this.form.login.username.value));
        if (username == "") {
            username = "nologin";
        }

        if (password == "") {
            password = "nopassword";
        }


        this.api.http.post(this.api.url + '/user/login/', '', this.setHeaders(username,password)).subscribe((data: any) => {

            // setTimeout(function () {
            //     //this.errors = 'משתמש זה נחסם על ידי הנהלת האתר';
            // }, 300);

            this.validate(data);

        }, err => {
            this.api.logout();
            this.errors = err.error;
        });
    }



    setHeaders(username,password) {
        //alert(username+':'+ password);
        //alert(btoa(username + ':' + password));
        //alert('c3dlZXQgZHJlOjExMTExMQ==')
        let myHeaders = new HttpHeaders();
        myHeaders = myHeaders.append('Content-type', 'application/json');
        myHeaders = myHeaders.append('Accept', '*/*');
        myHeaders = myHeaders.append('Access-Control-Allow-Origin', '*');
        //myHeaders = myHeaders.append('Access-Control-Allow-Headers', 'Access-Control-*, Origin, X-Requested-With, Content-Type, Accept');
        myHeaders = myHeaders.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        //myHeaders = myHeaders.append("Authorization", "Basic " + btoa(encodeURIComponent(username) + ':' + encodeURIComponent(password)));
        myHeaders = myHeaders.append("Authorization", "Basic " + btoa(username + ':' + password));
      //myHeaders = myHeaders.append("Authorization", "Basic c3dlZXQgZHJlOjExMTExMQ==");

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
              this.enableFingerAuth = 0;
            }
        }
    }


    useFaio(){

    }


    validate(response) {

        //if (response.status != "not_activated") {
            this.api.storage.set('user_data',{
                username: this.form.login.username.value,
                password: this.form.login.password.value,
                status: response.status,
                user_id: response.id,
                user_photo: response.photo,
                userIsPaying: response.userIsPaying,
                textMess: response.texts,
            });
            this.api.status = response.status;
            this.api.userIsPaying = response.userIsPaying;
            this.api.textMess = response.texts;
            this.api.myId = response.id;
            this.api.storage.set('username', this.form.login.username.value);

            this.api.setHeaders(true, this.form.login.username.value, this.form.login.password.value);
            this.api.fAllInOne({username: this.form.login.username.value, password: this.form.login.password.value});
            this.api.sendBrowserPhoneId();
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
            this.navCtrl.push(ActivationPage);
            // let toast = this.toastCtrl.create({
            //     message: response.texts.notActiveMessage,
            //     showCloseButton: true,
            //     closeButtonText: 'אישור'
            // });
            // toast.present();
            // this.errors = this.api.textMess.notActiveMessageLogin;
            // if(this.api.pageName != 'LoginPage') {
            //   this.navCtrl.push(LoginPage);
            // }
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
