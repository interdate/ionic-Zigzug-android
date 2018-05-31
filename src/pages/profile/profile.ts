import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Nav, ToastController, Content, LoadingController } from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {FullScreenProfilePage} from "../full-screen-profile/full-screen-profile";
import {DialogPage} from "../dialog/dialog";

declare var $: any;

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
    @ViewChild(Content) content: Content;
    @ViewChild(Nav) nav: Nav;

    isAbuseOpen: any = false;

    user: any = {};

    texts: { lock: any, unlock: any } = {lock: '', unlock: ''};

    formReportAbuse: { title: any, buttons: { cancel: any, submit: any }, text: { label: any, name: any, value: any } } =
        {title: '', buttons: {cancel: '', submit: ''}, text: {label: '', name: '', value: ''}};

    myId: any = false;

    imageClick: boolean = false;

    photos:any = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public api: ApiProvider
    ) {
        //this.api.showLoad('אנא המתיני...');

        var user = navParams.get('user');

        if (user) {

            this.user = user;
            if(typeof this.user.photos == 'undefined'){
                let url = (this.user.photo) ? this.user.photo: this.user.mainImage.url;
                url = url.replace('c_thumb,g_face,h_600,w_600','w_600');
                this.user.photos = [{url:url}];
                //this.user.mainImage = false;
            }
            this.photos = this.user.photos;
            console.log(this.user.photos);

            this.api.http.get(api.url + '/user/profile/' + this.user.id, api.setHeaders(true)).subscribe(data => {
                let res:any = data;
                this.user = res;
                if(this.user.photos.length > this.photos.length) {
                    for (let i = 0; i < this.user.photos.length; i++) {
                        if (i > 0) {
                            this.photos.push(this.user.photos[i]);
                        }
                    }
                }
                this.formReportAbuse = res.formReportAbuse;
                this.texts = res.texts;
                this.api.hideLoad();
                this.imageClick = true;
            });
        } else {

            this.api.storage.get('user_data').then((val) => {
                //alert(val);
                if (val) {
                    this.myId = val.user_id;
                    this.api.http.get(api.url + '/user/profile/' + this.myId, api.setHeaders(true)).subscribe(data => {
                        let res:any = data;
                        this.user = res;
                        this.photos = this.user.photos;
                        this.formReportAbuse = res.formReportAbuse;
                        this.texts = res.texts;
                        this.api.hideLoad();
                        this.imageClick = true;
                    });
                }
            });
        }
    }

    setHtml(id, html) {
        if ($('#' + id).html() == '' && html != '') {
            let div: any = document.createElement('div');
            div.innerHTML = html;/*
            [].forEach.call(div.getElementsByTagName("a"), (a) => {
                var pageHref = a.getAttribute('onclick');
                if (pageHref) {
                    a.removeAttribute('onclick');
                    a.onclick = () => this.getPage(pageHref);
                }
            });*/
            $('#' + id).append(div);
        }
    }

    scrollToBottom() {
        this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 300);
    }

    addFavorites(user) {

        if (user.isAddFavorite == false) {
            user.isAddFavorite = true;


            let params = JSON.stringify({
                list: 'Favorite'
            });

            this.api.http.post(this.api.url + '/user/managelists/favi/1/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {
                let res:any = data;
                let toast = this.toastCtrl.create({
                    message: res.success,
                    duration: 3000
                });

                toast.present();
            });
        }
    }

    blockSubmit() {
        var action;
        if (this.user.isAddBlackListed == true) {
            this.user.isAddBlackListed = false;
            action = 'delete';
        } else {
            this.user.isAddBlackListed = true;
            action = 'create';
        }

        let params = JSON.stringify({
            list: 'BlackList',
            action: action
        });

        var act = this.user.isAddBlackListed == 1 ? 1 : 0;

        this.api.http.post(this.api.url + '/user/managelists/black/' + act + '/' + this.user.id, params, this.api.setHeaders(true)).subscribe(data => {
            let res:any = data;
            let toast = this.toastCtrl.create({
                message: res.success,
                duration: 3000
            });

            toast.present();

        });
    }

    addLike(user) {
        user.isAddLike = true;
        let toast = this.toastCtrl.create({
            message: ' עשית לייק ל' + user.userNick,
            duration: 2000
        });

        toast.present();

        let params = JSON.stringify({
            toUser: user.id,
        });

        this.api.http.post(this.api.url + '/user/like/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {
            console.log(data);
        }, err => {
            console.log("Oops!");
        });

    }

    fullPagePhotos(index) {

        //alert(JSON.stringify(this.user.photos[0].usr));

        if(this.user.photos[0].url != 'https://www.shedate.co.il/images/users/small/0.jpg') {
            this.navCtrl.push(FullScreenProfilePage, {
                user: this.user,
                i: index
            });
        }
    }

    toDialog(user) {
        this.navCtrl.push(DialogPage, {
            user: user
        });
    }

    reportAbuseShow() {
        this.isAbuseOpen = true;
        this.scrollToBottom();
    }

    reportAbuseClose() {
        this.isAbuseOpen = false;
        this.formReportAbuse.text.value = "";
    }

    abuseSubmit() {

        let params = JSON.stringify({
            text: this.formReportAbuse.text.value,
        });

        this.api.http.post(this.api.url + '/user/abuse/' + this.user.id, params, this.api.setHeaders(true)).subscribe(data => {
            let res:any = data;
            let toast = this.toastCtrl.create({
                message: (res.messageText) ? res.messageText : 'הודעתך נשלחה בהצלחה להנהלת האתר',
                duration: 2000
            });

            toast.present();
        }, err => {
            console.log("Oops!");
        });
        this.reportAbuseClose();
    }

    ionViewWillLeave() {
        $('.back-btn').hide();
    }

    ionViewWillEnter() {
        this.api.pageName = 'ProfilePage';
        $('.back-btn').show();
    }

}
