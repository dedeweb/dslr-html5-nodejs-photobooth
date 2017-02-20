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
	public onRequestImage: () => void;
	public onDisconnect: () => void;
	public onRequestLocalPlay: (deviceId: string) => void;
	
	
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
			that.logger.debug('stream received !!! (service)');
			that.onAddStream(event.stream);
		};
		this.pc.ontrack = function(event) {
			that.logger.debug('on track');
		};
		
		this.pc.onsignalingstatechange  = function (state) {
			that.logger.debug('[WEBRTC]signaling state changed : ' + that.pc.signalingState);
			that.logger.debug('[WEBRTC]local streams : ' + that.pc.getLocalStreams().length);
			that.logger.debug('[WEBRTC]remote streams : ' + that.pc.getRemoteStreams().length);
		};
		this.pc.oniceconnectionstatechange = function(event) {
			that.logger.debug('ICE connectionstate changed :  ' + that.pc.iceConnectionState);
			if(that.pc.iceConnectionState === 'disconnected' && that.onDisconnect) {
				that.onDisconnect();
			}
		};
		
		this.pc.ondatachannel = function (ev) {
			that.logger.debug('Data channel is created!');
			ev.channel.onopen = function() {
				that.logger.debug('Data channel is open and ready to be used.');
			};
		}
		
		this.pc.onicecandidate = function (e) {
			if(e.candidate) {
				that.logger.debug(' ICE candidate: \n' + JSON.stringify(e.candidate) );
				that.socket.emit('camera-client-ice-candidate', e.candidate);
			}
		};
		
	}
	
	private initSocket() {
		var that = this;
		this.socket = io( {path: '/api/socket'});
		
		this.socket.on('camera-ready', function (status){
			if(status) {
				that.logger.debug('camera ready, requesting stream');
				that.socket.emit('request-camera-stream');
			} else {
				console.debug('camera not ready, disconnecting.');
				if(that.onDisconnect) {
					that.onDisconnect();
				}
				that.initPeerConnection();
			}
		});
		
		this.socket.on('camera-connect', function (offer) {
			that.logger.debug('offer received : ' + JSON.stringify(offer));
			var sessionDescription = null;
			
			sessionDescription = new RTCSessionDescription(offer);
			
			that.pc.setRemoteDescription(sessionDescription).then(function() {
				var localOffer;
				that.pc.createAnswer().then(function (answer) {
					localOffer = answer;
					that.logger.debug('set local description');
					return that.pc.setLocalDescription(localOffer);
				}).then(function () {
					that.logger.debug('send answer');
					that.logger.debug('SIGNALING STATE : ' + that.pc.signalingState);
					that.logger.debug('ICE STATE : ' + that.pc.iceConnectionState);
					that.socket.emit('camera-client-connect', localOffer);
				}); 
			});
		});
		
		this.socket.on('camera-ice-candidate', function (candidate) {
			that.logger.debug('camera ice candidate received' + JSON.stringify(candidate));
		
			that.pc.addIceCandidate(new RTCIceCandidate(candidate));
		});
		
		this.socket.on('request-calibration-images', function () {
			if(that.onRequestImage) {
				that.logger.debug('request for webcam image received.');
				that.onRequestImage();
			}
		});
		
		this.socket.on('front-select-local-device', function (deviceId) {
			if(that.onRequestLocalPlay) {
				that.onRequestLocalPlay(deviceId);
			}
		});
		
	}
	
	public sendCalibrationImage(image: any) {
		this.logger.debug('sending webcam image for calibration.');
		this.socket.emit('webcam-image', image);
	}
	
	public announceStreamPlaying(remote:boolean) {
		this.socket.emit('front-playing', remote);
	}
	
	public announceLocalDeviceEnumerate(devices: any) {
		this.socket.emit('front-local-enumerate', devices);
	}
	

}
