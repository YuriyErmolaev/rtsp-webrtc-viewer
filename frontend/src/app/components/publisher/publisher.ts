import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-publisher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publisher.html',
  styleUrl: './publisher.scss'
})
export class PublisherComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo', { static: true }) localVideoRef!: ElementRef<HTMLVideoElement>;

  // State
  localStream: MediaStream | null = null;
  peerConnection: RTCPeerConnection | null = null;

  // User inputs
  offerFromSubscriber: string = '';
  answerToSubscriber: string = '';
  turnServerUrl: string = 'localhost:3480';
  turnUsername: string = 'turnuser';
  turnPassword: string = 'turnpassword';

  // Status
  isCameraStarted: boolean = false;
  errorMessage: string = '';
  statusMessage: string = '';

  ngOnInit(): void {
    // Camera will be started manually
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.closePeerConnection();
  }

  async startCamera(): Promise<void> {
    try {
      this.errorMessage = '';
      this.statusMessage = 'Запрос доступа к камере...';

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const videoElement = this.localVideoRef.nativeElement;
      videoElement.srcObject = this.localStream;
      await videoElement.play();

      this.isCameraStarted = true;
      this.statusMessage = 'Камера запущена! Ожидайте offer от subscriber.';
    } catch (error) {
      console.error('Failed to start camera:', error);
      this.errorMessage = 'Не удалось получить доступ к камере: ' + (error instanceof Error ? error.message : 'Unknown error');
      this.isCameraStarted = false;
    }
  }

  stopCamera(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    this.isCameraStarted = false;
    this.statusMessage = '';
  }

  async createAnswer(): Promise<void> {
    if (!this.localStream) {
      this.errorMessage = 'Сначала запустите камеру!';
      return;
    }

    if (!this.offerFromSubscriber.trim()) {
      this.errorMessage = 'Вставьте offer от subscriber!';
      return;
    }

    try {
      this.errorMessage = '';
      this.statusMessage = 'Создание answer...';

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

      // Add local stream tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // ICE candidate handling
      this.peerConnection.onicecandidate = (event) => {
        console.log('ICE candidate:', event.candidate);
      };

      // Connection state logging
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
      };

      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection?.connectionState);
      };

      // Set remote description (offer from subscriber)
      const offer = JSON.parse(this.offerFromSubscriber);
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Wait for ICE gathering with timeout
      this.statusMessage = 'Сбор ICE candidates...';

      const showAnswer = () => {
        const answer = this.peerConnection!.localDescription;
        if (answer) {
          this.answerToSubscriber = JSON.stringify(answer, null, 2);
          this.statusMessage = 'Answer создан! Скопируйте и отправьте subscriber.';
        }
      };

      // Show answer after 3 seconds or when gathering completes
      const gatheringTimeout = setTimeout(() => {
        showAnswer();
      }, 3000);

      this.peerConnection.onicegatheringstatechange = () => {
        console.log('ICE gathering state:', this.peerConnection?.iceGatheringState);
        if (this.peerConnection?.iceGatheringState === 'complete') {
          clearTimeout(gatheringTimeout);
          showAnswer();
        }
      };

    } catch (error) {
      console.error('Failed to create answer:', error);
      this.errorMessage = 'Ошибка создания answer: ' + (error instanceof Error ? error.message : 'Unknown error');
      this.closePeerConnection();
    }
  }

  closePeerConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.answerToSubscriber = '';
    this.statusMessage = '';
  }

  copyAnswer(): void {
    if (this.answerToSubscriber) {
      navigator.clipboard.writeText(this.answerToSubscriber);
      this.statusMessage = 'Answer скопирован в буфер обмена!';
    }
  }
}
