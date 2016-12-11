import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class CameraService {
	private baseUrl: string = 'http://swapi.co/api';
	constructor(private http : Http) { }
	getAll(): Observable<Person[]>{
		let people$ = this.http
		  .get(`${this.baseUrl}/people`, {headers: this.getHeaders()})
		  .map(mapPersons);
		  return people$;
	  }

	  private getHeaders(){
		let headers = new Headers();
		headers.append('Accept', 'application/json');
		return headers;
	  }

}
