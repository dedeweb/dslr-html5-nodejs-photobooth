import { Injectable } from '@angular/core';
import { LogService } from 'log.service';
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
  
  constructor(private logger: LogService) { 	
	this.initSocket();
  }
  
  private initPeerConnection() {
	var that = this;
	this.logger.log('creating front peer connection');
	if(this.pc) {
		this.pc.close();
		this.pc.ondatachannel = null;
		this.pc.onicecandidate = null;
		this.pc.oniceconnectionstatechange = null;
		this.pc.onsignalingstatechange = null;
		this.pc = null;
	}
	if(typeof RTCPeerConnection !== 'undefined') {
		this.pc = new RTCPeerConnection(null);
	} else if(typeof mozRTCPeerConnection !== 'undefined') {
		this.pc = new mozRTCPeerConnection(null);
	} else if(typeof webkitRTCPeerConnection !== 'undefined') {
		this.pc = new webkitRTCPeerConnection(null);
	} else {
		this.logger.error('WebRTC not available on this browser !');
	}
	
	
	this.pc.ondatachannel = function (ev) {
		this.logger.log('Data channel is created!');
		
		ev.channel.onopen = function() {
			that.logger.log('Data channel is open and ready to be used.');
		};
	};
	
	this.pc.onicecandidate = function (e) {
		if(e.candidate) {
			that.logger.log(' ICE candidate: \n' + JSON.stringify(e.candidate));
			that.socket.emit('camera-ice-candidate', e.candidate);
		}		
	};
	
	this.pc.oniceconnectionstatechange = function(event) {
		if(that.pc.iceConnectionState === 'connected' ||
			that.pc.iceConnectionState === 'completed') {
			if(that.onClientStatusChange) {
				that.onClientStatusChange(true);
			}
		} else {
			if(that.onClientStatusChange) {
				that.onClientStatusChange(false);
			}
		}
		that.logger.log('pc.iceconnectionstate = ' + that.pc.iceConnectionState);
	};
	
	this.pc.onsignalingstatechange  = function (state) {
		that.logger.log('[WEBRTC]signaling state changed : ' + that.pc.signalingState);
		that.logger.log('[WEBRTC]local streams : ' + that.pc.getLocalStreams().length);
		that.logger.log('[WEBRTC]remote streams : ' + that.pc.getRemoteStreams().length);
	};
	
  }
  
  private initSocket() {
	var that = this;
	this.socket = io( {path: '/api/socket'});
	this.socket.on('request-camera-stream', function () {
		that.streamVideo();
	});
	
	this.socket.on('camera-client-connect', function (offer) {
		that.logger.log('offer received');
		that.logger.log('SIGNALING STATE : ' + that.pc.signalingState);
		that.logger.log('ICE STATE : ' + that.pc.iceConnectionState);
		
			
		that.pc.setRemoteDescription(new RTCSessionDescription(offer)).then(function () {
			that.logger.log('camera client connected');
		}, function (error) {
			that.logger.error('error connecting : ' + error);
		});
	});
	this.socket.on('camera-client-ice-candidate', function (candidate) {
		that.logger.log('camera ice candidate received' + JSON.stringify(candidate));
		that.pc.addIceCandidate(new RTCIceCandidate(candidate));		
	});
  }
  
  
  cameraReady(status: boolean, stream: MediaStream) {
	if(this.stream && this.stream.getVideoTracks().length > 0 ) {
		this.stream.getVideoTracks()[0].stop();
		this.stream = null;
	}
  
	this.stream = stream;

	this.socket.emit('camera-ready', status);
  }
  
  private streamVideo() {
	this.initPeerConnection();
	
	if(!this.stream) {
		this.logger.log('camera not ready, nothing to stream ! ');
		return;
	}
	this.logger.log('add stream to peer connection');
	var socket = this.socket;
	var pc = this.pc;
	var that =this;
	
	pc.addStream(this.stream);
	
	pc.createOffer().then(function(desc) {
		pc.setLocalDescription(desc).then(function () {
			// send the offer to a server to be forwarded to the friend you're calling.
			that.logger.log('local offer set, sending to remote peer.');
			socket.emit('camera-connect', desc);
		});
	}, function (err) {
		that.logger.error('error creating offer'  + err);
	});
  }
}
