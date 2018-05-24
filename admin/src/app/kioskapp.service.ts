import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LogService } from 'log.service';

@Injectable()
export class KioskAppService {
  private _proxyUrl = '/api/httpproxy';
  private _url: string = null;

  constructor(private http: HttpClient, private logger: LogService) { }
  // note: proxying requests to avoid security errors due to https
  public test(url: string) {
    let result = this.http
      .post(this._proxyUrl, { url : `${url}/version`, verb : 'GET' }, {responseType: 'text'})
      .do((data: any) => {
          if (data.app === 'kioskApp') {
            this._url = url;
          }
        }, (data) => {
        this.logger.warn('error in kioskapp ws: ' + JSON.stringify(data));
      });

    return result;
  }

  public browse(url: string) {
    let result = this.http
      .post(this._proxyUrl, { url : `${this._url}/loadUrl`, verb : 'POST', data: {url: url}});

    return result;
  }

  public reload() {
    let result = this.http
      .post(this._proxyUrl, { url : `${this._url}/reload`, verb : 'POST' });

    return result;
  }

  public exitFs() {
    let result = this.http
      .post(this._proxyUrl, { url : `${this._url}/exit`, verb : 'POST' });

    return result;
  }

  public enterFs() {
    let result = this.http
      .post(this._proxyUrl, { url : `${this._url}/fullscreen`, verb : 'POST' });

    return result;
  }
}
