import { Component } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import { LogService } from 'log.service';
import {CameraService} from 'camera.service';
enum captureState {
	waitForInput,
	countDown,
	waitForImage,
	displayPicture,
	displayError,
	printChoice
}


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	public captureState = captureState;//export enum type
	private currentCaptureState: captureState = captureState.waitForInput;
	
	private capturedImage:string;
	private capturedPrintableImage:string;
	private imageId:string;
	
	private restartCount: number = 0;
	
	constructor(translate: TranslateService,
				private logger: LogService,
				private cameraService : CameraService) {

		// this language will be used as a fallback when a translation isn't found in the current language
		translate.setDefaultLang('en');

		 // the lang to use, if the lang isn't available, it will use the current loader to get them
		let browserLang = translate.getBrowserLang();
		translate.use('en');
		//translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
		
		
	}

	ngOnInit(){
		
	}

	launchCountDown() {
		this.currentCaptureState = captureState.countDown;
	}
	
	waitCapture() {
		if(this.currentCaptureState != captureState.displayError) {
			this.currentCaptureState = captureState.waitForImage;
		}
	}

	capturePicture() {
		var that = this;
		this.cameraService.captureImage().subscribe(
			function success(data) {
				that.logger.log('image received');
				let jsonData = data.json();
				that.capturedImage = jsonData.src;
				that.capturedPrintableImage = jsonData.src;
				that.imageId = jsonData.id;
				that.currentCaptureState = captureState.displayPicture;
			},
			function error(data) {
				that.logger.error('error capturing picture : \n' + data.text());
				that.currentCaptureState = captureState.displayError;
			});

	}
	
	reloadPage() {
		location.reload();
	}
	
	restart() {
		this.restartCount ++;
		this.currentCaptureState =  captureState.waitForInput;
		if(this.restartCount > 5) {
			//reload entire page each 5  restart, for stability
			this.reloadPage();
		}
	}
	
	displayPrintChoice () {
		var that = this;
		this.currentCaptureState = captureState.printChoice;
		
		this.cameraService.getPrintPreview(this.imageId).subscribe(
			function success(data) {
				that.logger.log('print preview received');
				that.capturedPrintableImage = data.text();
			},
			function error(data) {
				that.logger.error('error getting print preview: \n' + data.text());
			});
	}
	
	printPicture(nber:number) {
		var that = this;
		this.logger.log('request print of ' + nber + ' copies');
		this.cameraService.printImage(this.imageId, nber).subscribe(
			function success(data) {
				that.logger.log('print succeeded');
				setTimeout(function () { that.restart(); }, 1000);
			},
			function error(data) {
				that.logger.error('print failed: \n' + data.text());
				setTimeout(function () { that.restart(); }, 1000);
			});
	}
}
