import { Injectable } from '@angular/core';
declare var io:any;
//interface mozRTCPeerConnection extends RTCPeerConnection {};
//interface webkitRTCPeerConnection extends RTCPeerConnection {};
declare var mozRTCPeerConnection:any;
declare var webkitRTCPeerConnection:any;
//type mozRTCPeerConnection = RTCPeerConnection;
//type webkitRTCPeerConnection = RTCPeerConnection;
declare var RTCSessionDescription: any;
declare var mozRTCSessionDescription: any;
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
	
	console.log('add stream to peer connection');
	pc.addStream(mediaStream);
	
	
	console.log('streaming video');
	
	
	
	pc.createOffer().then(function(desc) {
		pc.setLocalDescription(desc).then(function () {
			// send the offer to a server to be forwarded to the friend you're calling.
			console.log('local offer set, sending to remote peer.');
			socket.emit('camera-ready', desc);
		});
	}, function (err) {
		console.error('error creating offer'  + err);
	});
	
	socket.on('camera-client-ready', function (offer) {
		console.log('offer received');
		var sessionDescription = null;
			if(typeof RTCSessionDescription !== 'undefined') {
				sessionDescription = new RTCSessionDescription(offer);
			} else if(typeof mozRTCSessionDescription !== 'undefined') {
				sessionDescription = new mozRTCSessionDescription(offer);
			}
		pc.setRemoteDescription(sessionDescription).then(function () {
			console.log('camera client connected');
		}, function (error) {
			console.error('error connecting : ' + error);
		});
	});
	socket.on('camera-client-ice-candidate', function (candidate) {
		console.log('camera ice candidate received' + JSON.stringify(candidate));
		pc.addIceCandidate(candidate);
	});
		
	pc.ondatachannel = function (ev) {
		console.log('Data channel is created!');
		ev.channel.onopen = function() {
			console.log('Data channel is open and ready to be used.');
		};
	};
	
	pc.onicecandidate = function (e) {
		if(e.candidate) {
			console.log(' ICE candidate: \n' + JSON.stringify(e.candidate));
			socket.emit('camera-ice-candidate', e.candidate);
		}		
	};
	
	pc.onsignalingstatechange  = function (state) {
		console.log('[WEBRTC]signaling state changed : ' + pc.signalingState);
		console.log('[WEBRTC]local streams : ' + pc.getLocalStreams().length);
		console.log('[WEBRTC]remote streams : ' + pc.getRemoteStreams().length);
	};
  }
}
