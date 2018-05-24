import { Component, ElementRef } from '@angular/core';
import { CameraService } from 'camera.service';
import { LogService } from 'log.service';
import { TranslateService } from 'ng2-translate';
declare var Cropper: any;

@Component({
  selector: 'app-calibrate-webcam',
  templateUrl: './calibrate-webcam.component.html',
  styleUrls: ['./calibrate-webcam.component.scss']
})
export class CalibrateWebcamComponent {
  public webcamImgSrc = '';
  public cameraImgSrc = '';
  public cropper: any;
  private webcamCoords: any = null;
  public loading = false;
  public errorMsg = '';
  public infoMsg = '';

  constructor(
    private cameraService: CameraService,
    private el: ElementRef,
    private logger: LogService,
    public translate: TranslateService) {

    cameraService.onWebcamImageReceived = (image) => {
      this.webcamImgSrc = image;
      if (this.loading && this.cameraImgSrc) {
        this.loading = false;
      }
    };

    cameraService.onCameraImageReceived = (image) => {
      this.cameraImgSrc = image;
      if (this.loading && this.webcamImgSrc) {
        this.loading = false;
      }
    };

    this.loading = true;
    this.errorMsg  = '';
    cameraService.getWebcamCoords().subscribe(
      (data) => {
        if (data) {
          logger.log('retrieved coords : ' + JSON.stringify(data));
          this.webcamCoords = data;
          this.bindCropperData();
        } else {
          logger.log('coords null');
        }
        this.loading = false;
        },
      (data) => {
        logger.error('cannot get coords : ' + data);
        this.loading = false;
        translate.get('webcam_coords_error').subscribe( (res: string) =>  {
          this.errorMsg = res + ' : ' + data;
        });
      });
  }

  public storeCoords() {
    let cropperData = this.cropper.getData(),
      imageData = this.cropper.getImageData();
    this.webcamCoords = {
      x: cropperData.x / imageData.naturalWidth,
      y: cropperData.y / imageData.naturalHeight,
      width: cropperData.width / imageData.naturalWidth,
      height: cropperData.height / imageData.naturalHeight
    };

    this.logger.log('store coords : ' + JSON.stringify(this.webcamCoords));
    this.loading = true;
    this.errorMsg = '';
    this.infoMsg = '';

    this.cameraService.setWebcamCoords(this.webcamCoords).subscribe(
      () => {
        this.logger.log('coords successfully stored ! ');
        this.translate.get('webcam_coords_store_ok').subscribe( (res: string) =>  {
          this.infoMsg = res;
        });
        this.loading = false;
        }, (data) => {
        this.loading = false;
        this.logger.error('error storing coords ! ' + data);
        this.translate.get('webcam_coords_save_error').subscribe((res: string) =>  {
          this.errorMsg = res + ' : ' + data;
        });
      });
  }

  private bindCropperData() {
    if (this.cropper && this.webcamCoords) {
      let imageData =  this.cropper.getImageData();
      this.cropper.setData({
        x: imageData.naturalWidth * this.webcamCoords.x,
        y: imageData.naturalHeight * this.webcamCoords.y,
        width: imageData.naturalWidth * this.webcamCoords.width,
        height: imageData.naturalHeight * this.webcamCoords.height,
        rotate: 0,
        scaleX: 1,
        scaleY: 1
      });
    }
  }

  public initCropper() {
    this.logger.log('launching cropper');
    let image = this.el.nativeElement.querySelector('#imageCropper img');

    if (this.cropper) {
      this.cropper.destroy();
    }
    this.cropper = new Cropper(image, {
      aspectRatio: 3 / 2,
      preview: '#croppedWebcamPreview',
      zoomable: false,
      viewMode: 1
    });
    this.bindCropperData();
  }

  public onResize() {
    this.logger.log('window resize');
    this.initCropper();
  }

  public  requestCalibration() {
    this.loading = true;
    this.infoMsg = '';
    this.errorMsg = '';
    this.cameraService.requestImages();
  }

}
