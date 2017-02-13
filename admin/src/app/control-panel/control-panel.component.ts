import { Component, OnInit, DoCheck } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {CameraService} from 'camera.service';
import { LogService } from 'log.service';
import { KioskAppService } from '../kioskapp.service';
import { P2pStreamService } from '../p2p-stream.service';
import { ToasterService } from 'angular2-toaster';
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
	currentLocalDeviceId: number;
	outputDir: string = '';
	outputDirLoading: boolean = false;
	printerInfosLoading: boolean = false;
	printerInfos:string = '';
	printerInfosErr:string = null;
	canPrint:boolean = false;
	numberOfPrint:number = 0;
	numberOfPrintLoading: boolean = false;
	
	constructor(translate: TranslateService,
				private cameraService : CameraService,
				public logger: LogService,
				private kioskAppService : KioskAppService,
				private p2pStreamService : P2pStreamService,
				private toasterService: ToasterService) {
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
	
	refreshOutputDir() {
		var that = this;
		this.outputDirLoading = true;
		this.cameraService.getOutputDir().subscribe(
			function success(data) {
				that.outputDir = data.json().dir;
				that.outputDirLoading = false;
				},
			function error(data) {
				that.outputDirLoading = false;
				that.toasterService.pop('error', 'Error getting output dir', '' + data);
			});
	}
	
	refreshPrinterInfos() {
		var that = this;
		this.printerInfosLoading = true;
		this.cameraService.getPrinterInfos().subscribe(
			function success(data) {
				that.printerInfos = data.text();
				that.printerInfosErr  = null;
				that.printerInfosLoading = false;
				},
			function error(data) {
				that.printerInfosLoading = false;
				that.printerInfosErr = data.text();
				
			});
	}
	
	refreshNumberOfPrint() {
		var that = this;
		this.numberOfPrintLoading = true;
		this.cameraService.printCapacity().subscribe(
			function success(data) {
				that.numberOfPrint = parseInt(data.text());
				that.numberOfPrintLoading = false;
			},
			function error(data) {
				that.toasterService.pop('error', 'Error getting print capacity', '' + data.text());
				that.numberOfPrintLoading = false;
			});
	}
	
	saveNumberOfPrint() {
		var that = this;
		this.numberOfPrintLoading = true;
		this.cameraService.setPrintCapacity(this.numberOfPrint).subscribe(
		function success() {
			that.toasterService.pop('success', 'print', 'print capacity set to ' + that.numberOfPrint);
			that.refreshNumberOfPrint();
		}, function error(data) {
			that.toasterService.pop('error', 'print', 'error setting print capacity' + data.text());
		});
	}
	
	updateOutputDir() {
		var that = this;
		this.outputDirLoading = true;
		this.cameraService.setOutputDir(this.outputDir).subscribe(function success() {
				that.toasterService.pop('success', 'Output dir', 'updated successfully');
				that.outputDirLoading = false;
				that.refreshOutputDir();
				},
			function error(data) {
				that.outputDirLoading = false;
				that.toasterService.pop('error', 'Error setting output dir', '' + data.text());
				that.refreshOutputDir();
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
	
	setCanPrint(canPrint:boolean) {
		var that = this;
		this.cameraService.setCanPrint(canPrint).subscribe(
			function success() {
				if(canPrint) {
					that.toasterService.pop('success', 'print', 'print enabled');
				} else {
					that.toasterService.pop('success', 'print', 'print disabled');
				}
				
				that.refeshCanPrint();
			});
	}
	
	refeshCanPrint() {
		var  that = this;
		this.cameraService.canPrint().subscribe(
			function success(data) {
				that.canPrint = (data.text() === "true");
			}, 
			function error() {
				that.canPrint = false;
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
						that.toasterService.pop('warning', 'kiosk url wrong response', JSON.stringify(data));
						that.kioskAppReady = false;
					}
				},
				function error(data) {
					that.kioskAppWSInfoLoading = false;
					that.kioskAppReady = false;
					that.toasterService.pop('error', 'error getting kioskApp', JSON.stringify(data));
					that.logger.error('error getting kioskApp' + JSON.stringify(data) );
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
			that.toasterService.pop('error', 'kiosk app', 'browse error');
		});
	}
	
	reloadUrl() {
		let that=this;
		this.logger.log('request reload');
		this.kioskAppService.reload().subscribe(function success() {
			that.logger.log('reload url success');
		}, function error(){
			that.logger.error('reload url error');
			that.toasterService.pop('error', 'kiosk app', 'reload error');
		});
	}
	
	exitFs() {
		let that=this;
		this.logger.log('request reload');
		this.kioskAppService.exitFs().subscribe(function success() {
			that.logger.log('exit fullscreen success');
		}, function error(){
			that.logger.error('exit fullscreen error');
			that.toasterService.pop('error', 'kiosk app', 'exit fullscreen error');
		});
	}
	
	enterFs() {
		let that=this;
		this.logger.log('request reload');
		this.kioskAppService.enterFs().subscribe(function success() {
			that.logger.log('enter fullscreen success');
		}, function error(){
			that.logger.error('enter fullscreen error');
			that.toasterService.pop('error', 'kiosk app', 'enter fullscreen error');
		});
	}
	
	ngOnInit() {
		this.refreshCameraMode();
		this.getCameraStatus();
		this.refreshOutputDir();
		this.refreshPrinterInfos();
		this.refeshCanPrint();
		this.refreshNumberOfPrint();
	
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
