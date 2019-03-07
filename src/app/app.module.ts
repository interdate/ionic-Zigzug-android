import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { IonicStorageModule } from '@ionic/storage';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ApiProvider } from '../providers/api/api';
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from "@ionic-native/keyboard";
import { AppVersion } from '@ionic-native/app-version';
import { Push } from '@ionic-native/push';
import { HttpClientModule } from '@angular/common/http';
import { LoginPageModule } from "../pages/login/login.module";
import {ArenaPageModule} from "../pages/arena/arena.module";
import {ProfilePageModule} from "../pages/profile/profile.module";
import {FullScreenProfilePageModule} from "../pages/full-screen-profile/full-screen-profile.module";
import {BingoPageModule} from "../pages/bingo/bingo.module";
import {FaqPageModule} from "../pages/faq/faq.module";
import {ContactUsPageModule} from "../pages/contact-us/contact-us.module";
import {PasswordRecoveryPageModule} from "../pages/password-recovery/password-recovery.module";
import {PageModule} from "../pages/page/page.module";
import {SettingsPageModule} from "../pages/settings/settings.module";
import {SelectPageModule} from "../pages/select/select.module";
import {SearchPageModule} from "../pages/search/search.module";
import {AdvancedSearchPageModule} from "../pages/advanced-search/advanced-search.module";
import {ChangePasswordPageModule} from "../pages/change-password/change-password.module";
import {NotificationsPageModule} from "../pages/notifications/notifications.module";
import {InboxPageModule} from "../pages/inbox/inbox.module";
import {DialogPageModule} from "../pages/dialog/dialog.module";
import {ChangePhotosPageModule} from "../pages/change-photos/change-photos.module";
import {RegisterPageModule} from "../pages/register/register.module";
import {Camera} from "@ionic-native/camera";
import { FileTransfer } from "@ionic-native/file-transfer";
import { File } from '@ionic-native/file';
import {ImagePicker} from "@ionic-native/image-picker";
import {Media} from "@ionic-native/media";
import {Device} from "@ionic-native/device";
import {SubscriptionPageModule} from "../pages/subscription/subscription.module";
import {FingerprintAIO} from "@ionic-native/fingerprint-aio";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import { AngularFireModule } from 'angularfire2';
import 'firebase/messaging'; // only import firebase messaging or as needed;
import { firebaseConfig } from '../environment';
import { FirebaseMessagingProvider } from '../providers/firebase-messaging';

@NgModule({
    declarations: [
        MyApp,
        HomePage
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot(MyApp,{
            menuType: 'overlay'
        }),
        AngularFireModule.initializeApp(firebaseConfig),
        IonicStorageModule.forRoot(),
        LoginPageModule,
        ArenaPageModule,
        ProfilePageModule,
        FullScreenProfilePageModule,
        BingoPageModule,
        FaqPageModule,
        ContactUsPageModule,
        PasswordRecoveryPageModule,
        PageModule,
        SettingsPageModule,
        SelectPageModule,
        SearchPageModule,
        AdvancedSearchPageModule,
        ChangePasswordPageModule,
        NotificationsPageModule,
        InboxPageModule,
        DialogPageModule,
        ChangePhotosPageModule,
        RegisterPageModule,
        SubscriptionPageModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        ApiProvider,
        Keyboard,
        Geolocation,
        AppVersion,
        Push,
        Camera,
        FileTransfer,
        File,
        ImagePicker,
        Media,
        Device,
        FingerprintAIO,
        InAppBrowser,
        FirebaseMessagingProvider
    ]
})
export class AppModule {}
