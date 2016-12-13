import { Component, OnInit } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {CameraService} from '../camera.service';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit {

	cameraReady: boolean = false;
	cameraWSLoading: boolean = false;
	cameraModeWSLoading: boolean = false;
	cameraMessage: string;
	useFakeCamera: boolean = false;
	
	
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
		var that = this;
		this.cameraWSLoading = true;
		this.cameraReady = false;
		this.cameraMessage = '';
		
		this.cameraService.GetStatus().subscribe(
			function success(data) {
				that.cameraReady = !data.json().error;
				that.cameraMessage = data.json().message;
				that.cameraWSLoading = false;
				},
			function error(data) {
				that.cameraReady = false;
				that.cameraMessage = 'Error ' +  data.status + ' : ' + data.statusText;
				that.cameraWSLoading = false;
				//data.json().message;
			});
	}
	RefreshCameraMode() {
		var that = this;
		this.cameraModeWSLoading = true;
		this.cameraService.GetMode().subscribe(
			function success(data) {
				that.useFakeCamera = data.json().fakeCamera;
				that.cameraModeWSLoading = false;
				},
			function error(data) {
				that.cameraModeWSLoading = false;
				//TODO: log error
			});
	}
	
	SetCameraMode(mode: boolean) {
		var that = this;
		this.cameraModeWSLoading = true;
		this.cameraService.SetMode(mode).subscribe(
			function success() {
				that.RefreshCameraMode();
				that.GetCameraStatus();
				});
	}
	
	ngOnInit() {
		this.RefreshCameraMode();
		this.GetCameraStatus();
	
	}

}
