export type CandidateStatus = 'NORMAL' | 'SUSPICIOUS' | 'HIGH_RISK' | 'AUTO_FLAGGED';

export type EventType =
  | 'FACE_ABSENT'
  | 'MULTI_FACE'
  | 'GAZE_DEV'
  | 'PHONE_DETECTED'
  | 'TAB_BLUR'
  | 'DEVTOOLS_TRAP'
  | 'MULTI_SCREEN'
  | 'AUDIO_VOICE'
  | 'FULLSCREEN_EXIT';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ReviewerActionType = 'CONFIRM_FLAG' | 'DISMISS_FLAG' | 'ESCALATE' | 'ADD_NOTE';

export interface AuditLogEntry {
  id: string;
  candidateId: string;
  reviewerName: string;
  action: ReviewerActionType;
  timestamp: string;
  notes: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  avatar: string;
  assessmentTitle: string;
  status: CandidateStatus;
  riskScore: number; // 0 - 100
  startedAt: string; // ISO date or formatted string
  completedAt?: string;
  totalViolations: number;
  recentViolations: EventType[];
  auditTrail: AuditLogEntry[];
}

export interface IntegrityEvent {
  id: string;
  candidateId: string;
  timestamp: string; // e.g. "00:14:21" or ISO
  eventType: EventType;
  severity: Severity;
  confidence: number; // 0 - 100%
  durationSec: number;
  evidenceSnapshotUrl?: string;
  preRiskScore: number;
  postRiskScore: number;
  description: string;
  contextNotes?: string;
}

export interface AssessmentPolicy {
  id: string;
  title: string;
  autoFlagThreshold: number; // default 70
  suspiciousThreshold: number; // default 40
  eventWeights: Record<EventType, number>;
  multiSignalBonusMultiplier: number; // default 1.5
  requireHumanReview: boolean;
}

/**
 * Returns Tailwind color classes corresponding to a candidate's status
 */
export function getStatusBadgeColor(status: CandidateStatus): string {
  switch (status) {
    case 'NORMAL':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald';
    case 'SUSPICIOUS':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30 glow-amber';
    case 'HIGH_RISK':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'AUTO_FLAGGED':
      return 'bg-rose-600/10 text-rose-400 border-rose-600/30 glow-rose';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

/**
 * Returns Tailwind color classes corresponding to event severity
 */
export function getSeverityBadgeColor(severity: Severity): string {
  switch (severity) {
    case 'LOW':
      return 'bg-slate-800/80 text-slate-300 border-slate-700';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    case 'CRITICAL':
      return 'bg-rose-600/15 text-rose-400 border-rose-600/40 font-semibold';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

/**
 * Returns human-readable label for EventType
 */
export function getEventTypeLabel(type: EventType): string {
  switch (type) {
    case 'FACE_ABSENT':
      return 'Face Absent / Unrecognized';
    case 'MULTI_FACE':
      return 'Multiple Faces Detected';
    case 'GAZE_DEV':
      return 'Gaze Deviation';
    case 'PHONE_DETECTED':
      return 'Mobile Phone Detected';
    case 'TAB_BLUR':
      return 'Tab Blur / Window Switch';
    case 'DEVTOOLS_TRAP':
      return 'Developer Tools Trap Tripped';
    case 'MULTI_SCREEN':
      return 'Multiple Monitors Detected';
    case 'AUDIO_VOICE':
      return 'Secondary Voice Detected';
    case 'FULLSCREEN_EXIT':
      return 'Exited Fullscreen Mode';
    default:
      return type;
  }
}

/**
 * Calculates candidate status based on current risk score and policy thresholds
 */
export function calculateCandidateStatus(
  riskScore: number,
  autoFlagThreshold: number = 70,
  suspiciousThreshold: number = 40
): CandidateStatus {
  if (riskScore >= autoFlagThreshold) {
    return 'AUTO_FLAGGED';
  }
  if (riskScore >= autoFlagThreshold - 15) {
    return 'HIGH_RISK';
  }
  if (riskScore >= suspiciousThreshold) {
    return 'SUSPICIOUS';
  }
  return 'NORMAL';
}
