import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import * as $ from 'jquery';
import {HomePage} from "../home/home";
import {InAppBrowser} from "@ionic-native/in-app-browser";

/**
 * Generated class for the SubscriptionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-subscription',
  templateUrl: 'subscription.html',
})
export class SubscriptionPage {

    data: any;
    form: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public api: ApiProvider,
        public iab: InAppBrowser
    ) {
        //this.api.showLoad();
        this.api.http.get(this.api.url + '/user/subscriptions', this.api.setHeaders(true)).subscribe( data => {
                var res:any = data;
                this.api.hideLoad();
                // if(res.status == 'toPay'){
                //     this.data = res.data;
                // }else
                if(res.status == 'login' && res.userIsPaying == 1){
                    this.navCtrl.setRoot(HomePage);
                    this.navCtrl.popToRoot();
                }else{
                    this.data = res.data;
                }
                if(res.form) {
                    this.form = res.form;
                }else{
                    if(!this.form){
                        this.form = {
                            action: 'https://redirect.telepay.co.il',
                            formId: '2552ce77-dd66-e211-9ffd-1cc1de70f3e6',//'da65b885-9360-e711-9802-d89d6714734f',
                            mobile: '1',
                            userId: this.api.myId,
                            product: 79.00,
                            payPeriod: -1
                        }
                    }
                }
            }
        );
    }

    sendForm(opt:any = 0){

        //alert(opt);
        var that = this;
        if(typeof this.api.myId == 'undefined' && !this.form){
            setTimeout(function () {
                that.sendForm(opt);
            },500);
        }else {
            this.api.showLoad();
            var price = 0.00;
            var payPeriod = 0;
            switch (opt) {
                case 1:
                    price = 50.00;
                    payPeriod = 12;
                    break;
                case 2:
                    price = 55.00;
                    payPeriod = 6;
                    break;
                case 3:
                    price = 60.00;
                    payPeriod = 3;
                    break;
                case 4:
                    price = 99.00;
                    payPeriod = 1;
                    break;
                case 5:
                    price = 79.00;
                    payPeriod = -1;
                    break;
            }
            if (opt > 0) {
                // let ref = window.open('https://redirect.telepay.co.il/?formId=da65b885-9360-e711-9802-d89d6714734f&mobile=1&userId=' + this.api.myId + '&product=' + price + '&payPeriod=' + payPeriod, '_system');
                // let timer = setInterval(function () {
                //         if (ref.closed) {
                //             clearInterval(timer);
                //             that.checkUserStatus();
                //         }
                //     }, 1000);
                if(!this.form){
                    this.form = {
                        action: 'https://redirect.telepay.co.il',
                        formId: '2552ce77-dd66-e211-9ffd-1cc1de70f3e6',//'da65b885-9360-e711-9802-d89d6714734f',
                        mobile: '1'
                    }
                }
                this.form.userId = this.api.myId;
                this.form.product = price;
                this.form.payPeriod = payPeriod;
                //alert(JSON.stringify(this.form));
                setTimeout(function () {
                    $('#telepay').submit();
                    that.api.hideLoad();
                }, 100);
                /*const browser = this.iab.create('https://redirect.telepay.co.il/?formId=da65b885-9360-e711-9802-d89d6714734f&mobile=1&userId=' + this.api.myId + '&product=' + price + '&payPeriod=' + payPeriod, '_blank','location=yes');

                let timer = setInterval(function () {
                    if (browser.close) {
                        //alert(2);
                        clearInterval(timer);
                        that.checkUserStatus();
                    }
                }, 1000);
                */
            }
        }

    }

    checkUserStatus(){
        this.api.showLoad();
        this.api.http.post(this.api.url + '/user/login/', '',  this.api.setHeaders(true)).subscribe(data => {
            this.api.hideLoad();
            var res:any = data;

                this.api.storage.get('user_data').then((val) => {
                    if(val) {
                        if(val.status != res.status) {
                            //update status
                            val.status = res.status;
                            this.api.storage.set('user_data', val);
                        }
                        if(res.status == 'login' && res.userIsPaying == 1) {
                            this.navCtrl.setRoot(HomePage);
                            this.navCtrl.popToRoot();
                        }
                    }
                });




        }, err => {
            this.api.hideLoad();
            //this.errors = err.error;
        });
    }

    ionViewWillEnter() {
        this.api.pageName = 'SubscriptionPage';
    }

}
