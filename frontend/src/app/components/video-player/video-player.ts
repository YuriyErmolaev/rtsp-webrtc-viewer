import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebrtcService } from '../../services/webrtc';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.html',
  styleUrl: './video-player.scss'
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElementRef!: ElementRef<HTMLVideoElement>;
  @Input() streamName: string = 'camera1';
  @Input() apiUrl: string = '/api';

  isConnecting: boolean = false;
  isConnected: boolean = false;
  errorMessage: string = '';

  constructor(private webrtcService: WebrtcService) {}

  ngOnInit(): void {
    // Auto-connect on component initialization (optional)
    // Uncomment if you want to connect automatically
    // this.connect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;
    this.errorMessage = '';

    try {
      const videoElement = this.videoElementRef.nativeElement;
      await this.webrtcService.connect(videoElement, this.streamName, this.apiUrl);
      this.isConnected = true;

      // Start playing video
      await videoElement.play();
    } catch (error) {
      console.error('Failed to connect:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      this.isConnected = false;
    } finally {
      this.isConnecting = false;
    }
  }

  disconnect(): void {
    this.webrtcService.disconnect();
    this.isConnected = false;
    this.errorMessage = '';
  }

  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 500);
  }
}
