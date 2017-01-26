import { Component, OnInit, DoCheck } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {CameraService} from 'camera.service';
import { LogService } from 'log.service';
import { KioskAppService } from '../kioskapp.service';
import 'rxjs/Rx';

@Component({
	selector: 'app-control-panel',
	templateUrl: './control-panel.component.html',
	styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit, DoCheck  {
	private _frontAddress: string = null;

	cameraReady: boolean = false;
	cameraWSLoading: boolean = false;
	cameraModeWSLoading: boolean = false;
	cameraMessage: string;
	useFakeCamera: boolean = false;
	kioskAppUrl: string = null;
	kioskAppWSInfoLoading: boolean = false;
	kioskAppReady: boolean = false;
	kioskAppVersion:string = '';
	kioskAppBrowseUrl: string = '';
	
	constructor(translate: TranslateService,
				private cameraService : CameraService,
				public logger: LogService,
				private kioskAppService : KioskAppService) {
		// this language will be used as a fallback when a translation isn't found in the current language
		translate.setDefaultLang('en');

		 // the lang to use, if the lang isn't available, it will use the current loader to get them
		let browserLang = translate.getBrowserLang();
		translate.use('en');
		//translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
	}
	
	getCameraStatus() {
		var that = this;
		this.cameraWSLoading = true;
		this.cameraReady = false;
		this.cameraMessage = '';
		
		this.cameraService.getStatus().subscribe(
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
	refreshCameraMode() {
		var that = this;
		this.cameraModeWSLoading = true;
		this.cameraService.getMode().subscribe(
			function success(data) {
				that.useFakeCamera = data.json().fakeCamera;
				that.cameraModeWSLoading = false;
				},
			function error(data) {
				that.cameraModeWSLoading = false;
				//TODO: log error
			});
	}
	
	setCameraMode(mode: boolean) {
		var that = this;
		this.cameraModeWSLoading = true;
		this.cameraService.setMode(mode).subscribe(
			function success() {
				that.refreshCameraMode();
				that.getCameraStatus();
				});
	}
	
	refreshKioskApp() {
		if(this.kioskAppUrl) {
			this.logger.log('refresh kiosk app infos');
			let that = this;
			this.kioskAppUrl = this.kioskAppUrl.replace('http://', '').trim();
			this.kioskAppWSInfoLoading = true;
			this.kioskAppService.test('http://' + this.kioskAppUrl).subscribe(
				function success(data) {
					that.kioskAppWSInfoLoading = false;
					if(data.json().app === 'kioskApp') {
						that.kioskAppReady = true;
						that.kioskAppVersion = data.json().version;
					} else {
						that.logger.warn('kiosk url wrong response : ' + JSON.stringify(data));
						that.kioskAppReady = false;
					}
				},
				function error(data) {
					that.kioskAppWSInfoLoading = false;
					that.kioskAppReady = false;
					that.logger.warn('error getting kioskApp' + JSON.stringify(data) );
				}
			);
		}
	}
	
	browseUrl() {
		let that=this;
		this.logger.log('request browse url ' + this.kioskAppBrowseUrl);
		this.kioskAppService.browse(this.kioskAppBrowseUrl).subscribe(function success() {
			that.logger.log('browse success');
		}, function error(){
			that.logger.error('browse error');
		});
	}
	
	reloadUrl() {
		let that=this;
		this.logger.log('request reload');
		this.kioskAppService.reload().subscribe(function success() {
			that.logger.log('reload url success');
		}, function error(){
			that.logger.error('reload url error');
		});
	}
	
	exitFs() {
		let that=this;
		this.logger.log('request reload');
		this.kioskAppService.exitFs().subscribe(function success() {
			that.logger.log('exit fullscreen success');
		}, function error(){
			that.logger.error('exit fullscreen error');
		});
	}
	
	enterFs() {
		let that=this;
		this.logger.log('request reload');
		this.kioskAppService.enterFs().subscribe(function success() {
			that.logger.log('exit fullscreen success');
		}, function error(){
			that.logger.error('exit fullscreen error');
		});
	}
	
	ngOnInit() {
		this.refreshCameraMode();
		this.getCameraStatus();
	
	}
	ngDoCheck() {
		if(this.logger.frontEndAddress !== this._frontAddress && !this.kioskAppUrl) {
			this._frontAddress = this.logger.frontEndAddress;
			this.kioskAppUrl = this.logger.frontEndAddress ? this.logger.frontEndAddress + ':1664' : '';
			if(this.kioskAppUrl) {
				this.refreshKioskApp();
			}
		}
	}
}
