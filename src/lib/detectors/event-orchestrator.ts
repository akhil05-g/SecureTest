import { ProctorDetector } from './face-detector';
import { GazeDetector } from './gaze-detector';
import { BrowserDetector } from './browser-detector';
import { AudioDetector } from './audio-detector';
import { ProctorEvent } from '../types';
import { detectCorrelation, normalizeEvent, calculateCumulativeRisk } from '../risk-engine';

export interface OrchestratorResult {
  events: ProctorEvent[];
  finalRiskScore: number;
}

export class EventOrchestrator {
  private faceDetector: ProctorDetector;
  private gazeDetector: GazeDetector;
  private browserDetector: BrowserDetector;
  private audioDetector: AudioDetector;

  private eventLog: ProctorEvent[] = [];
  private currentRiskScore: number = 0;
  private isMonitoring: boolean = false;

  // Callbacks for frontend subscriptions
  private eventCallbacks: ((event: ProctorEvent) => void)[] = [];
  private riskUpdateCallbacks: ((newScore: number, lastEvent: ProctorEvent) => void)[] = [];

  constructor() {
    this.faceDetector = new ProctorDetector();
    this.gazeDetector = new GazeDetector();
    this.browserDetector = new BrowserDetector();
    this.audioDetector = new AudioDetector();
  }

  /**
   * Subscribe to individual proctoring events as they occur.
   */
  public onEvent(callback: (event: ProctorEvent) => void): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * Subscribe to risk score updates, fired whenever a new event alters the score.
   */
  public onRiskUpdate(callback: (newScore: number, lastEvent: ProctorEvent) => void): void {
    this.riskUpdateCallbacks.push(callback);
  }

  /**
   * Initializes all detectors, wires up event routing, and starts monitoring.
   * @param videoElement The HTMLVideoElement containing the candidate's webcam feed.
   * @param candidateId The ID of the candidate taking the assessment.
   */
  public async startMonitoring(videoElement: HTMLVideoElement, candidateId: string): Promise<void> {
    if (this.isMonitoring) return;

    // 1. Initialize models that require loading
    await Promise.all([
      this.faceDetector.init(),
      this.gazeDetector.init(),
      this.audioDetector.init()
    ]);

    // 2. Assign candidate IDs to all detectors
    const detectors = [this.faceDetector, this.gazeDetector, this.browserDetector, this.audioDetector];
    detectors.forEach(d => d.setCandidateId(candidateId));

    // 3. Centralized event handler to process all incoming events
    const handleDetectorEvents = (events: ProctorEvent[]) => {
      if (!this.isMonitoring) return;
      
      for (const event of events) {
        // Calculate the base normalized score
        const normalizedScore = normalizeEvent(event);
        
        // Push to log to include it in the trailing correlation window
        this.eventLog.push(event);
        
        // Detect burst correlations in the trailing 15 seconds
        const correlationMultiplier = detectCorrelation(this.eventLog, 15000);
        event.correlationMultiplier = correlationMultiplier;
        
        // Calculate the specific delta this event adds to the total risk
        event.riskDelta = normalizedScore * correlationMultiplier;
        
        // The cumulative risk can be calculated by summing the log,
        // or by calling the engine function across the whole array.
        this.currentRiskScore = calculateCumulativeRisk(this.eventLog, 15000);

        // Notify subscribers
        this.eventCallbacks.forEach(cb => cb(event));
        this.riskUpdateCallbacks.forEach(cb => cb(this.currentRiskScore, event));
      }
    };

    // 4. Wire up the detectors to the central handler
    this.faceDetector.onEvent(handleDetectorEvents);
    this.gazeDetector.onEvent(handleDetectorEvents);
    this.browserDetector.onEvent(handleDetectorEvents);
    this.audioDetector.onEvent(handleDetectorEvents);

    // 5. Start the detection loops
    this.faceDetector.startDetectionLoop(videoElement);
    this.gazeDetector.startDetectionLoop(videoElement);
    this.browserDetector.startMonitoring();
    this.audioDetector.startMonitoring();

    this.isMonitoring = true;
  }

  /**
   * Stops all detectors and returns the final logs and score.
   */
  public stopMonitoring(): OrchestratorResult {
    this.isMonitoring = false;

    this.faceDetector.stopDetectionLoop();
    this.gazeDetector.stopDetectionLoop();
    this.browserDetector.stopMonitoring();
    this.audioDetector.stopMonitoring();

    return {
      events: this.getEventLog(),
      finalRiskScore: this.getLatestRiskScore()
    };
  }

  /**
   * Retrieves the latest cumulative risk score.
   */
  public getLatestRiskScore(): number {
    return this.currentRiskScore;
  }

  /**
   * Retrieves the chronological log of all proctoring events detected so far.
   */
  public getEventLog(): ProctorEvent[] {
    return [...this.eventLog];
  }
}
