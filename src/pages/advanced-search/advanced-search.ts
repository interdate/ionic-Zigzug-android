import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ApiProvider} from "../../providers/api/api";
import {HomePage} from "../home/home";

/**
 * Generated class for the AdvancedSearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-advanced-search',
  templateUrl: 'advanced-search.html',
})
export class AdvancedSearchPage {

    form: any;

    ageLower: any = 20;
    ageUpper: any = 50;

    ages: any[] = [];

    height: any[] = [];

    default_range: any = {lower: this.ageLower, upper: this.ageUpper};

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public api: ApiProvider
    ) {
        this.api.http.get(api.url + '/user/advanced/search', api.setHeaders(true)).subscribe(data => {
            let res: any = data;
            this.form = res.form;
            this.form.heightFrom.value = '';
            this.form.heightTo.value = '';

            for (let i = 100; i <= 250; i++) {
                this.height.push(i);
            }

            for (let i = 18; i <= 80; i++) {
                this.ages.push(i);
            }
        }, err => {
            console.log("Oops!");
        });
    }

    toSearchResultsPage() {
        let params = //JSON.stringify(
            {
            action: 'search',
            list: '',
            filter: 'lastActivity',
            page: 1,
            usersCount: 10,
            advanced_search: {
                region: this.form.region.value,
                ageFrom: this.form.age.valueFrom,
                ageTo: this.form.age.valueTo,
                body: this.form.body.value,
                relationship: this.form.relationship.value,
                hairLength: this.form.hairLengthId.value,
                hairColor: this.form.hairColor.value,
                eyesColor: this.form.eyesColor.value,
                education: this.form.education.value,
                occupation: this.form.occupation.value,
                economy: this.form.economy.value,
                maritalStatus: this.form.maritalStatus.value,
                religion: this.form.religion.value,
                religion2: this.form.religion2.value,
                smoking: this.form.smoking.value,
                sexPref: this.form.sexPref.value,
                food: this.form.food.value,
                sport: this.form.sport.value,
                closet: this.form.closet.value,
                defined: this.form.defined.value,
                experience: this.form.experience.value,
                children: this.form.userChildren.value,
                animals: this.form.animals.value,
                heightFrom: this.form.heightFrom.value,
                heightTo: this.form.heightTo.value,
                withPhoto: this.form.withPhotos.value,
            }
        }
        //);
        this.navCtrl.push(HomePage, {advParams: params});
    }

    getAgeValues(event) {
        if (event.value.upper != 0) {
            this.ageUpper = event.value.upper;
        }
        if (event.value.lower != 0) {
            this.ageLower = event.value.lower;
        }
    }

    ionViewWillEnter() {
        this.api.pageName = 'AdvancedSearchPage';
    }


}
