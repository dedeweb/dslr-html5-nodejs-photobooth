import { Component, ElementRef } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app works!';
  private currentStream : MediaStream = null;
  private videoElement: any;
  constructor(translate: TranslateService,
				private p2pStreamService : P2pStreamService,
				private el: ElementRef) {
				
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
			console.log('stream received. video tracks : ' + stream.getVideoTracks().length);
			if(stream.getVideoTracks().length> 0) {
				console.log('track : ' + JSON.stringify(stream.getVideoTracks()[0]));
			}
			stream.onaddtrack = function () {
				console.log('track added');
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
	
  }
}
