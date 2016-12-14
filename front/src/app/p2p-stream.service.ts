import { Injectable } from '@angular/core';
import { LogService } from 'log.service';
declare var io:any;
declare var RTCPeerConnection:any;
declare var mozRTCPeerConnection:any;
declare var webkitRTCPeerConnection:any;
declare var RTCSessionDescription:any;
declare var RTCIceCandidate : any;

@Injectable()
export class P2pStreamService {
	private pc : any;
	private socket : any;
	public onAddStream : (stream : MediaStream) => void;
	
	constructor(private logger: LogService) { 
		this.initPeerConnection();
		this.initSocket();		
	}
	
	private initPeerConnection() {
		var that = this;
		if(this.pc) {
			this.pc.close();
			this.pc.onaddstream = null;
			this.pc.ontrack = null;
			this.pc.oniceconnectionstatechange = null;
			this.pc.onsignalingstatechange = null;
			this.pc.ondatachannel = null;
			this.pc.onicecandidate = null;
			this.pc = null;
		}
		if(typeof RTCPeerConnection !== 'undefined') {
			this.pc = new RTCPeerConnection(null);
		} else if(typeof mozRTCPeerConnection !== 'undefined') {
			this.pc = new mozRTCPeerConnection(null);
		} else if(typeof webkitRTCPeerConnection !== 'undefined') {
			this.pc = new webkitRTCPeerConnection(null);
		} else {
			that.logger.error('WebRTC not available on this browser !');
		}
		
		this.pc.onaddstream = function (event) {
			that.logger.log('stream received !!! (service)');
			that.onAddStream(event.stream);
		};
		this.pc.ontrack = function(event) {
			that.logger.log('on track');
		};
		
		this.pc.onsignalingstatechange  = function (state) {
			that.logger.log('[WEBRTC]signaling state changed : ' + that.pc.signalingState);
			that.logger.log('[WEBRTC]local streams : ' + that.pc.getLocalStreams().length);
			that.logger.log('[WEBRTC]remote streams : ' + that.pc.getRemoteStreams().length);
		};
		this.pc.oniceconnectionstatechange = function(event) {
			that.logger.log('ICE connectionstate changed :  ' + that.pc.iceConnectionState);
		};
		
		this.pc.ondatachannel = function (ev) {
			that.logger.log('Data channel is created!');
			ev.channel.onopen = function() {
				that.logger.log('Data channel is open and ready to be used.');
			};
		}
		
		this.pc.onicecandidate = function (e) {
			if(e.candidate) {
				that.logger.log(' ICE candidate: \n' + JSON.stringify(e.candidate) );
				that.socket.emit('camera-client-ice-candidate', e.candidate);
			}
		};
		
	}
	
	private initSocket() {
		var that = this;
		this.socket = io( {path: '/api/socket'});
		
		this.socket.on('camera-ready', function (status){
			if(status) {
				that.logger.log('camera ready, requesting stream');
				that.socket.emit('request-camera-stream');
			} else {
				console.log('camera not ready, disconnecting.');
				that.initPeerConnection();
			}
		});
		
		this.socket.on('camera-connect', function (offer) {
			that.logger.log('offer received : ' + JSON.stringify(offer));
			var sessionDescription = null;
			
			sessionDescription = new RTCSessionDescription(offer);
			
			that.pc.setRemoteDescription(sessionDescription).then(function() {
				var localOffer;
				that.pc.createAnswer().then(function (answer) {
					localOffer = answer;
					that.logger.log('set local description');
					return that.pc.setLocalDescription(localOffer);
				}).then(function () {
					that.logger.log('send answer');
					that.logger.log('SIGNALING STATE : ' + that.pc.signalingState);
					that.logger.log('ICE STATE : ' + that.pc.iceConnectionState);
					that.socket.emit('camera-client-connect', localOffer);
				}); 
			});
		});
		
		this.socket.on('camera-ice-candidate', function (candidate) {
			that.logger.log('camera ice candidate received' + JSON.stringify(candidate));
		
			that.pc.addIceCandidate(new RTCIceCandidate(candidate));
		});
		
	}
	

}
