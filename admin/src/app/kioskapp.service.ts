import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { LogService } from 'log.service';

@Injectable()
export class KioskAppService {
	private _url: string = null;
	private _validKiosk: boolean = false;

	constructor(private http : Http, private logger: LogService) { }
	
	public test(url:string) {
		let that = this;
		let result = this.http
			.get(`${url}/version`)
			.do(function success(data) {
				if(data.json().app === 'kioskApp') {
					that._url = url;
				}
			}, function error(data){});
			
		return result;
			
	}
	
	public browse(url: string) {
		let that = this;
		let result = this.http
			.post(`${this._url}/loadUrl`, {url: url});
			
		return result;
	}
	
	public reload() {
		let that = this;
		let result = this.http
			.post(`${this._url}/reload`, {});
			
		return result;
	}
	
	public exitFs() {
		let that = this;
		let result = this.http
			.post(`${this._url}/exit`, {});
			
		return result;
	}
	
	public enterFs() {
		let that = this;
		let result = this.http
			.post(`${this._url}/fullscreen`, {});
			
		return result;
	}

}
