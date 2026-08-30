import { EventType, ProctorEvent } from '../types';

export class BrowserDetector {
  private isRunning: boolean = false;
  private onEventCallback: ((events: ProctorEvent[]) => void) | null = null;
  private candidateId: string = 'unknown';

  private devtoolsIntervalId: number | null = null;
  private devtoolsOpen: boolean = false;
  
  // Cooldowns to prevent event spam
  private lastEvents: Map<EventType, number> = new Map();
  private readonly COOLDOWN_MS = 5000;

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
   * Starts monitoring browser APIs for suspicious activity.
   */
  public startMonitoring(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // 1. Tab Switch & Focus Loss
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);

    // 2. Fullscreen Exit
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    // 3. Multi-Monitor Detection (Initial check and listen if supported)
    this.checkMultiMonitor();

    // 4. DevTools Detection Loop
    this.startDevToolsDetection();
  }

  /**
   * Stops all browser monitoring.
   */
  public stopMonitoring(): void {
    this.isRunning = false;
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    
    if (this.devtoolsIntervalId !== null) {
      window.clearInterval(this.devtoolsIntervalId);
      this.devtoolsIntervalId = null;
    }
  }

  private emitEvent(eventType: EventType, confidence: number, baseSeverity: number) {
    const now = Date.now();
    const lastTime = this.lastEvents.get(eventType) || 0;
    
    // Check cooldown
    if (now - lastTime < this.COOLDOWN_MS) {
      return;
    }

    const event: ProctorEvent = {
      id: crypto.randomUUID(),
      candidateId: this.candidateId,
      timestamp: new Date(now),
      eventType,
      detectorConfidence: confidence,
      baseSeverity,
      correlationMultiplier: 1.0,
      riskDelta: 0,
    };

    this.lastEvents.set(eventType, now);

    if (this.onEventCallback) {
      this.onEventCallback([event]);
    }
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // High confidence because visibility API is reliable
      this.emitEvent(EventType.TAB_SWITCH, 100, 8); 
    }
  };

  private handleWindowBlur = () => {
    // Blur could be clicking outside the window, not just tab switch, so slightly lower confidence/severity
    this.emitEvent(EventType.TAB_SWITCH, 80, 6);
  };

  private handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      this.emitEvent(EventType.FULLSCREEN_EXIT, 100, 7);
    }
  };

  private checkMultiMonitor = () => {
    // Check if the experimental window.screen.isExtended is supported
    // @ts-expect-error - isExtended is not in standard TS DOM types yet
    if (window.screen && typeof window.screen.isExtended === 'boolean') {
      // @ts-expect-error - isExtended is a boolean flag on screen API
      if (window.screen.isExtended) {
        this.emitEvent(EventType.MULTI_MONITOR, 90, 8);
      }
    }
  };

  private startDevToolsDetection = () => {
    // Run detection loop every 1.5 seconds
    this.devtoolsIntervalId = window.setInterval(() => {
      let isOpen = false;

      // Method A: Dimension Threshold
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      if (widthDiff || heightDiff) {
        isOpen = true;
      }

      if (isOpen && !this.devtoolsOpen) {
        this.emitEvent(EventType.DEVTOOLS_OPEN, 95, 9);
      }
      
      this.devtoolsOpen = isOpen;
      
    }, 1500);
  };
}
