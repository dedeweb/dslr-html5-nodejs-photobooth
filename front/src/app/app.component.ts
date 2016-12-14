import { Component, ElementRef } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';
import { LogService } from 'log.service';

enum captureState {
	waitForCapture,
	countDown,
	displayPicture
}


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	
	public captureState = captureState;//export enum type 
  
	private currentStream : MediaStream = null;
	private videoElement: any;
	private currentStep: number = -1;
	private currentCaptureState: captureState = captureState.waitForCapture;
  
	constructor(translate: TranslateService,
				private p2pStreamService : P2pStreamService,
				private el: ElementRef,
				private logger: LogService) {
				
		// this language will be used as a fallback when a translation isn't found in the current language
		translate.setDefaultLang('en');

		 // the lang to use, if the lang isn't available, it will use the current loader to get them
		let browserLang = translate.getBrowserLang();
		translate.use('en');
		//translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
		var that = this;
		p2pStreamService.onAddStream = function(stream) {
			if(that.currentStream && that.currentStream.getVideoTracks().length > 0 ) {
				that.currentStream.getVideoTracks()[0].stop();
				that.currentStream = null;
			}
			that.logger.log('stream received. video tracks : ' + stream.getVideoTracks().length);
			if(stream.getVideoTracks().length> 0) {
				that.logger.log('track : ' + JSON.stringify(stream.getVideoTracks()[0]));
			}
			stream.onaddtrack = function () {
				that.logger.log('track added');
			};
			that.currentStream = stream;
			
			that.videoElement.play();
			
		};
	}
	ngOnInit(){
		var canvasElement = canvasElement = this.el.nativeElement.querySelector('canvas');
		this.videoElement = this.el.nativeElement.querySelector('video');
		var ctx= canvasElement.getContext('2d');
		
		this.videoElement.onloadedmetadata = function() {
			canvasElement.height = this.videoHeight -100;
			canvasElement.width  = this.videoWidth -100;
		}
		var that = this;
		this.videoElement.addEventListener('play', function () {
				that.logger.log('play');
				var that = this;
				
				(function loop() {
				  if (!that.paused && !that.ended) {
					ctx.drawImage(that,50, 50, that.videoWidth -100, that.videoHeight -100,
										0, 0, canvasElement.width, canvasElement.height);
					setTimeout(loop, 1000 / 30); // drawing at 30fps
				  }
				})();
			},false);
			//this.currentStep = 1;
			//this.currentCaptureState = captureState.countDown;
			//this.launchCountDown();
	}
  
	launchCountDown() {
		var that = this;
		this.currentStep = -1;
		this.currentCaptureState = captureState.countDown;
		var updateCountDown = function () {
			that.currentStep = that.currentStep + 1 ;
			that.logger.log('countdown:' + that.currentStep);
			if(that.currentStep === 0) {
				//first step (ready?) displayed longer
				setTimeout(updateCountDown, 3000);
			} else if (that.currentStep > 0 && that.currentStep < 6) {
				setTimeout(updateCountDown, 1000);
			} else {
				//exiting countdown
				that.currentCaptureState = captureState.waitForCapture;
			}
			
		}
		updateCountDown();
	
	}
}
