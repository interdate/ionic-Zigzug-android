import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {Camera} from "@ionic-native/camera";
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import {ImagePicker} from "@ionic-native/image-picker";
import {Page} from "../page/page";
import {HomePage} from "../home/home";

/**
 * Generated class for the ChangePhotosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-change-photos',
  templateUrl: 'change-photos.html',
})
export class ChangePhotosPage {

    image: any;
    photos: any;
    imagePath: any;
    username: any = false;
    password: any = false;
    new_user: any = false;

    dataPage: { noPhoto: any, texts: any, images: Array<{ _id: string, items: {}, url: string, imgValidated: string, main: string}> };
    description: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public api: ApiProvider,
        public camera: Camera,
        public fileTransfer: FileTransfer,
        public imagePicker: ImagePicker,
        public actionSheetCtrl: ActionSheetController
    ) {
        if (navParams.get('new_user')) {
            this.new_user = 1;
            //this.api.storage.set('new_user', 1);
        }
        this.api.storage.get('user_data').then((val) => {
            this.username = val.username;
            this.password = val.password;
        });

        // this.api.storage.get('new_user').then((val) => {
        //     if (val) {
        //         this.new_user = val;
        //     }else{
        //         this.new_user = false;
        //     }
        // });

        if (navParams.get('username') && navParams.get('password')) {
            this.password = navParams.get('password');
            this.username = navParams.get('username');
        }

        this.getPageData();
        this.image = navParams.get('images');
    }

    delete(photo) {
        let confirm = this.alertCtrl.create({
            title: 'האם למחוק את התמונה?',
            buttons: [
                {
                    text: 'לא',
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                }, {
                    text: 'כן',
                    handler: () => {
                        this.postPageData('deleteImage', photo);
                    }
                }
            ]
        });
        confirm.present();
    }


    getCount(num) {
        return parseInt(num) + 1;
    }

    getPageData() {

        this.api.http.get(this.api.url + '/user/images', this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
            let res:any = data;
            this.dataPage = res;
            //this.description = data.json().texts.description;
            this.photos = res.images.items;
            this.api.hideLoad();
        }, err => {
            console.log(JSON.stringify(err));
            this.api.hideLoad();
        });
    }

    getPage(id) {
        this.navCtrl.push(Page, {id: id});
    }

    postPageData(type, params) {//not active
        var data: any;
        var action:any;
        if (type == 'setMain') {
            action = "setMain";
            console.log('Param', params);
            data = JSON.stringify({setMain: params.id});

        } else if (type == 'deleteImage') {
            action = "delete";
            data = JSON.stringify({
                //delete: params.id
            });
        }

        this.api.http.post(this.api.url + '/user/images/' + action + '/' + params.id, data, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
            let res:any = data;
            if(type != 'setMain') {
                this.dataPage = res;
            }else {
                this.dataPage.images = res.images;
            }
            this.photos = res.images.items;
        }, err => {
            console.log("Oops!");
        });
    }

    edit(photo) {

        let mainOpt = [];

        if (photo.main == 0) {

            mainOpt.push({
                    text: 'קבעי כראשית',
                    icon: 'contact',
                    handler: () => {
                        this.postPageData('setMain', photo);
                    }
                }
            );
        }

        mainOpt.push({
            text: this.dataPage.texts.delete,
            role: 'destructive',
            icon: 'trash',
            handler: () => {
                this.delete(photo);
            }
        });
        mainOpt.push({
            text: this.dataPage.texts.cancel,
            role: 'destructive',
            icon: 'close',
            handler: () => {
                console.log('Cancel clicked');
            }
        });

        var status = photo.isValid == 1 ?
            this.dataPage.texts.approved : this.dataPage.texts.waiting_for_approval;

        let actionSheet = this.actionSheetCtrl.create({
            title: this.dataPage.texts.edit_photo,

            subTitle: this.dataPage.texts.status + ': ' + status,

            buttons: mainOpt
        });
        actionSheet.present();
    }

    add() {

        let actionSheet = this.actionSheetCtrl.create({
            title: this.dataPage.texts.add_photo,
            buttons: [
                {
                    text: this.dataPage.texts.choose_from_camera,
                    icon: 'aperture',
                    handler: () => {
                        this.openCamera();
                    }
                }, {
                    text: this.dataPage.texts.choose_from_gallery,
                    icon: 'photos',
                    handler: () => {
                        this.openGallery();
                    }
                }, {
                    text: this.dataPage.texts.cancel,
                    role: 'destructive',
                    icon: 'close',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });
        actionSheet.present();
    }

    openGallery() {

        let options = {
            maximumImagesCount: 1,
            width: 600,
            height: 600,
            quality: 100
        };

        this.imagePicker.getPictures(options).then(
            (file_uris) => {
                this.uploadPhoto(file_uris[0]);
            },

            (err) => {
                //alert(JSON.stringify(err))
            }
        );
    }

    openCamera() {
        let cameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            sourceType: this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.JPEG,
            targetWidth: 600,
            targetHeight: 600,
            saveToPhotoAlbum: true,
            chunkedMode: true,
            correctOrientation: true
        };

        this.camera.getPicture(cameraOptions).then((imageData) => {
            this.uploadPhoto(imageData);
        }, (err) => {
            console.log(err);
        });
    }

    safeHtml(el): any {
        let html = this.description;
        let div: any = document.createElement('div');
        div.innerHTML = html;
        [].forEach.call(div.getElementsByTagName("a"), (a) => {
            var pageHref = a.getAttribute('click');
            if (pageHref) {
                a.removeAttribute('click');
                a.onclick = () => this.getPage(pageHref);
            }
        });
        if (el.innerHTML == '') {
            el.appendChild(div);
        }
    }

    uploadPhoto(url) {
        this.api.showLoad('אנא המתיני...');

        this.api.storage.get('user_data').then((val) => {

            let options: FileUploadOptions = {
                fileKey: "photo",
                fileName: 'test.jpg',
                httpMethod: 'POST',
                chunkedMode: false,
                mimeType: "image/jpg",
                headers: {Authorization: "Basic " + btoa(encodeURIComponent(this.username) + ":" + encodeURIComponent(this.password))}/*@*/
            };

            const filetransfer: FileTransferObject = this.fileTransfer.create();

            filetransfer.upload(url, this.api.url + '/user/image', options).then((data) => {
                //this.navCtrl.push(ChangePhotosPage, {new_user: 1});
                this.getPageData();
                let res:any = data;
                console.log(JSON.stringify(res));
                this.api.hideLoad();
            }, (err) => {
                console.log(JSON.stringify(err));
                this.api.hideLoad();
            });
        });
    }

    onHomePage() {
        //this.api.storage.remove('new_user');
        this.navCtrl.push(HomePage);
    }

    ionViewWillEnter() {
        this.api.pageName = 'ChangePhotosPage';
    }
}
