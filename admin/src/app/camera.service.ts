import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
//import 'rxjs/add/operator/catch';


@Injectable()
export class CameraService {
	private baseUrl: string = '/api';
	constructor(private http : Http) { }
	
	public GetStatus() {
		let result = this.http
			.get(`${this.baseUrl}/cameraStatus`);
			
		
		return result;
	};  
	
	public GetMode() {
		let result = this.http
			.get(`${this.baseUrl}/cameraMode`);
			
		
		return result;
	};
	
	public SetMode(mode: boolean) {
		let result = this.http
			.post(`${this.baseUrl}/cameraMode`, {fakeCamera: mode});
		
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
