import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { EventType, ProctorEvent } from '../types';

export interface DetectionResult {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

export class ProctorDetector {
  private model: cocoSsd.ObjectDetection | null = null;
  private isRunning: boolean = false;
  private onEventCallback: ((events: ProctorEvent[]) => void) | null = null;
  private lastDetectTime: number = 0;
  private readonly FPS_LIMIT: number = 5;
  private readonly DETECTION_INTERVAL_MS = 1000 / this.FPS_LIMIT;
  private candidateId: string = 'unknown';
  private animationFrameId: number | null = null;

  /**
   * Initializes the TensorFlow.js backend and loads the COCO-SSD model.
   */
  public async init(): Promise<void> {
    await tf.ready();
    this.model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
  }

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
   * Starts the continuous detection loop on the provided video element.
   * Runs at approximately 5 frames per second to conserve CPU.
   */
  public startDetectionLoop(videoElement: HTMLVideoElement): void {
    if (!this.model) {
      throw new Error('Model not initialized. Call init() first.');
    }

    this.isRunning = true;

    const detectLoop = async (timestamp: number) => {
      if (!this.isRunning) return;

      // Throttle to ~5fps
      if (timestamp - this.lastDetectTime >= this.DETECTION_INTERVAL_MS) {
        if (videoElement.readyState === 4) { // HAVE_ENOUGH_DATA
          const detections = await this.detectFrame(videoElement);
          const events = this.analyzeDetections(detections);
          
          if (events.length > 0 && this.onEventCallback) {
            this.onEventCallback(events);
          }
        }
        this.lastDetectTime = timestamp;
      }

      this.animationFrameId = requestAnimationFrame(detectLoop);
    };

    this.animationFrameId = requestAnimationFrame(detectLoop);
  }

  /**
   * Stops the continuous detection loop.
   */
  public stopDetectionLoop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Runs object detection on a single video frame.
   */
  public async detectFrame(videoElement: HTMLVideoElement): Promise<DetectionResult[]> {
    if (!this.model) return [];
    
    // Use the model to detect objects in the video
    return await this.model.detect(videoElement);
  }

  /**
   * Analyzes raw COCO-SSD detections and maps them to standard ProctorEvents.
   * - 0 persons = FACE_ABSENT
   * - 2+ persons = MULTIPLE_FACES
   * - 'cell phone' = PHONE_DETECTED
   */
  public analyzeDetections(detections: DetectionResult[]): ProctorEvent[] {
    const events: ProctorEvent[] = [];
    const now = new Date();

    let personCount = 0;
    let highestPersonConfidence = 0;
    
    let phoneDetected = false;
    let highestPhoneConfidence = 0;

    for (const det of detections) {
      if (det.class === 'person') {
        personCount++;
        if (det.score > highestPersonConfidence) {
          highestPersonConfidence = det.score;
        }
      } else if (det.class === 'cell phone') {
        phoneDetected = true;
        if (det.score > highestPhoneConfidence) {
          highestPhoneConfidence = det.score;
        }
      }
    }

    const confidenceToPercent = (score: number) => Math.round(score * 100);

    // Rule 1: No person detected
    if (personCount === 0) {
      events.push(this.createEvent(EventType.FACE_ABSENT, 100, 7, now)); 
      // Note: baseSeverity is set as a fallback; policy config normally dictates true severity.
    }

    // Rule 2: Multiple people detected
    if (personCount > 1) {
      events.push(this.createEvent(EventType.MULTIPLE_FACES, confidenceToPercent(highestPersonConfidence), 8, now));
    }

    // Rule 3: Phone detected
    if (phoneDetected) {
      events.push(this.createEvent(EventType.PHONE_DETECTED, confidenceToPercent(highestPhoneConfidence), 9, now));
    }

    return events;
  }

  private createEvent(
    eventType: EventType, 
    confidence: number, 
    baseSeverity: number, 
    timestamp: Date
  ): ProctorEvent {
    return {
      id: crypto.randomUUID(),
      candidateId: this.candidateId,
      timestamp,
      eventType,
      detectorConfidence: confidence,
      baseSeverity,
      correlationMultiplier: 1.0, // Set later by Risk Engine
      riskDelta: 0, // Set later by Risk Engine
    };
  }
}
