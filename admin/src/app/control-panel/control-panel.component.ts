import { Component, OnInit, DoCheck } from '@angular/core';
import {TranslateService} from 'ng2-translate';
import {CameraService} from 'camera.service';
import { LogService } from 'log.service';
import { KioskAppService } from '../kioskapp.service';
import { P2pStreamService } from '../p2p-stream.service';
import { ToasterService } from 'angular2-toaster';
import 'rxjs/Rx';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit, DoCheck  {
  private _frontAddress: string = null;

  public cameraReady = false;
  public cameraWSLoading = false;
  public cameraModeWSLoading = false;
  public cameraMessage: string;
  public useFakeCamera = false;
  public kioskAppUrl: string = null;
  public kioskAppWSInfoLoading = false;
  public kioskAppReady = false;
  public kioskAppVersion = '';
  public kioskAppBrowseUrl: string = window.location.origin + '/front';
  public currentLocalDeviceId: number;
  public outputDir = '';
  public outputDirLoading = false;
  public printerInfosLoading = false;
  public printerInfos = '';
  public printerInfosErr = null;
  public canPrint = false;
  public numberOfPrint = 0;
  public numberOfPrintLoading = false;

  constructor(
    translate: TranslateService,
    private cameraService: CameraService,
    public logger: LogService,
    private kioskAppService: KioskAppService,
    public p2pStreamService: P2pStreamService,
    private toasterService: ToasterService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    let browserLang = translate.getBrowserLang();
    translate.use('en');
    // translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  public getCameraStatus() {
    this.cameraWSLoading = true;
    this.cameraReady = false;
    this.cameraMessage = '';

    this.cameraService.getStatus().subscribe(
      (data: any) => {
          this.cameraReady = !data.error;
          this.cameraMessage = data.message;
          this.cameraWSLoading = false;
        },
      (data) => {
          this.cameraReady = false;
          this.cameraMessage = 'Error ' +  data.status + ' : ' + data.statusText;
          this.cameraWSLoading = false;
      });
  }

  public refreshCameraMode() {
    this.cameraModeWSLoading = true;
    this.cameraService.getMode().subscribe(
      (data: any) => {
          this.useFakeCamera = data.fakeCamera;
          this.cameraModeWSLoading = false;
        },
      (data) => {
          this.cameraModeWSLoading = false;
          // TODO: log error
        });
  }

  public refreshOutputDir() {
    this.outputDirLoading = true;
    this.cameraService.getOutputDir().subscribe(
      (data: any) => {
          this.outputDir = data.dir;
          this.outputDirLoading = false;
        },
      (data) => {
          this.outputDirLoading = false;
          this.toasterService.pop('error', 'Error getting output dir', '' + data);
      });
  }

  public refreshPrinterInfos() {
    this.printerInfosLoading = true;
    this.cameraService.getPrinterInfos().subscribe(
      (data: string) => {
          this.printerInfos = data;
          this.printerInfosErr  = null;
          this.printerInfosLoading = false;
        },
      (data: string) => {
          this.printerInfosLoading = false;
          this.printerInfosErr = data;
      });
  }

  public refreshNumberOfPrint() {
    this.numberOfPrintLoading = true;
    this.cameraService.printCapacity().subscribe(
      (data: string) => {
          this.numberOfPrint = parseInt(data, 10);
          this.numberOfPrintLoading = false;
        },
      (data: string) => {
          this.toasterService.pop('error', 'Error getting print capacity', '' + data);
          this.numberOfPrintLoading = false;
      });
  }

  public saveNumberOfPrint() {
    this.numberOfPrintLoading = true;
    this.cameraService.setPrintCapacity(this.numberOfPrint).subscribe(
      () => {
          this.toasterService.pop('success', 'print', 'print capacity set to ' + this.numberOfPrint);
          this.refreshNumberOfPrint();
        }, (data: string) => {
          this.toasterService.pop('error', 'print', 'error setting print capacity' + data);
      });
  }

  updateOutputDir() {
    this.outputDirLoading = true;
    this.cameraService.setOutputDir(this.outputDir).subscribe(
      () => {
          this.toasterService.pop('success', 'Output dir', 'updated successfully');
          this.outputDirLoading = false;
          this.refreshOutputDir();
        },
      (data: any) => {
          this.outputDirLoading = false;
          this.toasterService.pop('error', 'Error setting output dir', '' + data.error);
          this.refreshOutputDir();
      });
  }

  public setCameraMode(mode: boolean) {
    this.cameraModeWSLoading = true;
    this.cameraService.setMode(mode).subscribe(
      () => {
        this.refreshCameraMode();
        this.getCameraStatus();
      });
  }

  public setCanPrint(canPrint: boolean) {
    this.cameraService.setCanPrint(canPrint).subscribe(
      () => {
        if (canPrint) {
          this.toasterService.pop('success', 'print', 'print enabled');
        } else {
          this.toasterService.pop('success', 'print', 'print disabled');
        }

        this.refeshCanPrint();
      });
  }

  public refeshCanPrint() {
    this.cameraService.canPrint().subscribe(
      (data: string) => {
        this.canPrint = (data === 'true');
        },
      () => {
        this.canPrint = false;
      });
  }

  public refreshKioskApp() {
    if (this.kioskAppUrl) {
      this.logger.log('refresh kiosk app infos');

      this.kioskAppUrl = this.kioskAppUrl.replace('http://', '').trim();
      this.kioskAppWSInfoLoading = true;
      this.kioskAppService.test('http://' + this.kioskAppUrl).subscribe(
        (data: string) => {
            this.kioskAppWSInfoLoading = false;
            let kioskObj;
            try {
              kioskObj = JSON.parse(data);
            } catch (e) {
              kioskObj = { app : '', version: ''}
            }
            if (kioskObj.app === 'kioskApp') {
              this.kioskAppReady = true;
              this.kioskAppVersion = kioskObj.version;
            } else {
              this.logger.warn('kiosk url wrong response : ' + data);
              this.toasterService.pop('warning', 'kiosk url wrong response', data);
              this.kioskAppReady = false;
            }
          },
        (data: any) => {
            this.kioskAppWSInfoLoading = false;
            this.kioskAppReady = false;
            this.toasterService.pop('error', 'error getting kioskApp ', data.message);
            this.logger.warn('error getting kioskApp ' + data.message );
        });
    }
  }

  public browseUrl() {
    this.logger.log('request browse url ' + this.kioskAppBrowseUrl);
    this.kioskAppService.browse(this.kioskAppBrowseUrl).subscribe(
      () => {
        this.logger.log('browse success');
        }, () => {
        this.logger.error('browse error');
        this.toasterService.pop('error', 'kiosk app', 'browse error');
      });
  }

  public reloadUrl() {
    this.logger.log('request reload');
    this.kioskAppService.reload().subscribe(
      () => {
          this.logger.log('reload url success');
        }, () => {
          this.logger.error('reload url error');
          this.toasterService.pop('error', 'kiosk app', 'reload error');
      });
  }

  public exitFs() {
    this.logger.log('request reload');
    this.kioskAppService.exitFs().subscribe(
      () => {
        this.logger.log('exit fullscreen success');
        }, () => {
        this.logger.error('exit fullscreen error');
        this.toasterService.pop('error', 'kiosk app', 'exit fullscreen error');
      });
  }

  public enterFs() {
    this.logger.log('request reload');
    this.kioskAppService.enterFs().subscribe(
      () => {
          this.logger.log('enter fullscreen success');
        }, () => {
          this.logger.error('enter fullscreen error');
          this.toasterService.pop('error', 'kiosk app', 'enter fullscreen error');
      });
  }

  public ngOnInit() {
    this.refreshCameraMode();
    this.getCameraStatus();
    this.refreshOutputDir();
    this.refreshPrinterInfos();
    this.refeshCanPrint();
    this.refreshNumberOfPrint();
  }

  public ngDoCheck() {
    if (this.logger.frontEndAddress !== this._frontAddress && !this.kioskAppUrl) {
      this._frontAddress = this.logger.frontEndAddress;
      this.kioskAppUrl = this.logger.frontEndAddress ? this.logger.frontEndAddress + ':1664' : '';
      if  (this.kioskAppUrl) {
        this.refreshKioskApp();
      }
    }
  }
}
