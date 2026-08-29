import { EventType } from '../types';

export interface GeneratedEvidenceDetails {
  title: string;
  eventType: EventType;
  confidence: number;
  timestamp: string;
  watermark: {
    candidateId: string;
    timestampUtc: string;
    sessionHash: string;
  };
  phoneCoords?: { x: number; y: number; width: number; height: number };
  primaryFaceCoords?: { x: number; y: number; width: number; height: number };
  secondaryFaceCoords?: { x: number; y: number; width: number; height: number };
  devtoolsData?: {
    breakpoint: string;
    accessTimestamp: string;
    userAgent: string;
  };
  multiScreenData?: {
    primaryRes: string;
    extendedRes: string;
    displayCount: number;
  };
  audioData?: {
    decibelSpikeDb: number;
    channel: string;
    frequencyHz: number;
  };
  gazeData?: {
    offScreenDurationSec: number;
    gazeVectorX: number;
    gazeVectorY: number;
  };
}

export function generateEvidenceDetails(
  eventType: EventType,
  candidateId: string,
  timestamp: string,
  confidence: number
): GeneratedEvidenceDetails {
  const timestampUtc = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const sessionHash = `SHA256:${candidateId.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const base: GeneratedEvidenceDetails = {
    title: eventType.replace('_', ' '),
    eventType,
    confidence,
    timestamp,
    watermark: {
      candidateId,
      timestampUtc,
      sessionHash,
    },
  };

  switch (eventType) {
    case 'PHONE_DETECTED':
      return {
        ...base,
        phoneCoords: { x: 420, y: 310, width: 90, height: 160 },
      };

    case 'MULTI_FACE':
      return {
        ...base,
        primaryFaceCoords: { x: 220, y: 140, width: 180, height: 220 },
        secondaryFaceCoords: { x: 460, y: 180, width: 140, height: 170 },
      };

    case 'DEVTOOLS_TRAP':
      return {
        ...base,
        devtoolsData: {
          breakpoint: 'Debugger Statement Tripped @ index.bundle.js:1482',
          accessTimestamp: timestamp,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
        },
      };

    case 'MULTI_SCREEN':
      return {
        ...base,
        multiScreenData: {
          primaryRes: '1920x1080 @ 60Hz (Built-in Display)',
          extendedRes: '2560x1440 @ 144Hz (Virtual/External HDMI-1)',
          displayCount: 2,
        },
      };

    case 'AUDIO_VOICE':
      return {
        ...base,
        audioData: {
          decibelSpikeDb: 18,
          channel: 'Channel 1 (Primary Mic)',
          frequencyHz: 440,
        },
      };

    case 'GAZE_DEV':
    case 'TAB_BLUR':
    case 'FULLSCREEN_EXIT':
    case 'FACE_ABSENT':
    default:
      return {
        ...base,
        gazeData: {
          offScreenDurationSec: 14.2,
          gazeVectorX: 0.88,
          gazeVectorY: -0.42,
        },
      };
  }
}
