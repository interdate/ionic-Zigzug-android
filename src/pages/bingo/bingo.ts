import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {DialogPage} from "../dialog/dialog";

/**
 * Generated class for the BingoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bingo',
  templateUrl: 'bingo.html',
})
export class BingoPage {

    data: { user: any, texts: any };

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public api: ApiProvider
    ) {
        this.data = navParams.get('data');
        this.data.texts.text2 = this.data.texts.text2.replace('USERNAME',this.data.user.nickName);
    }

    toDialog() {
        this.data.user.user_id = this.data.user.id;
        this.navCtrl.push(DialogPage,{ user: this.data.user });
    }

    goBack() {
        this.navCtrl.pop();
    }

    ionViewWillEnter() {
        this.api.pageName = 'BingoPage';
    }

}
