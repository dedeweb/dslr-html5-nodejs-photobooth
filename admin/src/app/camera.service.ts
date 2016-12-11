import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class CameraService {
	private baseUrl: string = 'http://192.168.0.6:4202/api';
	constructor(private http : Http) { }
	
	public GetStatus() {
		let result = this.http
			.get(`${this.baseUrl}/cameraStatus`)
			.map(function (res:Response) {
				let body = res.json();
    			return body.data || { };
			});/*
			.catch(function (error: Response | any) {
				if (error instanceof Response) {
					return error.json();
				} else {
					console.log(error);
					return error;
				}
			});*/
		
		return result;
	};  
	
	/*
	private getHeaders(){
		let headers = new Headers();
		headers.append('Accept', 'application/json');
		return headers;
	}*/
	  
	/*getAll(): Observable<Person[]>{
	let people$ = this.http
	  .get(`${this.baseUrl}/cameraStatus`, {headers: this.getHeaders()})
	  return people$;
	}
	*/

}
