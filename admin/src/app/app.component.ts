import { Component } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {CameraService} from './camera.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

	cameraReady: any;
	constructor(translate: TranslateService,
				private cameraService : CameraService) {
		// this language will be used as a fallback when a translation isn't found in the current language
		translate.setDefaultLang('en');

		 // the lang to use, if the lang isn't available, it will use the current loader to get them
		let browserLang = translate.getBrowserLang();
		translate.use('en');
		//translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
	}
	
	GetCameraStatus() {
		var result = this.cameraService.GetStatus().subscribe(status => this.cameraReady = status);
		
		
	}
}
