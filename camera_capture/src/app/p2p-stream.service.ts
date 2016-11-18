import { Injectable } from '@angular/core';
declare var io:any;
//interface mozRTCPeerConnection extends RTCPeerConnection {};
//interface webkitRTCPeerConnection extends RTCPeerConnection {};
declare var mozRTCPeerConnection:any;
declare var webkitRTCPeerConnection:any;
declare var RTCPeerConnection: any;
//type mozRTCPeerConnection = RTCPeerConnection;
//type webkitRTCPeerConnection = RTCPeerConnection;
declare var RTCSessionDescription: any;
declare var mozRTCSessionDescription: any;
declare var RTCIceCandidate:any;
@Injectable()
export class P2pStreamService {

  private pc : any ;
  private socket: any;
  private stream:MediaStream;
  public onClientStatusChange: (connected : boolean) => void;
  
  constructor() { 
	this.socket = io( {path: '/api/socket'});
	if(typeof RTCPeerConnection !== 'undefined') {
		this.pc = new RTCPeerConnection(null);
	} else if(typeof mozRTCPeerConnection !== 'undefined') {
		this.pc = new mozRTCPeerConnection(null);
	} else if(typeof webkitRTCPeerConnection !== 'undefined') {
		this.pc = new webkitRTCPeerConnection(null);
	} else {
		console.error('WebRTC not available on this browser !');
	}
	var that = this;
	this.socket.on('request-camera-stream', function () {
		that.streamVideo();
	});
	
  }
  
  cameraReady(status: boolean, stream: MediaStream) {
	this.stream = stream;
	this.socket.emit('camera-ready', status);
  }
  
  streamVideo() {
	if(!this.stream) {
		console.log('camera not ready, nothing to stream ! ');
		return;
	}
	console.log('add stream to peer connection');
	var socket = this.socket;
	var pc = this.pc;
	var that = this;
	
	pc.addStream(this.stream);
	
	pc.createOffer().then(function(desc) {
		pc.setLocalDescription(desc).then(function () {
			// send the offer to a server to be forwarded to the friend you're calling.
			console.log('local offer set, sending to remote peer.');
			socket.emit('camera-connect', desc);
		});
	}, function (err) {
		console.error('error creating offer'  + err);
	});
	
	socket.on('camera-client-connect', function (offer) {
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
		pc.addIceCandidate(new RTCIceCandidate(candidate));		
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
	
	pc.oniceconnectionstatechange = function(event) {
		if(pc.iceConnectionState === 'completed') {
			if(that.onClientStatusChange) {
				that.onClientStatusChange(true);
			}
		} else if (pc.iceConnectionState === 'disconnected') {
			if(that.onClientStatusChange) {
				that.onClientStatusChange(false);
			}
		}
		console.log('pc.iceconnectionstate = ' + pc.iceConnectionState);
	};
	
	pc.onsignalingstatechange  = function (state) {
		console.log('[WEBRTC]signaling state changed : ' + pc.signalingState);
		console.log('[WEBRTC]local streams : ' + pc.getLocalStreams().length);
		console.log('[WEBRTC]remote streams : ' + pc.getRemoteStreams().length);
	};
  }
}
