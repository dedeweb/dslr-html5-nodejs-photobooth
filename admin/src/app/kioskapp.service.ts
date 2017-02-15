import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { LogService } from 'log.service';

@Injectable()
export class KioskAppService {
	private _proxyUrl: string = '/api/httpproxy';
	private _url: string = null;
	private _validKiosk: boolean = false;

	constructor(private http : Http, private logger: LogService) { }
	//note: proxying requests to avoit security errors due to https
	public test(url:string) {
		let that = this;
		let result = this.http
			.post(this._proxyUrl, { url : `${url}/version`, verb : 'GET' })
			.do(function success(data) {
				if(data.json().app === 'kioskApp') {
					that._url = url;
				}
			}, function error(data){
				that.logger.warn('error in kioskapp ws: ' + JSON.stringify(data));
			});
			
		return result;
			
	}
	
	public browse(url: string) {
		let that = this;
		let result = this.http
			.post(this._proxyUrl, { url : `${this._url}/loadUrl`, verb : 'POST', data: {url: url}});
			
		return result;
	}
	
	public reload() {
		let that = this;
		let result = this.http
			.post(this._proxyUrl, { url : `${this._url}/reload`, verb : 'POST' });
			
		return result;
	}
	
	public exitFs() {
		let that = this;
		let result = this.http
			.post(this._proxyUrl, { url : `${this._url}/exit`, verb : 'POST' });
			
		return result;
	}
	
	public enterFs() {
		let that = this;
		let result = this.http
			.post(this._proxyUrl, { url : `${this._url}/fullscreen`, verb : 'POST' });
			
		return result;
	}

}
