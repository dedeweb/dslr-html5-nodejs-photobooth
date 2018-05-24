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

  private currentStream: MediaStream = null;
  private videoElement: any;
  private cropCoords: any;
  private currentCrop: any = { };
  private localMediaDevices = [];
  private remoteStream = false;
  private localDeviceId: string;

  constructor(
    private p2pStreamService: P2pStreamService,
    private el: ElementRef,
    private logger: LogService,
    private cameraService: CameraService) {
      p2pStreamService.onAddStream = (stream) => {
        if (this.currentStream && this.currentStream.getVideoTracks().length > 0 ) {
          this.currentStream.getVideoTracks()[0].stop();
          this.currentStream = null;
        }

        this.logger.log('stream received. video tracks : ' + stream.getVideoTracks().length);
        if (stream.getVideoTracks().length === 0) {
          this.logger.error('no video track !!!');
        }
        stream.onaddtrack = () => {
          this.logger.debug('track added');
        };
        this.currentStream = stream;
        this.remoteStream = true;
      };

      p2pStreamService.onDisconnect = () => {
        this.currentStream = null;
        this.playLocalStream();
      };

      p2pStreamService.onRequestLocalPlay = (deviceId) => {
        this.localDeviceId = deviceId;
        this.currentStream = null;
        this.playLocalStream();
      };

      cameraService.getWebcamCoords().subscribe(
        (data: any) => {
        if (data) {
          this.cropCoords = data;
          this.cropVideo();
          this.logger.debug('retrieved coords : ' + JSON.stringify(data));
        } else {
          this.logger.warn('empty coords');
        }
      },
      (data: any) => {
        this.logger.error('cannot get coords : ' + data);
      });
  }

  ngOnInit() {
    this.enumerateLocalStream().then(() => {
      this.playLocalStream();
    });

    let imgCanvasElement = this.el.nativeElement.querySelector('#getImgCanvas');
    let imgCtx = imgCanvasElement.getContext('2d');

    this.videoElement = this.el.nativeElement.querySelector('video');

    let componentClass = this;
    this.videoElement.onloadedmetadata = function() {
      componentClass.logger.debug('loaded video metadata');
      imgCanvasElement.height = this.videoHeight;
      imgCanvasElement.width = this.videoWidth;
    };

    this.videoElement.onloadeddata = () => {
      this.logger.debug('loaded video data');
    };

    this.p2pStreamService.onRequestImage =  () => {
      imgCtx.drawImage(this.videoElement, 0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight,
        0, 0, imgCanvasElement.width, imgCanvasElement.height);
      this.p2pStreamService.sendCalibrationImage(imgCanvasElement.toDataURL());
    };
  }

  public onResize() {
    this.logger.log('window resize');
    this.cropVideo();
  }

  private cropVideo() {

    if (this.cropCoords) {

      let width, height, gapWidth, gapHeight;

      if (window.innerWidth / window.innerHeight > 1.5) {
        // screen wider than picture : image will be cropped on top and bottom
        width = window.innerWidth;
        height = Math.floor(window.innerWidth / 1.5);
        gapWidth = 0;
        gapHeight = Math.floor((height - window.innerHeight) / 2);
      } else {
        // screen less wide than picture : image will be cropped on left and right
        height = window.innerHeight;
        width = window.innerHeight * 1.5;
        gapHeight = 0;
        gapWidth = Math.floor((width - window.innerWidth) / 2);
      }

      let totalWidth = Math.floor(width / this.cropCoords.width);
      let totalHeight = Math.floor(height / this.cropCoords.height);



      this.logger.debug('crop : total : ' + totalWidth + 'x' + totalHeight +  'gap: ' + gapWidth + 'x' + gapHeight );

      this.currentCrop.top =  -(totalHeight * this.cropCoords.y + gapHeight) + 'px';
      this.currentCrop.bottom = -(totalHeight * (1 - (this.cropCoords.height + this.cropCoords.y)) + gapHeight) + 'px';
      this.currentCrop.left = -(totalWidth * this.cropCoords.x + gapWidth) + 'px';
      this.currentCrop.right  = -(totalWidth * (1 - (this.cropCoords.x + this.cropCoords.width)) + gapWidth) + 'px';
      this.currentCrop.width = totalWidth + 'px';
      this.currentCrop.height = totalHeight + 'px';
    }

  }

  private enumerateLocalStream(): Promise<void> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.enumerateDevices().then( (deviceInfos) => {
        for (let device of deviceInfos) {
          if (device.kind === 'videoinput') {
            this.localMediaDevices.push(device);
          }
        }
        if (this.localMediaDevices.length > 0 ) {
          this.localDeviceId = this.localMediaDevices[0].deviceId;
          this.p2pStreamService.announceLocalDeviceEnumerate(this.localMediaDevices);
        }
        resolve();
      }).catch( (error) => {
        this.logger.error('navigator.getUserMedia error: ' + JSON.stringify(error));
        reject();
      });
    });
  }

  private playLocalStream(): void {
    if (!this.currentStream && this.localDeviceId) {
      // should play local device
      this.logger.log('start local stream');
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: this.localDeviceId,
          width: 320,
          height: 240,
          frameRate:  { ideal: 10, max: 25 }
        }
      }).then((stream) => {
        this.logger.debug('local stream received');
        this.currentStream = stream;
        this.remoteStream = false;
      });
    } else {
      this.logger.warn('cannot play local device');
    }
  }
}
