import { Injectable } from '@angular/core';
declare var io:any;
//interface mozRTCPeerConnection extends RTCPeerConnection {};
//interface webkitRTCPeerConnection extends RTCPeerConnection {};
declare var mozRTCPeerConnection:any;
declare var webkitRTCPeerConnection:any;
//type mozRTCPeerConnection = RTCPeerConnection;
//type webkitRTCPeerConnection = RTCPeerConnection;
@Injectable()
export class P2pStreamService {

  private pc : any ;
  
  constructor() { 
	
	if(typeof RTCPeerConnection !== 'undefined') {
		this.pc = new RTCPeerConnection(null);
	} else if(typeof mozRTCPeerConnection !== 'undefined') {
		this.pc = new mozRTCPeerConnection(null);
	} else if(typeof webkitRTCPeerConnection !== 'undefined') {
		this.pc = new webkitRTCPeerConnection(null);
	} else {
		console.error('WebRTC not available on this browser !');
	}
  }
  
  
  streamVideo(mediaStream : MediaStream ) {
	var socket = io( {path: '/api/socket'});
	var pc = this.pc;
	
	console.log('streaming video');
	
	pc.addStream(mediaStream);
	
	pc.createOffer().then(function(desc) {
		pc.setLocalDescription(desc).then(function () {
			// send the offer to a server to be forwarded to the friend you're calling.
			socket.emit('camera-ready', desc);
		});
	}, function (err) {
		console.error('error creating offer'  + err);
	});
  }
}
