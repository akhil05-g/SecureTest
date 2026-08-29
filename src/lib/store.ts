import { Candidate, ProctorEvent, Incident, EventType } from '@/lib/types';

export const candidates = new Map<string, Candidate>();
export const candidateEvents = new Map<string, ProctorEvent[]>();
export const candidateIncidents = new Map<string, Incident[]>();

// Pre-populate with some sample data for the dashboard
export function initializeStore() {
  if (candidates.size === 0) {
    // We don't want to clear data if it's already there (so demo seed persists),
    // but we'll export a clear method explicitly.

    const defaultCandidates: Candidate[] = [
      {
        id: '1',
        name: 'Alice Smith',
        email: 'alice@example.com',
        avatar: '',
        testStatus: 'IN_PROGRESS',
        riskScore: 15,
        riskLevel: 'LOW',
        startTime: new Date(),
        endTime: null
      },
      {
        id: '2',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        avatar: '',
        testStatus: 'COMPLETED',
        riskScore: 85,
        riskLevel: 'CRITICAL',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date()
      },
      {
        id: '3',
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        avatar: '',
        testStatus: 'IN_PROGRESS',
        riskScore: 45,
        riskLevel: 'MEDIUM',
        startTime: new Date(),
        endTime: null
      }
    ];

    defaultCandidates.forEach(c => {
      candidates.set(c.id, c);
      candidateEvents.set(c.id, []);
      candidateIncidents.set(c.id, []);
    });
    
    // Add some sample events for Bob (who has critical risk)
    const bobEvents: ProctorEvent[] = [
      {
        id: 'evt1',
        candidateId: '2',
        timestamp: new Date(Date.now() - 2000000),
        eventType: EventType.TAB_SWITCH,
        detectorConfidence: 100,
        baseSeverity: 8,
        correlationMultiplier: 1.0,
        riskDelta: 8
      },
      {
        id: 'evt2',
        candidateId: '2',
        timestamp: new Date(Date.now() - 1500000),
        eventType: EventType.PHONE_DETECTED,
        detectorConfidence: 95,
        baseSeverity: 9,
        correlationMultiplier: 1.0,
        riskDelta: 8.55
      }
    ];
    candidateEvents.set('2', bobEvents);
  }
}

export function clearStore() {
  candidates.clear();
  candidateEvents.clear();
  candidateIncidents.clear();
}
