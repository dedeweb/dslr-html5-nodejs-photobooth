import { Injectable } from '@angular/core';
declare var io:any;
declare var RTCPeerConnection:any;
declare var mozRTCPeerConnection:any;
declare var webkitRTCPeerConnection:any;
declare var RTCSessionDescription:any;
declare var RTCIceCandidate : any;

@Injectable()
export class P2pStreamService {
	private pc : any;
	public onAddStream : (stream : MediaStream) => void;
	initPC() {
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
	constructor() { 
		
		this.initPC();
		
		var socket = io( {path: '/api/socket'});
		var that = this;
		
		socket.on('camera-ready', function (status){
			if(status) {
				console.log('camera ready, requesting stream');
				socket.emit('request-camera-stream');
			} else {
				console.log('camera not ready, disconnecting.');
				that.pc.close();
				location.reload();
			}
		});
		
		socket.on('camera-connect', function (offer) {
			console.log('offer received : ' + JSON.stringify(offer));
			var sessionDescription = null;
			
			sessionDescription = new RTCSessionDescription(offer);
			
			that.pc.setRemoteDescription(sessionDescription).then(function() {
				var localOffer;
				that.pc.createAnswer().then(function (answer) {
					localOffer = answer;
					console.log('set local description');
					return that.pc.setLocalDescription(localOffer);
				}).then(function () {
					console.log('send answer');
					socket.emit('camera-client-connect', localOffer);
				}); 
			});
		});
		
		socket.on('camera-ice-candidate', function (candidate) {
			console.log('camera ice candidate received' + JSON.stringify(candidate));
		
			that.pc.addIceCandidate(new RTCIceCandidate(candidate));
		});
		
		
		this.pc.onaddstream = function (event) {
			console.log('stream received !!! (service)');
			that.onAddStream(event.stream);
		};
		this.pc.ontrack = function(event) {
			console.log('on track');
		};
		
		this.pc.onsignalingstatechange  = function (state) {
			console.log('[WEBRTC]signaling state changed : ' + that.pc.signalingState);
			console.log('[WEBRTC]local streams : ' + that.pc.getLocalStreams().length);
			console.log('[WEBRTC]remote streams : ' + that.pc.getRemoteStreams().length);
		};
		
		this.pc.ondatachannel = function (ev) {
			console.log('Data channel is created!');
			ev.channel.onopen = function() {
				console.log('Data channel is open and ready to be used.');
			};
		}
		
		this.pc.onicecandidate = function (e) {
			if(e.candidate) {
				console.log(' ICE candidate: \n' + JSON.stringify(e.candidate) );
				socket.emit('camera-client-ice-candidate', e.candidate);
			}
		};
	}

}
