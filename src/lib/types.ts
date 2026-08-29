// src/lib/types.ts

export type TestStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  avatar: string;
  testStatus: TestStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  startTime: Date | null;
  endTime: Date | null;
}

export interface Question {
  id: string;
  text: string;
  options?: string[];
  type: 'MULTIPLE_CHOICE' | 'FREE_TEXT' | 'CODE';
}

export interface Assessment {
  id: string;
  title: string;
  duration: number; // in minutes
  questions: Question[];
  policy: PolicyConfig;
}

export enum EventType {
  FACE_ABSENT = 'FACE_ABSENT',
  MULTIPLE_FACES = 'MULTIPLE_FACES',
  GAZE_AWAY = 'GAZE_AWAY',
  PHONE_DETECTED = 'PHONE_DETECTED',
  TAB_SWITCH = 'TAB_SWITCH',
  AUDIO_VOICE = 'AUDIO_VOICE',
  FULLSCREEN_EXIT = 'FULLSCREEN_EXIT',
  DEVTOOLS_OPEN = 'DEVTOOLS_OPEN',
  MULTI_MONITOR = 'MULTI_MONITOR',
}

export interface ProctorEvent {
  id: string;
  candidateId: string;
  timestamp: Date;
  eventType: EventType;
  detectorConfidence: number; // 0-100
  baseSeverity: number; // 0-10
  correlationMultiplier: number;
  riskDelta: number;
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
}

export interface AuditLog {
  timestamp: Date;
  reviewerId: string;
  action: string;
}

export interface Incident {
  id: string;
  candidateId: string;
  events: ProctorEvent[];
  snapshotUrl: string | null;
  preRiskScore: number;
  postRiskScore: number;
  reviewStatus: ReviewStatus;
  reviewerNote?: string;
  auditTrail: AuditLog[];
}

export interface PolicyConfig {
  thresholds: {
    normal: number; // < 40
    suspicious: number; // 40-69
    autoFlagged: number; // >= 70
  };
  correlationTimeWindowMs: number; // default 15000
  severityWeights: Record<EventType, number>;
}
