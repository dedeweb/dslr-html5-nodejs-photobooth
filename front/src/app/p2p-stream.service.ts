import { Injectable } from '@angular/core';
import { LogService } from 'log.service';
declare var io: any;
declare var RTCPeerConnection: any;
declare var mozRTCPeerConnection: any;
declare var webkitRTCPeerConnection: any;
declare var RTCSessionDescription: any;
declare var RTCIceCandidate: any;

@Injectable()
export class P2pStreamService {
  private pc: any;
  private socket: any;
  public onAddStream: (stream: MediaStream) => void;
  public onRequestImage: () => void;
  public onDisconnect: () => void;
  public onRequestLocalPlay: (deviceId: string) => void;

  constructor(private logger: LogService) {
    this.initPeerConnection();
    this.initSocket();
  }

  private initPeerConnection() {
    if (this.pc) {
      this.pc.close();
      this.pc.onaddstream = null;
      this.pc.ontrack = null;
      this.pc.oniceconnectionstatechange = null;
      this.pc.onsignalingstatechange = null;
      this.pc.ondatachannel = null;
      this.pc.onicecandidate = null;
      this.pc = null;
    }

    if (typeof RTCPeerConnection !== 'undefined') {
      this.pc = new RTCPeerConnection(null);
    } else if (typeof mozRTCPeerConnection !== 'undefined') {
      this.pc = new mozRTCPeerConnection(null);
    } else if (typeof webkitRTCPeerConnection !== 'undefined') {
      this.pc = new webkitRTCPeerConnection(null);
    } else {
      this.logger.error('WebRTC not available on this browser !');
    }

    this.pc.onaddstream = (event) => {
      this.logger.debug('stream received !!! (service)');
      this.onAddStream(event.stream);
    };
    this.pc.ontrack = () => {
      this.logger.debug('on track');
    };

    this.pc.onsignalingstatechange  = () => {
      this.logger.debug('[WEBRTC]signaling state changed : ' + this.pc.signalingState);
      this.logger.debug('[WEBRTC]local streams : ' + this.pc.getLocalStreams().length);
      this.logger.debug('[WEBRTC]remote streams : ' + this.pc.getRemoteStreams().length);
    };

    this.pc.oniceconnectionstatechange = () => {
      this.logger.debug('ICE connectionstate changed :  ' + this.pc.iceConnectionState);
      if (this.pc.iceConnectionState === 'disconnected' && this.onDisconnect) {
        this.onDisconnect();
      }
    };

    this.pc.ondatachannel = (ev) => {
      this.logger.debug('Data channel is created!');
      ev.channel.onopen = function() {
        this.logger.debug('Data channel is open and ready to be used.');
      };
    };

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.logger.debug(' ICE candidate: \n' + JSON.stringify(e.candidate) );
        this.socket.emit('camera-client-ice-candidate', e.candidate);
      }
    };
  }

  private initSocket() {
    this.socket = io( {path: '/api/socket'});

    this.socket.on('camera-ready', (status) => {
      if (status) {
        this.logger.debug('camera ready, requesting stream');
        this.socket.emit('request-camera-stream');
      } else {
        this.logger.debug('camera not ready, disconnecting.');
        if (this.onDisconnect) {
          this.onDisconnect();
        }
        this.initPeerConnection();
      }
    });

    this.socket.on('camera-connect', (offer) => {
      this.logger.debug('offer received : ' + JSON.stringify(offer));

      let sessionDescription = new RTCSessionDescription(offer);

      this.pc.setRemoteDescription(sessionDescription).then(() => {
        let localOffer;
        this.pc.createAnswer().then((answer) => {
          localOffer = answer;
          this.logger.debug('set local description');
          return this.pc.setLocalDescription(localOffer);
        }).then(() => {
          this.logger.debug('send answer');
          this.logger.debug('SIGNALING STATE : ' + this.pc.signalingState);
          this.logger.debug('ICE STATE : ' + this.pc.iceConnectionState);
          this.socket.emit('camera-client-connect', localOffer);
        });
      });
    });

    this.socket.on('camera-ice-candidate', (candidate) => {
      this.logger.debug('camera ice candidate received' + JSON.stringify(candidate));
      this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    this.socket.on('request-calibration-images', () => {
      if (this.onRequestImage) {
        this.logger.debug('request for webcam image received.');
        this.onRequestImage();
      }
    });

    this.socket.on('front-select-local-device', (deviceId) => {
      if (this.onRequestLocalPlay) {
        this.onRequestLocalPlay(deviceId);
      }
    });
  }

  public sendCalibrationImage(image: any) {
    this.logger.debug('sending webcam image for calibration.');
    this.socket.emit('webcam-image', image);
  }

  public announceStreamPlaying(remote: boolean) {
    this.socket.emit('front-playing', remote);
  }

  public announceLocalDeviceEnumerate(devices: any) {
    this.socket.emit('front-local-enumerate', devices);
  }


}
