import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, Events, InfiniteScroll } from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {ProfilePage} from "../profile/profile";
import {DialogPage} from "../dialog/dialog";
declare var $: any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild(InfiniteScroll) scroll: InfiniteScroll;

    public options: {filter: any} = {filter: 1};
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
    users: any = [];//Array<{ id: string, isOnline: string, isAddBlackListed: string, nickName: string, photo: string, age: string, region_name: string, image: string, about: {}, component: any}>;
    texts: { like: string, add: string, message: string, remove: string, unblock: string, no_results: string };
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
                    page: 1
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
            this.password = val.password;
            this.username = val.username;
            this.getUsers();
        });

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
        this.navCtrl.push(DialogPage, {
            user: user
        });
    }

    addLike(user) {

        //console.log('USER: ' + JSON.stringify(user.userNick));
        if (user.isLike == false) {

            user.isLike = true;

            let toast = this.toastCtrl.create({
                message: ' עשית לייק ל' + user.userNick,
                duration: 5000
            });

            toast.present();

            let params = JSON.stringify({
                toUser: user.id,
            });

            this.api.http.post(this.api.url + '/user/like/' + user.id, params, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {

            }, err => {
                console.log("Oops!");
            });
        }
    }

    block(user, bool) {

        let toast;
        let params;

        if (user.isAddBlackListed == false && bool == true) {

            user.isAddBlackListed = true;


            params = JSON.stringify({
                list: 'Favorite',
                action: 'delete'
            });

        } else if (user.isAddBlackListed == true && bool == false) {

            user.isAddBlackListed = false;

            params = JSON.stringify({
                list: 'BlackList',
                action: 'delete'
            });
        }

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

    unFavorites(user) {

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
            this.users.splice(this.users.indexOf(user), 1);
            this.events.publish('statistics:updated');
        });

    }

    addFavorites(user) {

        if (user.isFav == false) {
            user.isFav = true;


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

        console.log(JSON.stringify(this.params.searchparams));

        let params = JSON.stringify({
            action: 'search',
            list: '',
            filter: this.filter,
            page: 1,
            searchparams: {region: this.params.searchparams.region, agefrom: this.params.searchparams.agefrom, ageto: this.params.searchparams.ageto, sexpreef: this.params.searchparams.sexpreef, meritalstat: this.params.searchparams.meritalstat, userNick: this.params.searchparams.userNick}

        });

        if (this.params.list) {
            params = JSON.stringify({
                action: '',
                list: this.params.list,
                filter: this.filter,
                page: 1,
                searchparams: {region: this.params.searchparams.region, agefrom: this.params.searchparams.agefrom, ageto: this.params.searchparams.ageto, sexpreef: this.params.searchparams.sexpreef, meritalstat: this.params.searchparams.meritalstat, userNick: this.params.searchparams.userNick}
            })
        }

        this.navCtrl.push(HomePage, {
            params: params
        })
    }


    getUsers() {

        //this.api.showLoad('אנא המתיני...');

        if (this.navParams.get('params') == 'login') {
            //loading.present();
            this.username = this.navParams.get('username');
            this.password = this.navParams.get('password');

            this.api.http.post(this.api.url + '/users/search/', this.params_str, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
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
                //this.setDistanceFormat();
            });
        } else {
            //alert(this.params_str);
            this.api.showLoad('אנא המתיני...');
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
                //this.setDistanceFormat();
            });
        }
    }


    moreUsers(infiniteScroll?: any) {

        if (this.loader) {
            this.page_counter++;
            this.params.page = this.page_counter;
            this.params_str = JSON.stringify(this.params);

            this.api.http.post(this.api.url + '/users/search/', this.params_str, this.api.setHeaders(true)).subscribe(data => {
                let res: any = data;
                if (res.users.length < this.params.usersCount) {
                    this.loader = false;
                }

                this.users = this.users.concat(res.users);
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
            });

        }
    }

    ionViewWillEnter() {
        this.api.pageName = 'HomePage';
        $('.back-btn').hide();

    }

}
