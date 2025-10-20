import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebrtcService {
  private peerConnection: RTCPeerConnection | null = null;
  private videoElement: HTMLVideoElement | null = null;

  // ICE servers configuration (STUN and TURN)
  private iceServers: RTCIceServer[] = [
    // Public STUN server
    { urls: 'stun:stun.l.google.com:19302' },

    // Your TURN server (update the IP address)
    {
      urls: [
        'turn:localhost:3478?transport=udp',
        'turn:localhost:3478?transport=tcp'
      ],
      username: 'turnuser',
      credential: 'turnpassword'
    }
  ];

  constructor() {}

  /**
   * Initialize WebRTC connection to Go2RTC server
   * @param videoElement - HTML video element to display stream
   * @param streamName - Name of the stream configured in Go2RTC
   * @param apiUrl - Go2RTC API URL (default: /api)
   */
  async connect(
    videoElement: HTMLVideoElement,
    streamName: string,
    apiUrl: string = '/api'
  ): Promise<void> {
    this.videoElement = videoElement;

    // Create peer connection
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      if (this.videoElement && event.streams[0]) {
        this.videoElement.srcObject = event.streams[0];
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
    };

    // Add transceivers for receiving video and audio
    this.peerConnection.addTransceiver('video', { direction: 'recvonly' });
    this.peerConnection.addTransceiver('audio', { direction: 'recvonly' });

    // Create offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Send offer to Go2RTC and get answer
    const response = await fetch(`${apiUrl}/stream.sdp?src=${streamName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: offer.sdp
    });

    if (!response.ok) {
      throw new Error(`Failed to connect: ${response.statusText}`);
    }

    const answerSdp = await response.text();

    // Set remote description
    await this.peerConnection.setRemoteDescription({
      type: 'answer',
      sdp: answerSdp
    });

    console.log('WebRTC connection established');
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    console.log('WebRTC connection closed');
  }

  /**
   * Update ICE servers configuration
   * Use this to set your server's public IP address
   */
  setIceServers(servers: RTCIceServer[]): void {
    this.iceServers = servers;
  }
}
