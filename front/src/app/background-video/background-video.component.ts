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
	//private requestImage: boolean = false;
	private cropCoords: any;
	private currentCrop : any = { };
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


		p2pStreamService.onDisconnect = function () {
			that.currentStream = null;
			that.playLocalStream();
		};

		p2pStreamService.onRequestLocalPlay = function(deviceId) {
			that.localDeviceId = deviceId;
			that.currentStream = null;
			that.playLocalStream();
		};

    cameraService.getWebcamCoords().subscribe(
      function success(data) {
        if(data.text()) {
          that.cropCoords = data.json();
          that.cropVideo();
          that.logger.debug('retrieved coords : ' + JSON.stringify(data.json()));
        } else {
          that.logger.warn('empty coords');
        }

      },
      function error(data) {
        that.logger.error('cannot get coords : ' + data);
      });

	}

	ngOnInit() {
		var componentClass = this;
		this.enumerateLocalStream().then(function () {
			componentClass.playLocalStream();
		});

		var imgCanvasElement = this.el.nativeElement.querySelector('#getImgCanvas');
    var imgCtx= imgCanvasElement.getContext('2d');

    this.videoElement = this.el.nativeElement.querySelector('video');


		this.videoElement.onloadedmetadata = function() {
			componentClass.logger.debug('loaded video metadata');
			imgCanvasElement.height = this.videoHeight;
			imgCanvasElement.width = this.videoWidth;
		}

		this.videoElement.onloadeddata = function() {
			componentClass.logger.debug('loaded video data');
		};

    this.p2pStreamService.onRequestImage =  function () {
      imgCtx.drawImage(componentClass.videoElement,0, 0, componentClass.videoElement.videoWidth, componentClass.videoElement.videoHeight,
        0, 0, imgCanvasElement.width, imgCanvasElement.height);
      componentClass.p2pStreamService.sendCalibrationImage(imgCanvasElement.toDataURL());
    };
	}

  public onResize(event) {
    this.logger.log('window resize');
    this.cropVideo();
  }

  private cropVideo() {

    if(this.cropCoords) {

      var width, height, gapWidth, gapHeight;

      if(window.innerWidth / window.innerHeight > 1.5) {
        //screen wider than picture : image will be cropped on top and bottom
        width = window.innerWidth;
        height = Math.floor(window.innerWidth / 1.5);
        gapWidth = 0;
        gapHeight = Math.floor((height - window.innerHeight)/2);
      } else {
        //screen less wide than picture : image will be cropped on left and right
        height = window.innerHeight;
        width = window.innerHeight * 1.5;
        gapHeight = 0;
        gapWidth = Math.floor((width - window.innerWidth)/2);
      }

      var totalWidth = Math.floor(width / this.cropCoords.width);
      var totalHeight = Math.floor(height / this.cropCoords.height);



      this.logger.debug('crop : total : ' + totalWidth + 'x' + totalHeight +  'gap: ' +gapWidth + 'x' + gapHeight );

      this.currentCrop.top =  -(totalHeight * this.cropCoords.y + gapHeight) + 'px';
      this.currentCrop.bottom = -(totalHeight * (1 - (this.cropCoords.height + this.cropCoords.y)) + gapHeight) + 'px';
      this.currentCrop.left = -(totalWidth * this.cropCoords.x + gapWidth) + 'px';
      this.currentCrop.right  = -(totalWidth * (1 - (this.cropCoords.x + this.cropCoords.width)) + gapWidth) + 'px';
      this.currentCrop.width = totalWidth + 'px';
      this.currentCrop.height = totalHeight + 'px';
      //this.currentCrop.wrapperHeight =
    }

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
					that.localDeviceId = that.localMediaDevices[0].deviceId;
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
