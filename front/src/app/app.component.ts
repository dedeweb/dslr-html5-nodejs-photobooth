import { Component, ElementRef } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';
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

	private currentStream : MediaStream = null;
	private videoElement: any;
	private currentCaptureState: captureState = captureState.waitForInput;
	private requestImage: boolean = false;
	private cropCoords: any;
	public capturedImage:string;
	private localMediaDevices = [];
	private remoteStream: boolean = false;
	private localDeviceId: string;
	private restartCount: number = 0;
	private maxNbrOfCopies: number = 5;
	private Array: any;
	private arrayCopies: any;
	

	constructor(translate: TranslateService,
				private p2pStreamService : P2pStreamService,
				private el: ElementRef,
				private logger: LogService,
				private cameraService : CameraService) {

		// this language will be used as a fallback when a translation isn't found in the current language
		translate.setDefaultLang('en');

		 // the lang to use, if the lang isn't available, it will use the current loader to get them
		let browserLang = translate.getBrowserLang();
		translate.use('en');
		//translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
		this.arrayCopies =  Array(this.maxNbrOfCopies).fill(0).map(function (x, i) { return i + 1; })
		
		var that = this;
		p2pStreamService.onAddStream = function(stream) {
			if(that.currentStream && that.currentStream.getVideoTracks().length > 0 ) {
				that.currentStream.getVideoTracks()[0].stop();
				that.currentStream = null;
			}
			that.logger.log('stream received. video tracks : ' + stream.getVideoTracks().length);
			if(stream.getVideoTracks().length == 0) {
				that.logger.error('no video track !!!');
			}
			stream.onaddtrack = function () {
				that.logger.log('track added');
			};
			that.currentStream = stream;
			/*that.videoElement.play().then(function () {
				that.logger.log('video playing.');
			}).catch(function (err) {
				that.logger.error('error playing video ! ' + err.message);
			});*/
			that.remoteStream = true;

		};

		p2pStreamService.onRequestImage =  function () {
			that.requestImage = true;
		};

		p2pStreamService.onDisconnect = function () {
			that.currentStream = null;
			that.playLocalStream();
		};

		p2pStreamService.onRequestLocalPlay = function(deviceId) {
			that.localDeviceId = deviceId;
			that.currentStream = null;
			that.playLocalStream();
		};
	}

	enumerateLocalStream() {
		var that = this;
		return new Promise(function(resolve, reject) {
			navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
				for(let device of deviceInfos) {
					if(device.kind == 'videoinput') {
						that.localMediaDevices.push(device);
					}
				}
				if(that.localMediaDevices.length > 0 ) {
					that.localDeviceId = that.localMediaDevices[0].deviceId
					that.p2pStreamService.announceLocalDeviceEnumerate(that.localMediaDevices);
				}

				resolve();
			}).catch(function (error) {
				that.logger.error('navigator.getUserMedia error: ' + JSON.stringify(error));
				reject();
			});
		});
	}

	playLocalStream() {
		var that = this;
		if(!this.currentStream && that.localDeviceId) {
			//should play local device
			this.logger.log('start local stream');
				navigator.mediaDevices.getUserMedia({
				audio: false,
				video: {
					deviceId: that.localDeviceId,
          width: 320,
          height: 240,
          frameRate: 10
				}
			}).then(function (stream) {
				that.logger.log('local stream received');
				that.currentStream = stream;
				that.remoteStream = false;
			});
		} else {
			this.logger.warn('cannot play local device');
		}
	}

	ngOnInit(){
		var componentClass = this;
		this.enumerateLocalStream().then(function () {
			componentClass.playLocalStream();
		});

		var dispCanvasElement = this.el.nativeElement.querySelector('#displayCanvas');
		var imgCanvasElement = this.el.nativeElement.querySelector('#getImgCanvas');
		this.videoElement = this.el.nativeElement.querySelector('video');
		var dispCtx= dispCanvasElement.getContext('2d');
		var imgCtx= imgCanvasElement.getContext('2d');

		this.videoElement.onloadedmetadata = function() {
			componentClass.logger.log('loaded video metadata');
			imgCanvasElement.height = this.videoHeight;
			imgCanvasElement.width = this.videoWidth;

		}

		this.videoElement.onloadeddata = function() {
			componentClass.logger.log('loaded video data');
		};

		this.cameraService.getWebcamCoords().subscribe(
			function success(data) {
				if(data.text()) {
					componentClass.cropCoords = data.json();
					dispCanvasElement.height = componentClass.cropCoords.height;
					dispCanvasElement.width  = componentClass.cropCoords.width;
					componentClass.logger.log('retrieved coords : ' + JSON.stringify(data.json()));
				} else {
					componentClass.logger.warn('empty coords');
					dispCanvasElement.height = 480;
					dispCanvasElement.width = 640;
				}

			},
			function error(data) {
				componentClass.logger.error('cannot get coords : ' + data);
			});


		this.videoElement.addEventListener('play', function () {
				componentClass.logger.log('play');
				componentClass.p2pStreamService.announceStreamPlaying(componentClass.remoteStream);
				var that = this;

				(function loop() {
				  if (!that.paused && !that.ended) {
            if(componentClass.cropCoords) {
              dispCtx.drawImage(that,
                componentClass.cropCoords.x,
                componentClass.cropCoords.y,
                componentClass.cropCoords.width,
                componentClass.cropCoords.height,
                0, 0, dispCanvasElement.width, dispCanvasElement.height);
            } else {
              dispCtx.drawImage(that,0, 0, that.videoWidth, that.videoHeight ,
                0, 0, dispCanvasElement.width, dispCanvasElement.height);
            }

            setTimeout(loop, 1000 / 10); // drawing at 10fps
				  }
				  if(componentClass.requestImage) {
            componentClass.requestImage = false;

            imgCtx.drawImage(that,0, 0, that.videoWidth, that.videoHeight,
                      0, 0, imgCanvasElement.width, imgCanvasElement.height);
            componentClass.p2pStreamService.sendCalibrationImage(imgCanvasElement.toDataURL());
				  }
				})();
			},false);

		this.videoElement.addEventListener('pause', function () {
			componentClass.logger.log('pause');
		}, false);
		this.videoElement.addEventListener('waiting', function () {
			componentClass.logger.log('waiting');
		}, false);
		this.videoElement.addEventListener('emptied', function () {
			componentClass.logger.log('emptied');
		}, false);
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
				that.capturedImage = data.json().src;
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
		this.currentCaptureState = captureState.printChoice;
	}
	
	printPicture(nber:number) {
		this.logger.log('request print of ' + nber + ' copies');
	}
}
