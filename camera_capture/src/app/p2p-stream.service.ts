import { Injectable } from '@angular/core';

@Injectable()
export class P2pStreamService {

  constructor() { }
  
  streamVideo() {
	console.log('streaming video');
	console.log(p2p);
  }

}
