import { Component, ElementRef, OnInit } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {P2pStreamService} from './p2p-stream.service';
import { LogService } from 'log.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private currentMedia = '';
  private currentQuality = '1';
  private currentFramerate = '10';
  private mediaDevices: MediaDeviceInfo[] = [];
  private currentStream: MediaStream = null;
  private videoElement: HTMLVideoElement;
  private remoteStream: MediaStream = null;
  private clientConnected = false;

  private videoQuality: any[] = [
    { val: 1, label: 'QVGA (320x240)' },
    { val: 2, label: 'VGA (640x480)' },
    { val: 3, label: 'XGA (1024x768)'	},
    { val: 4, label: 'UXGA (1600x1200)' }
    ];

  private videoFramerate: any[] = [
    { val: 10, label: '10 fps' },
    { val: 15, label: '15 fps' },
    { val: 20, label: '20 fps' },
    { val: 25, label: '25 fps' },
    { val: 35, label: '35 fps' }
  ];

  constructor(
    translate: TranslateService,
    private el: ElementRef,
    private p2pStreamService: P2pStreamService,
    private logger: LogService) {
      // this language will be used as a fallback when a translation isn't found in the current language
      translate.setDefaultLang('en');

      // the lang to use, if the lang isn't available, it will use the current loader to get them
      // let browserLang = translate.getBrowserLang();
      translate.use('en');
      // translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
      p2pStreamService.onClientStatusChange = (connected: boolean) => {
        this.clientConnected = connected;
      };
  }

  ngOnInit() {
    this.videoElement = this.el.nativeElement.querySelector('video');
    this.refreshDevices();
  }

  refreshDevices () {
    navigator.mediaDevices.enumerateDevices().then((deviceInfos: MediaDeviceInfo[]) => {
      this.mediaDevices = deviceInfos.filter(d => d.kind === 'videoinput' );
    }).catch( (error) => {
      this.logger.error('navigator.getUserMedia error: ' + JSON.stringify(error));
    });
  }

  private getQualityWidth(): number {
    switch (this.currentQuality) {
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

  private getQualityHeight(): number {
    switch (this.currentQuality) {
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

  private getFramerate(): number {
    return parseInt(this.currentFramerate);
  }

  public startStream(): void {
    if (this.currentMedia) {
      let videoWidth = this.getQualityWidth(), videoHeight = this.getQualityHeight(), videoFps = this.getFramerate();
      this.logger.log('start stream. quality : ' + videoWidth + 'x' +videoHeight + '@' + videoFps + 'fps' );
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: this.currentMedia,
          width: videoWidth,
          height: videoHeight,
          frameRate: { ideal: videoFps, max: videoFps }
        }
      }).then((stream) => {
        this.currentStream = stream;
        // Refresh button list in case labels have become available
        this.refreshDevices();
        this.p2pStreamService.cameraReady(true, stream);
      });
    } else {
      this.p2pStreamService.cameraReady(false, null);
    }
  }
}
