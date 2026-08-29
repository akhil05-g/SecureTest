import { FaceDetection, Results } from '@mediapipe/face_detection';
import { EventType, ProctorEvent } from '../types';

export class GazeDetector {
  private faceDetection: FaceDetection | null = null;
  private isRunning: boolean = false;
  private onEventCallback: ((events: ProctorEvent[]) => void) | null = null;
  
  private candidateId: string = 'unknown';
  private animationFrameId: number | null = null;
  
  // Tracking state for GAZE_AWAY logic
  private gazeAwayStartTime: number | null = null;
  private lastEventTime: number = 0;
  
  // Constants
  private readonly GAZE_AWAY_THRESHOLD_MS = 2000;
  private readonly COOLDOWN_MS = 5000;
  private readonly YAW_THRESHOLD = 25; // degrees
  private readonly PITCH_THRESHOLD = 20; // degrees

  /**
   * Initializes the MediaPipe Face Detection model.
   */
  public async init(): Promise<void> {
    this.faceDetection = new FaceDetection({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
      }
    });

    this.faceDetection.setOptions({
      model: 'short', // 'short' is better for faces within 2 meters (like a webcam)
      minDetectionConfidence: 0.5,
    });

    this.faceDetection.onResults(this.onResults.bind(this));

    // Force an initialization by passing a dummy canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    await this.faceDetection.send({ image: canvas });
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
   * Processes a single frame through the face detection model.
   * This is called continuously in a loop if startDetectionLoop is used.
   */
  public async processFrame(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.faceDetection) {
      throw new Error('GazeDetector not initialized. Call init() first.');
    }
    
    // send() will trigger the onResults callback synchronously or asynchronously
    await this.faceDetection.send({ image: videoElement });
  }

  /**
   * Starts a continuous processing loop using requestAnimationFrame.
   */
  public startDetectionLoop(videoElement: HTMLVideoElement): void {
    this.isRunning = true;

    const detectLoop = async () => {
      if (!this.isRunning) return;

      if (videoElement.readyState === 4) {
        await this.processFrame(videoElement);
      }

      this.animationFrameId = requestAnimationFrame(detectLoop);
    };

    this.animationFrameId = requestAnimationFrame(detectLoop);
  }

  /**
   * Stops the continuous processing loop.
   */
  public stopDetectionLoop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Handles the results from the MediaPipe FaceDetection model.
   * Extracts landmarks, computes yaw/pitch, and evaluates GAZE_AWAY conditions.
   */
  private onResults(results: Results): void {
    const now = Date.now();

    // If no faces are detected, we reset the gaze timer and exit.
    // (FACE_ABSENT is handled by the face-detector.ts)
    if (!results.detections || results.detections.length === 0) {
      this.gazeAwayStartTime = null;
      return;
    }

    // Process the primary face (the first one)
    const detection = results.detections[0];
    const landmarks = detection.landmarks;

    // MediaPipe FaceDetection provides 6 keypoints:
    // 0: Right eye, 1: Left eye, 2: Nose tip, 3: Mouth center, 4: Right ear, 5: Left ear
    if (landmarks.length >= 4) {
      const rightEye = landmarks[0];
      const leftEye = landmarks[1];
      const nose = landmarks[2];
      const mouth = landmarks[3];

      // Calculate center point between eyes
      const eyeCenterX = (rightEye.x + leftEye.x) / 2;
      const eyeCenterY = (rightEye.y + leftEye.y) / 2;

      const eyeDistance = Math.abs(leftEye.x - rightEye.x);
      
      // Calculate Yaw (Left/Right turning)
      // Ratio of nose offset from center vs eye distance
      const yawRatio = (nose.x - eyeCenterX) / (eyeDistance || 0.001);
      const yawDegrees = Math.abs(yawRatio * 90); // Approximation: ratio of 0.5 -> ~45 degrees

      // Calculate Pitch (Up/Down turning)
      const faceHeight = mouth.y - eyeCenterY;
      // Normal ratio of nose position between eyes and mouth is ~0.45 when looking straight
      const noseYRatio = (nose.y - eyeCenterY) / (faceHeight || 0.001);
      const pitchDegrees = Math.abs(noseYRatio - 0.45) * 150; // Approximation scale

      const isLookingAway = yawDegrees > this.YAW_THRESHOLD || pitchDegrees > this.PITCH_THRESHOLD;

      if (isLookingAway) {
        if (this.gazeAwayStartTime === null) {
          this.gazeAwayStartTime = now;
        } else {
          const duration = now - this.gazeAwayStartTime;

          // Check if looking away for more than 2 seconds, and cooldown has elapsed
          if (duration >= this.GAZE_AWAY_THRESHOLD_MS && (now - this.lastEventTime >= this.COOLDOWN_MS)) {
            
            // Calculate confidence based on how far past the threshold they are looking
            const maxDeviation = Math.max(
              yawDegrees > this.YAW_THRESHOLD ? yawDegrees - this.YAW_THRESHOLD : 0,
              pitchDegrees > this.PITCH_THRESHOLD ? pitchDegrees - this.PITCH_THRESHOLD : 0
            );
            
            // Base 60% confidence, up to 100% based on extreme angles
            const confidence = Math.min(100, Math.round(60 + (maxDeviation * 1.5)));

            const event: ProctorEvent = {
              id: crypto.randomUUID(),
              candidateId: this.candidateId,
              timestamp: new Date(now),
              eventType: EventType.GAZE_AWAY,
              detectorConfidence: confidence,
              baseSeverity: 5,
              correlationMultiplier: 1.0,
              riskDelta: 0,
            };

            if (this.onEventCallback) {
              this.onEventCallback([event]);
            }

            this.lastEventTime = now;
            // Reset start time so it requires another full 2 seconds to trigger again after cooldown
            this.gazeAwayStartTime = null; 
          }
        }
      } else {
        // Reset timer if they look back at the screen
        this.gazeAwayStartTime = null;
      }
    }
  }
}
