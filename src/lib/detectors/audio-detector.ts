import { EventType, ProctorEvent } from '../types';

export class AudioDetector {
  private isRunning: boolean = false;
  private onEventCallback: ((events: ProctorEvent[]) => void) | null = null;
  private candidateId: string = 'unknown';

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  
  private animationFrameId: number | null = null;
  private speakingStartTime: number | null = null;
  private lastEventTime: number = 0;

  private readonly THRESHOLD_DB = -30;
  private readonly TRIGGER_DURATION_MS = 3000;
  private readonly COOLDOWN_MS = 10000;

  /**
   * Registers a callback to receive generated proctoring events.
   */
  public onEvent(callback: (events: ProctorEvent[]) => void) {
    this.onEventCallback = callback;
  }

  /**
   * Sets the candidate ID used when emitting events.
   */
  public setCandidateId(candidateId: string) {
    this.candidateId = candidateId;
  }

  /**
   * Requests microphone access and initializes the Web Audio API.
   */
  public async init(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      // Configuration for volume smoothing
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      this.analyser.smoothingTimeConstant = 0.85;
      this.analyser.fftSize = 256;

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);
      
    } catch (err) {
      console.error('Failed to initialize AudioDetector:', err);
      throw err;
    }
  }

  /**
   * Starts continuously monitoring the audio stream.
   */
  public startMonitoring(): void {
    if (!this.analyser) {
      throw new Error('AudioDetector not initialized. Call init() first.');
    }
    
    this.isRunning = true;
    
    // Ensure the audio context is running (sometimes suspended by browser policy)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const monitorLoop = () => {
      if (!this.isRunning || !this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Convert 0-255 byte value back to an approximate Decibel scale based on our min/max bounds
      const minDb = this.analyser.minDecibels;
      const maxDb = this.analyser.maxDecibels;
      const dbRange = maxDb - minDb;
      const currentDb = minDb + ((average / 255) * dbRange);

      const now = Date.now();

      if (currentDb > this.THRESHOLD_DB) {
        if (this.speakingStartTime === null) {
          this.speakingStartTime = now;
        } else {
          const duration = now - this.speakingStartTime;

          if (duration >= this.TRIGGER_DURATION_MS && (now - this.lastEventTime >= this.COOLDOWN_MS)) {
            
            // Confidence scales from 70% to 100% based on how loud they are above the threshold
            // Maxed out if they reach -15dB (which is significantly loud)
            const volumeAboveThreshold = Math.min(15, currentDb - this.THRESHOLD_DB);
            const confidence = Math.round(70 + (volumeAboveThreshold * 2)); // 70 to 100

            this.emitEvent(confidence);
            this.lastEventTime = now;
            this.speakingStartTime = null; 
          }
        }
      } else {
        // Reset timer if volume drops below threshold
        this.speakingStartTime = null;
      }

      this.animationFrameId = requestAnimationFrame(monitorLoop);
    };

    this.animationFrameId = requestAnimationFrame(monitorLoop);
  }

  /**
   * Stops monitoring and releases the microphone track.
   */
  public stopMonitoring(): void {
    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    if (this.audioContext) {
      this.audioContext.suspend();
    }
  }

  private emitEvent(confidence: number) {
    const event: ProctorEvent = {
      id: crypto.randomUUID(),
      candidateId: this.candidateId,
      timestamp: new Date(),
      eventType: EventType.AUDIO_VOICE,
      detectorConfidence: Math.min(100, confidence),
      baseSeverity: 6,
      correlationMultiplier: 1.0,
      riskDelta: 0,
    };

    if (this.onEventCallback) {
      this.onEventCallback([event]);
    }
  }
}
