import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, Content, Platform } from 'ionic-angular';

import * as $ from "jquery";
import {ApiProvider} from "../../providers/api/api";
import {ChangePhotosPage} from "../change-photos/change-photos";
import {SelectPage} from "../select/select";
import {Page} from "../page/page";
import {HomePage} from "../home/home";

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

    @ViewChild(Content) content: Content;
    login: any = false;
    user: any = {};
    form: any = {fields: []};
    errors: any;
    activePhoto: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public actionSheetCtrl: ActionSheetController,
        public api: ApiProvider
    ) {
        this.api.storage.get('user_data').then((val) => {
            this.login = (val) ? val.status : false;
            this.user = this.navParams.get('user');
            this.sendForm();
        });
    }

    getStep(step): void {
        this.user.step = step;
        this.sendForm();
    }

    sendForm() {
        this.api.showLoad();
        var header = this.api.setHeaders((this.login == 'login') ? true : false);
        /*
        if (typeof this.user != 'undefined') {
            this.form.fields.forEach(field => {
                if (field.type == 'select') {
                    //this.user[field.name] = $('#' + field.name).val();
                }
                //console.log(field);
                if (field.type == 'selects') {
                    field.sel.forEach(select => {
                        // this.user[select.name] = $('#' + select.name).val();
                    });
                }
            });
        }
        */

        this.api.http.post(this.api.url + '/user/register', this.user, header).subscribe(
            data => {
                let res:any = data;
                //this.form = {};
                $('#labelconfirmMails').remove();
                this.form = res.form;
                this.user = res.user;

                this.errors = res.errors;

                if (this.user.step == 4) {
                    this.api.setHeaders(true, this.user.userNick, this.user.userPass);
                    this.login = 'login';
                    this.api.storage.set('userdata', {
                        username: this.user.userNick,
                        password: this.user.userPass,
                        user_id: this.user.userId,
                        status: 'login',
                        user_photo: ''
                    });
                    //this.api.storage.set('status', 'login');
                    //this.api.storage.set('user_id', this.user.userId);
                    this.api.storage.set('username', this.user.userNick);
                    //this.api.storage.set('password', this.user.userPass);
                    let data = {
                        status: 'init',
                        username: this.user.userNick,
                        password: this.user.userPass
                    };
                    this.api.storage.set('fingerAuth', data);
                    //alert(JSON.stringify(this.user.photos));
                    let that = this;
                    setTimeout(function () {
                        that.api.hideLoad();
                    }, 1000);
                    this.api.storage.get('deviceToken').then((val) => {
                        this.api.sendPhoneId(val);
                    });
                    this.navCtrl.push(ChangePhotosPage, {});

                } else {
                    this.api.hideLoad();

                    if (this.user.step == 2 && !this.user.register) {
                        this.api.storage.set('username', this.user.userNick);
                        this.api.setHeaders(true, this.user.userNick);
                    } else if (this.user.step == 2 && this.user.register) {
                        //this.api.storage.set('new_user', true);
                    }
                    /*
                    this.form.fields.forEach(field => {
                        if (field.type == 'select') {
                            //this.select2(field, null);
                        }
                        if (field.type == 'selects') {
                            field.sel.forEach(select => {
                                //this.select2(select, select.choices[0].label);
                            });
                        }
                    });
                    */
                    this.content.scrollToTop(300);
                }
            }, err => {
                this.errors = err._body;
                this.api.hideLoad();
            }
        );
    }

    openSelect(field, index) {
        if(typeof field == 'undefined'){
            field = false;

        }

        let profileModal = this.api.modalCtrl.create(SelectPage, {data: field});
        profileModal.present();

        profileModal.onDidDismiss(data => {
            console.log(data);
            if (data) {
                let choosedVal = data.val;
                this.user[field.name] = choosedVal;
                if(field.name.indexOf('userBirthday') == -1) {
                    this.form.fields[index]['valLabel'] = data.label;
                }else{
                    for(let i=0; i<3; i++){
                        if(field.name == this.form.fields[index]['sel'][i].name){
                            this.form.fields[index]['sel'][i]['valLabel'] = data.label;
                        }
                    }

                }
            }
        });
    }

    stepBack() {
        this.user.step = this.user.step - 2;
        this.sendForm();
    }

    setHtml(id, html) {
        if ($('#' + id).html() == '' && html != '') {
            let div: any = document.createElement('div');
            div.innerHTML = html;
            [].forEach.call(div.getElementsByTagName("a"), (a) => {
                var pageHref = a.getAttribute('onclick');
                if (pageHref) {
                    a.removeAttribute('onclick');
                    a.onclick = () => this.getPage(pageHref);
                }
            });
            $('#' + id).append(div);
        }
    }

    getPage(pageId) {
        this.navCtrl.push(Page, {pageId: pageId});
    }

    ionViewWillEnter() {
        this.api.pageName = 'RegisterPage';


        //this.api.activePageName = 'ContactPage';
        $('#back').show();
        this.api.storage.get('user_data').then((val) => {
            this.login = (val) ? val.status : false;
            if (this.login != 'login') {
                $('.footerMenu').hide();
            }
        });

        setTimeout(function () {
            if ($('div').hasClass('footerMenu')) {
            } else {
                $('#register .fixed-content,#register .scroll-content').css({'margin-bottom': '0'});
            }
        }, 100);

    }

    ionViewWillLeave() {
        $('#contact').removeAttr('style');
        if (this.login == 'login') {
            $('.mo-logo').click();
        }

    }

    inputClick(id) {

        let that = this;
        that.content.resize();
        setTimeout(function () {
            that.content.scrollTo(600, 0, 300);
            $('#' + id).focus();
        }, 400);

    }

    goToHome() {
        this.navCtrl.setRoot(HomePage);
        this.navCtrl.popToRoot();
    }
}
