import { Injectable } from '@angular/core';
declare var io:any;
declare var mozRTCPeerConnection:any;
declare var webkitRTCPeerConnection:any;
declare var RTCPeerConnection:any;
declare var RTCSessionDescription:any;
declare var mozRTCSessionDescription:any;

@Injectable()
export class P2pStreamService {
	private pc : any;
	public onAddStream : (stream : MediaStream) => void;
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
		
		var socket = io( {path: '/api/socket'});
		var pc = this.pc;
		socket.on('camera-ready', function (offer) {
			console.log('offer received : ' + JSON.stringify(offer));
			var sessionDescription = null;
			if(typeof RTCSessionDescription !== 'undefined') {
				sessionDescription = new RTCSessionDescription(offer);
			} else if(typeof mozRTCSessionDescription !== 'undefined') {
				sessionDescription = new mozRTCSessionDescription(offer);
			}
			pc.setRemoteDescription(sessionDescription).then(function() {
				var localOffer;
				pc.createAnswer().then(function (answer) {
					localOffer = answer;
					console.log('set local description');
					return pc.setLocalDescription(localOffer);
				}).then(function () {
					console.log('send answer');
					socket.emit('camera-client-ready', localOffer);
				}); 
			});
		});
		
		socket.on('camera-ice-candidate', function (candidate) {
			console.log('camera ice candidate received' + JSON.stringify(candidate));
			pc.addIceCandidate(candidate);
		});
		
		var that = this;
		pc.onaddstream = function (event) {
			console.log('stream received !!! (service)');
			that.onAddStream(event.stream);
		};
		pc.ontrack = function(event) {
			console.log('on track');
		};
		
		pc.onsignalingstatechange  = function (state) {
			console.log('[WEBRTC]signaling state changed : ' + pc.signalingState);
			console.log('[WEBRTC]local streams : ' + pc.getLocalStreams().length);
			console.log('[WEBRTC]remote streams : ' + pc.getRemoteStreams().length);
		};
		
		pc.ondatachannel = function (ev) {
			console.log('Data channel is created!');
			ev.channel.onopen = function() {
				console.log('Data channel is open and ready to be used.');
			};
		}
		
		pc.onicecandidate = function (e) {
			if(e.candidate) {
				console.log(' ICE candidate: \n' + JSON.stringify(e.candidate) );
				socket.emit('camera-client-ice-candidate', e.candidate);
			}
		};
	}

}
