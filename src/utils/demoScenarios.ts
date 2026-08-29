import { Candidate, IntegrityEvent, CandidateStatus } from '../types';

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  badge: string;
  color: 'cyan' | 'rose' | 'amber' | 'emerald';
  candidateCount: number;
  targetCandidateId?: string;
  getCandidates: () => Candidate[];
  getEvents: () => IntegrityEvent[];
}

export function generate1000DemoDataset(): Candidate[] {
  const names = [
    'James Wilson', 'Sophia Martinez', 'Liam Johnson', 'Emma Watson',
    'Oliver Smith', 'Ava Brown', 'Noah Davis', 'Isabella Miller',
    'Lucas Garcia', 'Mia Rodriguez', 'Ethan Anderson', 'Charlotte Thomas',
    'Mason Taylor', 'Amelia Moore', 'Logan Jackson', 'Harper Martin',
  ];
  const assessments = [
    'Senior Full Stack Engineer 2026',
    'Backend Systems Architect',
    'Cybersecurity Analyst Exam',
    'AI / ML Engineer Practical',
    'DevOps & Infrastructure Lead',
  ];

  return Array.from({ length: 1000 }, (_, i) => {
    const id = `cand-demo-${i + 1}`;
    const name = `${names[i % names.length]} #${i + 1}`;
    const email = `candidate${i + 1}@techcorp.io`;
    const assessmentTitle = assessments[i % assessments.length];
    const riskScore = Math.floor(Math.random() * 100);

    let status: CandidateStatus = 'NORMAL';
    if (riskScore >= 70) status = 'AUTO_FLAGGED';
    else if (riskScore >= 55) status = 'HIGH_RISK';
    else if (riskScore >= 40) status = 'SUSPICIOUS';

    const totalViolations = Math.floor(riskScore / 15);

    return {
      id,
      name,
      email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + (i % 50)}?w=150&auto=format&fit=crop&q=80`,
      assessmentTitle,
      status,
      riskScore,
      startedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
      totalViolations,
      recentViolations: totalViolations > 0 ? ['TAB_BLUR', 'GAZE_DEV'] : [],
      auditTrail: [],
    };
  });
}

// Scenario 2: Critical Attack (Alex Chen)
export const alexChenCandidate: Candidate = {
  id: 'cand-9042',
  name: 'Alex Chen',
  email: 'alex.chen@cyber-sec.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  assessmentTitle: 'Senior Full Stack Engineer 2026',
  status: 'AUTO_FLAGGED',
  riskScore: 92,
  startedAt: new Date(Date.now() - 3600000).toISOString(),
  totalViolations: 4,
  recentViolations: ['DEVTOOLS_TRAP', 'MULTI_SCREEN', 'TAB_BLUR'],
  auditTrail: [],
};

export const alexChenEvents: IntegrityEvent[] = [
  {
    id: 'evt-alex-1',
    candidateId: 'cand-9042',
    timestamp: '00:12:05',
    eventType: 'MULTI_SCREEN',
    severity: 'MEDIUM',
    confidence: 96,
    durationSec: 120,
    preRiskScore: 0,
    postRiskScore: 25,
    description: 'Virtual extended display detected (2560x1440 @ 144Hz via HDMI-1).',
  },
  {
    id: 'evt-alex-2',
    candidateId: 'cand-9042',
    timestamp: '00:14:22',
    eventType: 'TAB_BLUR',
    severity: 'LOW',
    confidence: 98,
    durationSec: 8,
    preRiskScore: 25,
    postRiskScore: 35,
    description: 'Window blur triggered. Focus lost to secondary display.',
  },
  {
    id: 'evt-alex-3',
    candidateId: 'cand-9042',
    timestamp: '00:15:02',
    eventType: 'DEVTOOLS_TRAP',
    severity: 'CRITICAL',
    confidence: 99.8,
    durationSec: 15,
    preRiskScore: 35,
    postRiskScore: 92,
    description: 'Debugger statement tripped @ index.bundle.js:1482. Inspector console opened.',
  },
];

// Scenario 3: Correlated Collusion (Elena Rostova)
export const elenaCandidate: Candidate = {
  id: 'cand-8114',
  name: 'Elena Rostova',
  email: 'elena.rostova@quantum.ai',
  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  assessmentTitle: 'AI / ML Engineer Practical',
  status: 'AUTO_FLAGGED',
  riskScore: 84,
  startedAt: new Date(Date.now() - 4800000).toISOString(),
  totalViolations: 3,
  recentViolations: ['PHONE_DETECTED', 'GAZE_DEV', 'AUDIO_VOICE'],
  auditTrail: [],
};

export const elenaEvents: IntegrityEvent[] = [
  {
    id: 'evt-elena-1',
    candidateId: 'cand-8114',
    timestamp: '00:22:10',
    eventType: 'GAZE_DEV',
    severity: 'LOW',
    confidence: 88,
    durationSec: 12,
    preRiskScore: 0,
    postRiskScore: 12,
    description: 'Persistent off-screen gaze shift towards bottom right desk surface.',
  },
  {
    id: 'evt-elena-2',
    candidateId: 'cand-8114',
    timestamp: '00:22:20',
    eventType: 'PHONE_DETECTED',
    severity: 'HIGH',
    confidence: 94.2,
    durationSec: 6,
    preRiskScore: 12,
    postRiskScore: 52,
    description: 'Mobile phone object detected in camera frame (x: 420, y: 310).',
  },
  {
    id: 'evt-elena-3',
    candidateId: 'cand-8114',
    timestamp: '00:22:31',
    eventType: 'AUDIO_VOICE',
    severity: 'HIGH',
    confidence: 91,
    durationSec: 10,
    preRiskScore: 52,
    postRiskScore: 84,
    description: 'Secondary voice energy detected (+18 dB above noise floor). 1.8x temporal correlation cluster applied.',
  },
];

// Scenario 4: False Positive (Marcus Vance)
export const marcusCandidate: Candidate = {
  id: 'cand-7201',
  name: 'Marcus Vance',
  email: 'marcus.vance@techlead.org',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  assessmentTitle: 'Backend Systems Architect',
  status: 'SUSPICIOUS',
  riskScore: 42,
  startedAt: new Date(Date.now() - 2400000).toISOString(),
  totalViolations: 1,
  recentViolations: ['TAB_BLUR'],
  auditTrail: [],
};

export const marcusEvents: IntegrityEvent[] = [
  {
    id: 'evt-marcus-1',
    candidateId: 'cand-7201',
    timestamp: '00:08:45',
    eventType: 'TAB_BLUR',
    severity: 'LOW',
    confidence: 85,
    durationSec: 2,
    preRiskScore: 0,
    postRiskScore: 42,
    description: 'Brief 2-second tab switch due to system notification popup.',
  },
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scen-1000',
    title: 'Enterprise Scale (1,000 Candidates)',
    description: 'Hydrate 1,000 candidates: 824 Cleared, 143 Suspicious, 33 Auto-Flagged.',
    badge: '1,000 Scale',
    color: 'cyan',
    candidateCount: 1000,
    getCandidates: () => generate1000DemoDataset(),
    getEvents: () => [...alexChenEvents, ...elenaEvents, ...marcusEvents],
  },
  {
    id: 'scen-alex',
    title: 'Critical Attack: DevTools & Multi-Display Bypass',
    description: 'Inspect Alex Chen (#CAND-9042) with debugger trap & extended monitor breach.',
    badge: 'Critical Attack',
    color: 'rose',
    candidateCount: 1,
    targetCandidateId: 'cand-9042',
    getCandidates: () => [alexChenCandidate, elenaCandidate, marcusCandidate],
    getEvents: () => alexChenEvents,
  },
  {
    id: 'scen-elena',
    title: 'Correlated Collusion: Phone + Gaze + Audio',
    description: 'Inspect Elena Rostova (#CAND-8114) demonstrating 1.8x temporal cluster multiplier.',
    badge: 'Multi-Signal Collusion',
    color: 'amber',
    candidateCount: 1,
    targetCandidateId: 'cand-8114',
    getCandidates: () => [elenaCandidate, alexChenCandidate, marcusCandidate],
    getEvents: () => elenaEvents,
  },
  {
    id: 'scen-marcus',
    title: 'False Positive Candidate (Cleared on Audit)',
    description: 'Inspect Marcus Vance (#CAND-7201) with harmless 2s tab blur for fast HR dismissal.',
    badge: 'False Positive',
    color: 'emerald',
    candidateCount: 1,
    targetCandidateId: 'cand-7201',
    getCandidates: () => [marcusCandidate, alexChenCandidate, elenaCandidate],
    getEvents: () => marcusEvents,
  },
];
