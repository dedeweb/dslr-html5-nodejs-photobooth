import { Component, OnInit, ElementRef } from '@angular/core';
import {CameraService} from 'camera.service';
import { LogService } from 'log.service';
import {TranslateService} from 'ng2-translate';
declare var Cropper : any;

@Component({
	selector: 'app-calibrate-webcam',
	templateUrl: './calibrate-webcam.component.html',
	styleUrls: ['./calibrate-webcam.component.scss']
})
export class CalibrateWebcamComponent implements OnInit {
	public webcamImgSrc : string = "";
	public cameraImgSrc : string = "";
	private cropper: any;
	private webcamCoords: any;
	public loading: boolean = false;
	public errorMsg: string = "";
	public infoMsg: string = "";
	
	constructor(
		private cameraService : CameraService,
		private el: ElementRef,
		private logger: LogService,
		public translate: TranslateService) {
		var that = this;
		cameraService.onWebcamImageReceived = function (image) {
			that.webcamImgSrc = image;
			if(that.loading && that.cameraImgSrc) {
				that.loading = false;
			}
		};
		
		cameraService.onCameraImageReceived = function (image) {
			that.cameraImgSrc = image;
			if(that.loading && that.webcamImgSrc) {
				that.loading = false;
			}
		};
		that.loading = true;
		that.errorMsg  = '';
		cameraService.getWebcamCoords().subscribe(
			function success(data) {
			  if(data.text()) {
				  logger.log('retrieved coords : ' + JSON.stringify(data.json()));
				  that.webcamCoords = data.json();
				} else {
				  logger.log('coords null');
				}
				that.loading = false;
			},
			function error(data) {
				logger.error('cannot get coords : ' + data);
				that.loading = false;
				translate.get('webcam_coords_error').subscribe(function (res :string)  {
					that.errorMsg = res + " : " +data;
				});
				
			}
		);
	}
	
	ngOnInit() {
	}
	
	public storeCoords() {
		var that = this;
		this.webcamCoords = this.cropper.getData();
		this.logger.log('store coords : ' + JSON.stringify(this.webcamCoords));
		this.loading = true;
		this.errorMsg = '';
		this.infoMsg = '';
		that.cameraService.setWebcamCoords(this.webcamCoords).subscribe(
			function success() {
				that.logger.log('coords successfully stored ! ');
				that.translate.get('webcam_coords_store_ok').subscribe(function (res :string)  {
					that.infoMsg = res;
				});
				that.loading = false;
			}, function error(data) {
				that.loading = false;
				that.logger.error('error storing coords ! ' + data);
				that.translate.get('webcam_coords_save_error').subscribe(function (res :string)  {
					that.errorMsg = res + " : " +data;
				});
			});
	}
	
	public initCropper() {
		this.logger.log('launching cropper');
		var image = this.el.nativeElement.querySelector('#imageCropper img');
		if(this.cropper) {
			this.cropper.destroy();
		}
		this.cropper = new Cropper(image, {
		  aspectRatio: 3 / 2,
		  preview: '#croppedWebcamPreview',
		  zoomable: false,
		  viewMode: 1,
		  data: this.webcamCoords
		});
	}
	
	public onResize(event) {
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
