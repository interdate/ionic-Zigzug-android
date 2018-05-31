import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams, Slides, ToastController} from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {DialogPage} from "../dialog/dialog";

/**
 * Generated class for the FullScreenProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-full-screen-profile',
  templateUrl: 'full-screen-profile.html',
})
export class FullScreenProfilePage {

    @ViewChild(Slides) slides: Slides;

    user:any;
    myId:any;
    defurl:any;
    i:any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public toastCtrl:ToastController,
        public api: ApiProvider
    ) {
        this.user = navParams.get('user');

        this.i = navParams.get('i');
        //this.slides.slideTo(navParams.get('i'),1);
        this.api.storage.get('user_data').then((val) => {

            if (val) {
                this.myId = val.user_id;
            }
        });
    }

    goBack() {
        console.log('test');
        this.navCtrl.pop();
    }

    toDialog(user) {
        this.navCtrl.push(DialogPage, {
            user: user
        });
    }

    addFavorites(user) {

        //console.log(JSON.stringify(user));

        if (user.isAddFavorite == false) {
            user.isAddFavorite = true;


            let params = JSON.stringify({
                list: 'Favorite'
            });

            this.api.http.post(this.api.url + '/user/managelists/favi/1/'+ user.id, params, this.api.setHeaders(true)).subscribe(data => {
                let res:any = data;
                let toast = this.toastCtrl.create({
                    message: res.success,
                    duration: 3000
                });

                toast.present();
            });
        }
    }

    addLike(user) {
        user.isAddLike = true;
        let toast = this.toastCtrl.create({
            message: ' עשית לייק ל' + user.username,
            duration: 2000
        });

        toast.present();

        let params = JSON.stringify({
            toUser: user.id,
        });

        this.api.http.post(this.api.url + '/api/v1/likes/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {
            console.log(data);
        }, err => {
            console.log("Oops!");
        });
    }

    ionViewWillEnter() {
        this.api.pageName = 'FullScreenProfilePage';
    }

}
