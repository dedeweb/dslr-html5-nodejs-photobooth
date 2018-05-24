import { Component } from '@angular/core';
import {TranslateService} from 'ng2-translate';
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

  public captureState = captureState; // export enum type
  public currentCaptureState: captureState = captureState.waitForInput;

  private capturedImage: string;
  private capturedPrintableImage: string;
  private imageId: string;

  private restartCount = 0;

  constructor(
    translate: TranslateService,
    private logger: LogService,
    private cameraService: CameraService) {

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    let browserLang = translate.getBrowserLang();
    // translate.use('en');
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  public launchCountDown(): void {
    this.currentCaptureState = captureState.countDown;
  }

  public waitCapture(): void {
    if (this.currentCaptureState !== captureState.displayError) {
      this.currentCaptureState = captureState.waitForImage;
    }
  }

  public capturePicture(): void {
    this.cameraService.captureImage().subscribe(
      (data: any) => {
        this.logger.log('image received');
        this.capturedImage = data.src;
        this.capturedPrintableImage = data.src;
        this.imageId = data.id;
        this.currentCaptureState = captureState.displayPicture;
        },
      (data) => {
        this.logger.error('error capturing picture : \n' + data.message);
        this.currentCaptureState = captureState.displayError;
      });
  }

  public reloadPage(): void {
    location.reload();
  }

  public restart(): void {
    this.restartCount ++;
    this.currentCaptureState =  captureState.waitForInput;
    if (this.restartCount > 5) {
      // reload entire page each 5  restart, for stability
      this.reloadPage();
    }
  }

  public displayPrintChoice (): void {
    this.currentCaptureState = captureState.printChoice;

    this.cameraService.getPrintPreview(this.imageId).subscribe(
      (data: string) => {
        this.logger.log('print preview received');
        this.capturedPrintableImage = data;
        },
      (data: string) => {
        this.logger.error('error getting print preview: \n' + data);
      });
  }

  public printPicture(nber: number ): void {
    this.logger.log('request print of ' + nber + ' copies');
    this.cameraService.printImage(this.imageId, nber).subscribe(
      () => {
          this.logger.log('print succeeded');
          setTimeout(() => { this.restart(); }, 1000);
        },
      (data: any) => {
        this.logger.error('print failed: \n' + data.message);
        setTimeout(function () { this.restart(); }, 1000);
      });
  }
}
