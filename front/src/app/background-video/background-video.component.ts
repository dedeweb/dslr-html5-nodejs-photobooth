import { Component, OnInit, ElementRef, Input } from '@angular/core';
import {P2pStreamService} from '../p2p-stream.service';
import {CameraService} from 'camera.service';
import { LogService } from 'log.service';

@Component({
	selector: 'background-video',
	templateUrl: './background-video.component.html',
	styleUrls: ['./background-video.component.scss']
})

export class BackgroundVideoComponent implements OnInit {


	@Input() blurred: boolean;

	private currentStream : MediaStream = null;
	private videoElement: any;
	private requestImage: boolean = false;
	private cropCoords: any;
	private currentCrop : any = null;
	private localMediaDevices = [];
	private remoteStream: boolean = false;
	private localDeviceId: string;

	constructor(private p2pStreamService : P2pStreamService,
				private el: ElementRef,
				private logger: LogService,
				private cameraService : CameraService) {

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
				that.logger.debug('track added');
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

	ngOnInit() {
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
			componentClass.logger.debug('loaded video metadata');
			imgCanvasElement.height = this.videoHeight;
			imgCanvasElement.width = this.videoWidth;
		}

		this.videoElement.onloadeddata = function() {
			componentClass.logger.debug('loaded video data');
		};

		this.cameraService.getWebcamCoords().subscribe(
			function success(data) {
				if(data.text()) {
					componentClass.cropCoords = data.json();
					//dispCanvasElement.height = componentClass.cropCoords.height;
					//dispCanvasElement.width  = componentClass.cropCoords.width;
					componentClass.logger.debug('retrieved coords : ' + JSON.stringify(data.json()));
				} else {
					componentClass.logger.warn('empty coords');
					//dispCanvasElement.height = 480;
					//dispCanvasElement.width = 640;
				}

			},
			function error(data) {
				componentClass.logger.error('cannot get coords : ' + data);
			});



		this.videoElement.addEventListener('play', function () {
				componentClass.logger.log('video is playing ' + ( componentClass.remoteStream ? 'in remote mode' : 'in local mode'));
				componentClass.p2pStreamService.announceStreamPlaying(componentClass.remoteStream);
				var that = this;

				(function loop() {
					if (!that.paused && !that.ended) {

						if( dispCanvasElement.height !== that.videoHeight || dispCanvasElement.width !== that.videoWidth) {
							componentClass.logger.log('quality change : ' + dispCanvasElement.width + 'x' + dispCanvasElement.height + ' -> ' + that.videoWidth + 'x' + that.videoHeight);
							dispCanvasElement.height = that.videoHeight;
							dispCanvasElement.width = that.videoWidth;
						}

						if(componentClass.cropCoords) {
							componentClass.manageCrop(
								componentClass.cropCoords.x,// * that.videoWidth,
								componentClass.cropCoords.y, //* that.videoHeight,
								componentClass.cropCoords.width, //* that.videoWidth,
								componentClass.cropCoords.height, //* that.videoHeight,
								0, 0, dispCanvasElement.width, dispCanvasElement.height, that.videoWidth, that.videoHeight);
						} else {
							componentClass.manageCrop(
								0, 0, 1, 1,
								0, 0, dispCanvasElement.width, dispCanvasElement.height, that.videoWidth, that.videoHeight);
						}



						dispCtx.drawImage(that,
							componentClass.currentCrop.clipX,
							componentClass.currentCrop.clipY,
							componentClass.currentCrop.clipWidth,
							componentClass.currentCrop.clipHeight,
							componentClass.currentCrop.x,
							componentClass.currentCrop.y,
							componentClass.currentCrop.width,
							componentClass.currentCrop.height);


						setTimeout(loop, 1000 / 20); // drawing at 10fps
					}
					if(componentClass.requestImage) {
						componentClass.requestImage = false;

						imgCtx.drawImage(that,0, 0, that.videoWidth, that.videoHeight,
								  0, 0, imgCanvasElement.width, imgCanvasElement.height);
						componentClass.p2pStreamService.sendCalibrationImage(imgCanvasElement.toDataURL());
					}
				})();
			},false);
	}

	private manageCrop(clipXRatio, clipYRatio, clipWidthRatio, clipHeightRatio, x, y, width, height, videoWidth, videoHeight) {
		let logMsg:string = '';
		let changeCrop = false;
		if(!this.currentCrop) {
			logMsg += 'previous crop null. ';
			this.currentCrop = {};
			changeCrop = true;
		}else if( this.currentCrop.clipXRatio !== clipXRatio ||
			this.currentCrop.clipYRatio !== clipYRatio ||
			this.currentCrop.clipWidthRatio !== clipWidthRatio ||
			this.currentCrop.clipHeightRatio !== clipHeightRatio ||
			this.currentCrop.x !== x ||
			this.currentCrop.y !== y ||
			this.currentCrop.width !== width ||
			this.currentCrop.height !== height ) {

			changeCrop = true;
			logMsg += 'crop change ! previous : ' + this.currentCropToString();
		}
		if(changeCrop) {
			this.currentCrop.clipX = Math.floor(clipXRatio * videoWidth);
			this.currentCrop.clipY = Math.floor(clipYRatio * videoHeight);
			this.currentCrop.clipWidth = Math.floor(clipWidthRatio * videoWidth);
			this.currentCrop.clipHeight = Math.floor(clipHeightRatio * videoHeight);
      this.currentCrop.clipXRatio = clipXRatio ;
      this.currentCrop.clipYRatio = clipYRatio;
      this.currentCrop.clipWidthRatio = clipWidthRatio;
      this.currentCrop.clipHeightRatio = clipHeightRatio ;
			this.currentCrop.x = x;
			this.currentCrop.y = y;
			this.currentCrop.width = width;
			this.currentCrop.height = height;
			logMsg+= ' new crop : ' + this.currentCropToString();

			this.logger.debug(logMsg);

		}
	}

	private currentCropToString():string {
		return '['
				+ this.currentCrop.clipX  + ', '
				+ this.currentCrop.clipY  + ', '
				+ this.currentCrop.clipWidth  + ', '
				+ this.currentCrop.clipHeight
				+ ']'
				+ '['
				+ this.currentCrop.x  + ', '
				+ this.currentCrop.y  + ', '
				+ this.currentCrop.width  + ', '
				+ this.currentCrop.height
				+ ']'
	}

	private enumerateLocalStream() {
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

	private playLocalStream() {
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
					frameRate:  { ideal: 10, max: 25 }
				}
			}).then(function (stream) {
				that.logger.debug('local stream received');
				that.currentStream = stream;
				that.remoteStream = false;
			});
		} else {
			this.logger.warn('cannot play local device');
		}
	}

}
