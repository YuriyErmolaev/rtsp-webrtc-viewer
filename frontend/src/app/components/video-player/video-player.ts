import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebrtcService } from '../../services/webrtc';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video-player.html',
  styleUrl: './video-player.scss'
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElementRef!: ElementRef<HTMLVideoElement>;

  // Connection state
  isConnecting: boolean = false;
  isConnected: boolean = false;
  errorMessage: string = '';

  // User settings
  rtspUrl: string = 'rtsp://Vu5RqXpP:5K5mjQfVt4HUDsrK@192.168.0.138:554/live/ch0';
  turnServerUrl: string = 'localhost:3480';
  turnUsername: string = 'turnuser';
  turnPassword: string = 'turnpassword';

  apiUrl: string = '/api';
  showSettings: boolean = true;

  constructor(private webrtcService: WebrtcService) {}

  ngOnInit(): void {
    // Settings visible by default
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    if (!this.rtspUrl.trim()) {
      this.errorMessage = 'Укажите RTSP URL камеры';
      return;
    }

    this.isConnecting = true;
    this.errorMessage = '';

    try {
      // Update ICE servers configuration
      const iceServers: RTCIceServer[] = [
        // Public STUN server
        { urls: 'stun:stun.l.google.com:19302' }
      ];

      // Add TURN server if configured
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

      this.webrtcService.setIceServers(iceServers);

      // First, add stream to Go2RTC if needed
      await this.addStreamToGo2RTC();

      // Connect to the stream
      const videoElement = this.videoElementRef.nativeElement;
      await this.webrtcService.connect(videoElement, 'camera1', this.apiUrl);
      this.isConnected = true;

      // Start playing video
      await videoElement.play();

      // Hide settings on successful connection
      this.showSettings = false;
    } catch (error) {
      console.error('Failed to connect:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      this.isConnected = false;
    } finally {
      this.isConnecting = false;
    }
  }

  async addStreamToGo2RTC(): Promise<void> {
    try {
      // Add or update stream in Go2RTC
      const response = await fetch(`${this.apiUrl}/api/streams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          camera1: [this.rtspUrl]
        })
      });

      if (!response.ok) {
        console.warn('Failed to add stream to Go2RTC, it might be configured in yaml');
      }
    } catch (error) {
      console.warn('Could not update Go2RTC stream config:', error);
      // Continue anyway - stream might be in config file
    }
  }

  disconnect(): void {
    this.webrtcService.disconnect();
    this.isConnected = false;
    this.errorMessage = '';
    this.showSettings = true;
  }

  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 500);
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }
}
