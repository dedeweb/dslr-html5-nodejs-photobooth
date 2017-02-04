import { Component, ElementRef } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';
import { LogService } from 'log.service';
//import * as _ from 'underscore';

declare var _:any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'app works!';
	private currentMedia: string = '';
	private currentQuality: string = '2';
	private mediaDevices = [];
	private currentStream : MediaStream = null;
	private videoElement : HTMLVideoElement;
	private remoteStream : MediaStream = null;
	private clientConnected: boolean = false;

	private videoQuality : any[] = [
		{ val: 1, label: "QVGA (320x240)" },
		{ val: 2, label: "VGA (640x480)" },
		{ val: 3, label: "XGA (1024x768)" 	},
		{ val: 4, label: "UXGA (1600x1200)" }
	];

	constructor(translate: TranslateService,
				private el: ElementRef,
				private p2pStreamService : P2pStreamService,
				private logger: LogService) {
		// this language will be used as a fallback when a translation isn't found in the current language
		translate.setDefaultLang('en');

		 // the lang to use, if the lang isn't available, it will use the current loader to get them
		let browserLang = translate.getBrowserLang();
		translate.use('en');
		//translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
		var that = this;
		p2pStreamService.onClientStatusChange = function (connected: boolean) {
			that.clientConnected = connected;
		};

	}

	ngOnInit(){
		this.videoElement = this.el.nativeElement.querySelector('video');
		this.refreshDevices();
	}

	refreshDevices () {
		var that = this;
		navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {

			that.mediaDevices = _.where(deviceInfos, { kind: 'videoinput'});

		}).catch(function (error) {
			that.logger.error('navigator.getUserMedia error: ' + JSON.stringify(error));
		});
	}

	private getQualityWidth() : number {

		switch(this.currentQuality) {
			case '1':
				return 320;
			case '2':
				return 640;
			case '3':
				return 1024;
			case '4':
				return 1600;
			default:
				return 640;
		}
	}

	private getQualityHeight() : number {

		switch(this.currentQuality) {
			case '1':
				return 240;
			case '2':
				return 480;
			case '3':
				return 768;
			case '4':
				return 1200;
			default:
				return 480;
		}
	}

	startStream() {
		if(this.currentMedia) {

			this.logger.log('start stream : '  + this.currentMedia);
			var that = this;
			navigator.mediaDevices.getUserMedia({
				audio: false,
				video: {
					deviceId: this.currentMedia,
					width: this.getQualityWidth(),
					height: this.getQualityHeight()
				}
			}).then(function (stream) {

				that.currentStream = stream;
				// Refresh button list in case labels have become available
				that.refreshDevices();
				that.p2pStreamService.cameraReady(true, stream);
			});
		}
		else {
			this.p2pStreamService.cameraReady(false, null);
		}
	}
}
