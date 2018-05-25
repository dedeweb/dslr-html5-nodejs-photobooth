import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { LogService } from 'log.service';
declare var io: any;


@Injectable()
export class CameraService {
  private baseUrl = '/api';
  private socket: any;
  public onWebcamImageReceived: (image: any) => void;
  public onCameraImageReceived: (image: any) => void;

  constructor(private http: HttpClient, private logger: LogService) {
    this.socket = io( {path: '/api/socket'});


    this.socket.on('webcam-image', (data) => {
      logger.log('webcam-image received');
      if (this.onWebcamImageReceived) {
        this.onWebcamImageReceived(data);
      }
    });
    this.socket.on('camera-image', (data) => {
      logger.log('camera-image received');
      if (this.onCameraImageReceived) {
        this.onCameraImageReceived(data);
      }
    });
  }

  public getStatus() {
    let result = this.http
      .get(`${this.baseUrl}/cameraStatus`);

    return result;
  };

  public getWebcamCoords() {
    let result = this.http
      .get(`${this.baseUrl}/webcamCrop`);
    return result;
  }

  public setWebcamCoords(coords: any) {
    let result = this.http
      .post(`${this.baseUrl}/webcamCrop`, coords);

    return result;
  };

  public getMode() {
    let result = this.http
      .get(`${this.baseUrl}/cameraMode`);

    return result;
  };

  public requestImages() {
    this.socket.emit('request-calibration-images');
    this.logger.log('Request calibration sent');
  };

  public captureImage() {
    let result = this.http
      .get(`${this.baseUrl}/captureImage`);

    return result;
  }

  public getPrintPreview(imgId: string) {
    let result = this.http
      .get(`${this.baseUrl}/printPreview/${imgId}`, {responseType: 'text'});
    return result;
  }

  public printImage(imgId: string, copies: number) {
    let result = this.http
      .post(`${this.baseUrl}/print/${imgId}`, {copies: copies});

    return result;
  }

  public setMode(mode: boolean) {
    let result = this.http
      .post(`${this.baseUrl}/cameraMode`, {fakeCamera: mode});

    return result;
  };

  public getOutputDir() {
    let result = this.http
      .get(`${this.baseUrl}/outputDir`);

    return result;
  };

  public setOutputDir(dir: string) {
    let result = this.http
      .post(`${this.baseUrl}/outputDir`, {dir: dir}, {responseType: 'text'});

    return result;
  };

  public getPrinterInfos() {
    let result = this.http
      .get(`${this.baseUrl}/printerInfos`, {responseType: 'text'});

    return result;
  };

  public setCanPrint(canPrint: boolean) {
    let result = this.http
      .post(`${this.baseUrl}/canPrint`, canPrint);

    return result;
  };

  public canPrint() {
    let result = this.http
      .get(`${this.baseUrl}/canPrint`, {responseType: 'text'});

    return result;
  };

  public printCapacity() {
    let result = this.http
      .get(`${this.baseUrl}/printCapacity`);

    return result;
  };

  public setPrintCapacity(capacity: number) {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    let result = this.http
      .post(`${this.baseUrl}/printCapacity`, capacity, {responseType: 'text', headers: headers});

    return result;
  };

}
