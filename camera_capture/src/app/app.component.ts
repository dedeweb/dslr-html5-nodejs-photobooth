import { Component, ElementRef } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';
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
	private mediaDevices = [];
	private currentStream : MediaStream = null;
	private videoElement : HTMLVideoElement;
	private canvasElement: HTMLCanvasElement;
	
	constructor(translate: TranslateService, 
				private el: ElementRef,
				private p2pStreamService : P2pStreamService) {
		// this language will be used as a fallback when a translation isn't found in the current language
		translate.setDefaultLang('en');

		 // the lang to use, if the lang isn't available, it will use the current loader to get them
		let browserLang = translate.getBrowserLang();
		translate.use('en');
		//translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
		
		
	}
	
	ngOnInit(){
		this.videoElement = this.el.nativeElement.querySelector('video');
		var canvasElement = this.canvasElement = this.el.nativeElement.querySelector('canvas');
		this.refreshDevices();
		var ctx= this.canvasElement.getContext('2d');
		
		this.videoElement.onloadedmetadata = function() {
			canvasElement.height = this.videoHeight -100;
			canvasElement.width = this.videoWidth -100;
		}
		
		this.videoElement.addEventListener('play', function () {
			console.log('play');
			var that = this;
			
			(function loop() {
			  if (!that.paused && !that.ended) {
				ctx.drawImage(that,50, 50, that.videoWidth -100, that.videoHeight -100,
									0, 0, canvasElement.width, canvasElement.height);
				setTimeout(loop, 1000 / 30); // drawing at 30fps
			  }
			})();
		},false);
		this.p2pStreamService.streamVideo(canvasElement.captureStream(30));
	}
	
	refreshDevices () {
		var that = this;
		navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
			
			that.mediaDevices = _.where(deviceInfos, { kind: 'videoinput'});
			
		}).catch(function (error) {
			//TODO use real logger
			console.log('navigator.getUserMedia error: ', error);
		});
	}
	
	startStream(mediaId : string) {
		console.log('start stream : '  + mediaId);
		var that = this;
		navigator.mediaDevices.getUserMedia({
			video: {
				deviceId: mediaId
			}
		}).then(function (stream) {
			that.currentStream = stream;
			// Refresh button list in case labels have become available
			that.refreshDevices();
		});
	}
}
