import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, Events, InfiniteScroll } from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {ProfilePage} from "../profile/profile";
import {DialogPage} from "../dialog/dialog";
import * as $ from 'jquery';
import {LoginPage} from "../login/login";
import {Push} from "@ionic-native/push";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild(InfiniteScroll) scroll: InfiniteScroll;

    public options: {filter: any} = {filter: 1};
    showLoader: any = false;
    list: any;
    action: any;
    offset: any;
    page_counter: any;
    loader: any = true;
    username: any;
    password: any;
    blocked_img: any = false;
    user_counter: any = 0;
    form_filter: any;
    filter: any; //= {filter: '', visible: ''}
    users: any;//Array<{ id: string, isOnline: string, isAddBlackListed: string, nickName: string, photo: string, age: string, region_name: string, image: string, about: {}, component: any}>;
    texts: { like: string, add: string, message: string, remove: string, unblock: string, no_results: string, chatErrorsMess: Array<string> };
    params: any
        = {
        action: 'online',
        filter: 'new',
        page: 1,
        usersCount: 20,
        list: '',
        searchparams: {region: '', agefrom: 0, ageto: 0, sexpreef: '', meritalstat: '', userNick: ''}
    };
    params_str: any;
    scrolling = false;
    selectOptions = {title: 'popover select'};
    user: any;
    //tracker: (ix: number, obj: any) => any;


    constructor(
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public navCtrl: NavController,
        public navParams: NavParams,
        public api: ApiProvider,
        public events: Events
    ) {
        if (navParams.get('params') && navParams.get('params') != 'login') {

            if (navParams.get('action')) {
                this.params_str = {
                    action: 'list',
                    list: navParams.get('params').list,
                    page: 1,
                    usersCount: 20,
                    filter: 'new'
                }
            }

            this.params_str = navParams.get('params');
            this.params = JSON.parse(this.params_str);
        }

        if(!navParams.get('params') || navParams.get('params') == 'login'){
            this.api.setLocation();
        }

        if(navParams.get('advParams')){
            this.params = navParams.get('advParams');
        }

        this.params_str = JSON.stringify(this.params);

        // If Current Page Is "Block" or "Favorited", than remove "Add Favorited"
        if (this.params.list == 'black' || this.params.list == 'fav') {
            this.blocked_img = true;
        }

        this.page_counter = 1;

        this.api.storage.get('user_data').then((val) => {
            if(val) {
                this.password = val.password;
                this.username = val.username;
                // if (val.user_id == 588929719) {
                //     this.api.testingMode = true;
                // } else {
                //     this.api.testingMode = false;
                // }
                if (val.status == 'not_activated') {
                    this.navCtrl.setRoot(LoginPage,{
                        'login': {
                            username: val.username,
                            password: val.password
                        }
                    });
                    this.navCtrl.popToRoot();
                } else {
                    this.getUsers();
                }
            }else{
                this.navCtrl.setRoot(LoginPage);
                this.navCtrl.popToRoot();
            }
        });
        //this.pushMess.updateToken();
        // if(this.pushMess.currentToken) {
        //     console.log("fcmToken: " + this.pushMess.currentToken);
        //     let data = JSON.stringify({deviceId: this.pushMess.currentToken});
        //     this.api.http.post(this.api.url + '/user/deviceId/OS:Browser', data, this.api.setHeaders(true)).subscribe(data => {
        //         //alert(JSON.stringify(data));
        //     });
        // }
        // let that = this;
        // setTimeout(function () {
        //     that.moreUsers();
        // },1000);
    }

    trackByFn(index: number, item: any): any {
        //console.log('virtualTrack', index, item);
            if ((index + 1) % 20 == 0) {
                console.log(item);
            }
            item.right = (index % 2 != 0)
            return item;
    }


    itemTapped(user) {
        this.navCtrl.push(ProfilePage, {
            user: user
        });
    }

    filterStatus() {
        if (this.options.filter == 1) {
            this.options.filter = 0;
        } else {
            this.options.filter = 1;
        }
    }

    toDialog(user) {
        if(user.id != this.api.myId) {
            var mess = '';
            if(user.isAllowedToSend == '1'){
                mess = this.texts.chatErrorsMess[1];
            }else if(user.isAllowedToSend == '2'){
                mess = this.texts.chatErrorsMess[2];
            }
            if(mess == ''){
                //user.userId = user.id;
                this.navCtrl.push(DialogPage, {
                    user: user
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

    addLike(user,index) {

        if (user.isLike == '0') {

            this.users[index].isLike = '1';

            let toast = this.toastCtrl.create({
                message: ' עשית לייק ל' + user.nickName,
                duration: 5000
            });

            toast.present();

            let params = JSON.stringify({
                toUser: user.id,
            });

            //alert(JSON.stringify(user));

            this.api.http.post(this.api.url + '/user/like/' + user.id, params, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {

            }, err => {
                console.log("Oops!");
            });
        }
    }

    block(user, bool) {

        let toast;
        let params;

        if (this.params.list == 'black' && bool == true) {

            //user.isAddBlackListed = true;


            params = JSON.stringify({
                list: 'BlackList',
                action: 'add'
            });

        } else if (this.params.list == 'black' && bool == false) {

            //user.isAddBlackListed = false;

            params = JSON.stringify({
                list: 'BlackList',
                action: 'delete'
            });
        }

        if(typeof params != 'undefined') {
            if (this.users.length == 1) {
                this.user_counter = 0;
            }

            // Remove user from list
            this.users.splice(this.users.indexOf(user), 1);
            this.events.publish('statistics:updated');


            this.api.http.post(this.api.url + '/user/managelists/black/0/' + user.id, params, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
                let res: any = data;
                toast = this.toastCtrl.create({
                    message: res.success,
                    duration: 3000
                });
                toast.present();
            });
        }
    }

    unFavorites(user,index) {
        if(user.isFav == '1') {
            this.users[index].isFav = '0';
            let params = JSON.stringify({
                list: 'Unfavorite'
            });

            this.api.http.post(this.api.url + '/user/managelists/favi/0/' + user.id, params, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
                let res: any = data;
                let toast = this.toastCtrl.create({
                    message: res.success,
                    duration: 3000
                });

                console.log(this.users);

                toast.present();
                //index = this.users.indexOf(user);
                this.users.splice(index, 1);
                this.events.publish('statistics:updated');
            });
        }
    }

    addFavorites(user, index) {

        if (user.isFav == '0') {
            this.users[index].isFav = '1';


            let params = JSON.stringify({
                list: 'Favorite'
            });

            this.api.http.post(this.api.url + '/user/managelists/favi/1/'+ user.id, params, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
                let res: any = data;
                let toast = this.toastCtrl.create({
                    message: res.success,
                    duration: 3000
                });

                toast.present();
                this.events.publish('statistics:updated');
            });
        }
    }

    sortBy() {

        //console.log(JSON.stringify(this.params.searchparams));

        let params = JSON.stringify({
            action: this.params.action,
            list: '',
            filter: this.filter,
            page: 1,
            searchparams: this.params.searchparams,
            advanced_search: this.params.advanced_search,

        });

        if (this.params.list) {
            params = JSON.stringify({
                action: 'list',
                list: this.params.list,
                filter: this.filter,
                page: 1,
                searchparams: this.params.searchparams,
                advanced_search: this.params.advanced_search,
            })
        }

        this.navCtrl.push(HomePage, {
            params: params
        })
    }


    getUsers() {

        //this.api.showLoad('אנא המתן...');

        if (this.navParams.get('params') == 'login') {
            //loading.present();
            var headers = this.api.setHeaders(true);
            if(this.navParams.get('username') && this.navParams.get('password')) {
                this.username = this.navParams.get('username');
                this.password = this.navParams.get('password');
                headers = this.api.setHeaders(true, this.username, this.password);
            }

            this.api.http.post(this.api.url + '/users/search/', this.params_str, headers).subscribe(data => {
                let res: any = data;
                this.api.hideLoad();
                this.users = res.users;
                this.texts = res.texts;

                this.user_counter = res.users.length;
                this.form_filter = res.filters;
                this.filter = res.filter;
                if (res.users.length < this.params.usersCount) {
                    this.loader = false;
                }
                if(typeof res.user != 'undefined'){
                    this.user = res.user;
                }
                //this.setDistanceFormat();
            }, err => {
                this.api.hideLoad();

                if(err.status == 403 ){
                    //if(val.status != resp.status){
                    //                         this.status = val.status = resp.status;
                    //                         val.userIsPaying = resp.userIsPaying;
                    //                         this.api.storage.set('user_data', val);
                    //                     }
                    if(this.api.pageName != 'LoginPage' && this.api.status != 'block') {
                        this.api.status = 'block';
                        this.api.setHeaders(false, null, null);
                        // Removing data storage
                        this.api.storage.remove('user_data');
                        this.navCtrl.setRoot(LoginPage, {error: err.error});
                        this.navCtrl.popToRoot();
                    }
                }
            });
        } else {
            //alert(this.params_str);
            var that = this;
            if(typeof this.password == 'undefined'){
                setTimeout(function () {
                    that.getUsers();
                },500);
            }else {
                this.api.showLoad('אנא המתן...');
                this.api.http.post(this.api.url + '/users/search/', this.params_str, this.api.setHeaders(true)).subscribe(data => {
                    let res: any = data;
                    this.api.hideLoad();
                    this.users = res.users;
                    this.texts = res.texts;
                    this.user_counter = res.users.length;
                    this.form_filter = res.filters;
                    this.filter = res.filter;
                    if (res.users.length < this.params.usersCount) {
                        this.loader = false;
                    }
                    if(typeof res.user != 'undefined'){
                        this.user = res.user;
                    }
                    //this.setDistanceFormat();
                }, err => {
                    this.api.hideLoad();

                    if(err.status == 403 ){
                        //if(val.status != resp.status){
                        //                         this.status = val.status = resp.status;
                        //                         val.userIsPaying = resp.userIsPaying;
                        //                         this.api.storage.set('user_data', val);
                        //                     }
                        if(this.api.pageName != 'LoginPage' && this.api.status != 'block') {
                            this.api.status = 'block';
                            this.api.setHeaders(false, null, null);
                            // Removing data storage
                            this.api.storage.remove('user_data');
                            this.navCtrl.setRoot(LoginPage, {error: err.error});
                            this.navCtrl.popToRoot();
                        }
                    }
                });
            }
        }
    }


    moreUsers(infiniteScroll?: any) {

        if (this.loader) {
            this.loader = false;
            this.showLoader = true;
            this.page_counter++;
            this.params.page = this.page_counter;
            this.params_str = JSON.stringify(this.params);

            this.api.http.post(this.api.url + '/users/search/', this.params_str, this.api.setHeaders(true)).subscribe(data => {
                let res: any = data;
                this.api.hideLoad();
                if (res.users.length == this.params.usersCount) {
                    this.loader = true;
                }
                this.texts = res.texts;
                this.users = this.users.concat(res.users);
                this.showLoader = false;
                //console.log(res.users,res.users.concat(this.users));
                //console.log(this.users);
                if(infiniteScroll) {

                    infiniteScroll.complete();

                // }else{
                //     let that = this;
                //     setTimeout(function () {
                //         if(that.api.pageName == 'HomePage') {
                //             that.moreUsers();
                //         }
                //     },1000);
                }
            },error => {
                this.api.hideLoad();
            });

        }
    }

    approveSubmit(){
        var value = (this.user.freeToday == '0') ? '1' : '0';
        this.user.freeToday = value;
        // let toast = this.toastCtrl.create({
        //     message: 'נשמר',
        //     duration: 3000
        // });
        //
        // toast.present();

        this.api.http.post(this.api.url + '/user/settings/freeToday/' + value, {}, this.api.setHeaders(true)).subscribe(data => {
        });
    }

    ionViewWillEnter() {
        this.api.pageName = 'HomePage';
        $('.back-btn').hide();

    }

}
