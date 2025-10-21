import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscriber',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriber.html',
  styleUrl: './subscriber.scss'
})
export class SubscriberComponent implements OnInit, OnDestroy {
  @ViewChild('remoteVideo', { static: true }) remoteVideoRef!: ElementRef<HTMLVideoElement>;

  // State
  peerConnection: RTCPeerConnection | null = null;
  remoteStream: MediaStream | null = null;

  // User inputs
  offerToPublisher: string = '';
  answerFromPublisher: string = '';
  turnServerUrl: string = 'localhost:3480';
  turnUsername: string = 'turnuser';
  turnPassword: string = 'turnpassword';

  // Status
  isOfferCreated: boolean = false;
  isConnected: boolean = false;
  errorMessage: string = '';
  statusMessage: string = '';

  ngOnInit(): void {
    // Offer will be created manually
  }

  ngOnDestroy(): void {
    this.closePeerConnection();
  }

  async createOffer(): Promise<void> {
    try {
      this.errorMessage = '';
      this.statusMessage = 'Создание offer...';

      // Create peer connection
      const iceServers: RTCIceServer[] = [
        { urls: 'stun:stun.l.google.com:19302' }
      ];

      if (this.turnServerUrl.trim()) {
        iceServers.push({
          urls: [
            `turn:${this.turnServerUrl}?transport=udp`,
            `turn:${this.turnServerUrl}?transport=tcp`
          ],
          username: this.turnUsername,
          credential: this.turnPassword
        });
      }

      this.peerConnection = new RTCPeerConnection({ iceServers });

      // Add transceivers for receiving video and audio
      this.peerConnection.addTransceiver('video', { direction: 'recvonly' });
      this.peerConnection.addTransceiver('audio', { direction: 'recvonly' });

      // Handle incoming tracks
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (this.remoteStream) {
          this.remoteStream.addTrack(event.track);
        } else {
          this.remoteStream = event.streams[0];
          const videoElement = this.remoteVideoRef.nativeElement;
          videoElement.srcObject = this.remoteStream;
          videoElement.play();
        }
      };

      // ICE candidate handling
      this.peerConnection.onicecandidate = (event) => {
        console.log('ICE candidate:', event.candidate);
      };

      // Connection state logging
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
        if (this.peerConnection?.iceConnectionState === 'connected') {
          this.isConnected = true;
          this.statusMessage = 'Подключено! Смотрите видео.';
        }
      };

      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection?.connectionState);
      };

      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Wait for ICE gathering with timeout
      this.statusMessage = 'Сбор ICE candidates...';

      const showOffer = () => {
        const offer = this.peerConnection!.localDescription;
        if (offer) {
          this.offerToPublisher = JSON.stringify(offer, null, 2);
          this.isOfferCreated = true;
          this.statusMessage = 'Offer создан! Скопируйте и отправьте publisher.';
        }
      };

      // Show offer after 3 seconds or when gathering completes
      const gatheringTimeout = setTimeout(() => {
        showOffer();
      }, 3000);

      this.peerConnection.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', this.peerConnection?.iceGatheringState);
        if (this.peerConnection?.iceGatheringState === 'complete') {
          clearTimeout(gatheringTimeout);
          showOffer();
        }
      };

    } catch (error) {
      console.error('Failed to create offer:', error);
      this.errorMessage = 'Ошибка создания offer: ' + (error instanceof Error ? error.message : 'Unknown error');
      this.closePeerConnection();
    }
  }

  async applyAnswer(): Promise<void> {
    if (!this.answerFromPublisher.trim()) {
      this.errorMessage = 'Вставьте answer от publisher!';
      return;
    }

    if (!this.peerConnection) {
      this.errorMessage = 'Сначала создайте offer!';
      return;
    }

    try {
      this.errorMessage = '';
      this.statusMessage = 'Применение answer...';

      // Set remote description (answer from publisher)
      const answer = JSON.parse(this.answerFromPublisher);
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

      this.statusMessage = 'Answer применен! Ожидайте подключения...';

    } catch (error) {
      console.error('Failed to apply answer:', error);
      this.errorMessage = 'Ошибка применения answer: ' + (error instanceof Error ? error.message : 'Unknown error');
    }
  }

  closePeerConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.offerToPublisher = '';
    this.isOfferCreated = false;
    this.isConnected = false;
    this.statusMessage = '';
  }

  copyOffer(): void {
    if (this.offerToPublisher) {
      navigator.clipboard.writeText(this.offerToPublisher);
      this.statusMessage = 'Offer скопирован в буфер обмена!';
    }
  }
}
