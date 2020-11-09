import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {DialogPage} from "../dialog/dialog";

/**
 * Generated class for the InboxPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
})
export class InboxPage {

    users: Array<{ id: string, message: string, mainImage: string, nickName: string, newMessagesNumber: string, faceWebPath: string, noPhoto: string }>;
    texts: { no_results: string };
    prop: any = {
      perPage: 20,
      page: 1
    };
    loader:any = true;
    textMess: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, public api: ApiProvider, public toastCtrl: ToastController) {
        this.api.showLoad();
        this.api.http.get(this.api.url + '/user/contacts/perPage:' + this.prop.perPage + '/page:' + this.prop.page, this.api.setHeaders(true)).subscribe(data => {
            let res:any = data;
            if (res.allChats.length < this.prop.perPage) {
                this.loader = false;
            }
            //this.users = res.allChats;
            this.textMess = res.texts;
            this.users = [];
            for (let person of res.allChats) {
                if(person.visibleMessagesNumber > 0){
                    this.users.push(person);
                }
            }
            this.api.hideLoad();
            let that = this;
            setTimeout(function () {
                if(that.api.pageName == 'InboxPage') {
                    that.moreUsers();
                }
            },1000);
        });
    }

    moreUsers(infiniteScroll?: any) {
        if (this.loader) {
            this.prop.page++;

            this.api.http.get(this.api.url + '/user/contacts/perPage:' + this.prop.perPage + '/page:' + this.prop.page, this.api.setHeaders(true)).subscribe(data => {
                let res: any = data;
                this.textMess = res.texts;
                if (res.allChats.length < this.prop.perPage) {
                    this.loader = false;
                }
                for (let person of res.allChats) {
                    if(person.visibleMessagesNumber > 0){
                        this.users.push(person);
                    }
                }
                if(infiniteScroll) {
                    setTimeout(function () {
                        infiniteScroll.complete();
                    }, 1);
                }else{
                    let that = this;
                    setTimeout(function () {
                        that.moreUsers();
                    },1000);
                }
            });

        }
    }

    ionViewWillEnter() {
        this.api.pageName = 'InboxPage';
    }

    toDialogPage(user) {
        var mess = '';
        if(user.user.isAllowedToSend == '1'){
            mess = this.textMess.chatErrorsMess[1];
        }else if(user.user.isAllowedToSend == '2'){
            mess = this.textMess.chatErrorsMess[2];
        }
        if(mess == ''){
            //user.userId = user.id;
            this.navCtrl.push(DialogPage, {
                user: user.user
            });
        }else{
            let toast = this.toastCtrl.create({
                message: mess,
                duration: 5000
            });
            toast.present();
        }

    }
}
