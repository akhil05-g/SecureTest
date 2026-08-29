import { Candidate, EventType, ProctorEvent, RiskLevel } from '../types';
import { detectCorrelation, normalizeEvent, calculateCumulativeRisk, evaluateThreshold } from '../risk-engine';
import { PolicyConfig } from '../types';

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Timothy', 'Deborah'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzales', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const defaultPolicy: PolicyConfig = {
  thresholds: { normal: 40, suspicious: 70, autoFlagged: 90 },
  correlationTimeWindowMs: 15000,
  severityWeights: {
    FACE_ABSENT: 7, MULTIPLE_FACES: 8, GAZE_AWAY: 5,
    PHONE_DETECTED: 9, TAB_SWITCH: 8, AUDIO_VOICE: 6,
    FULLSCREEN_EXIT: 7, DEVTOOLS_OPEN: 9, MULTI_MONITOR: 8
  }
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomConfidence(): number {
  return randomInt(75, 100);
}

export interface SyntheticData {
  candidates: Candidate[];
  events: Record<string, ProctorEvent[]>;
}

export function generateSyntheticData(count: number = 1000): SyntheticData {
  const result: SyntheticData = {
    candidates: [],
    events: {}
  };

  const now = Date.now();
  const twoHoursMs = 2 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let targetProfile: 'NORMAL' | 'SUSPICIOUS' | 'AUTO_FLAGGED' = 'NORMAL';
    
    // Distribution: 82% normal, 14% suspicious, 4% auto-flagged
    if (r > 0.96) {
      targetProfile = 'AUTO_FLAGGED';
    } else if (r > 0.82) {
      targetProfile = 'SUSPICIOUS';
    }

    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const id = crypto.randomUUID();
    
    // Random start time within last 2 hours
    const startTimeMs = now - randomInt(10 * 60 * 1000, twoHoursMs);
    const startTime = new Date(startTimeMs);
    
    // Some are completed, some in progress
    const isCompleted = Math.random() > 0.4;
    const endTimeMs = isCompleted ? startTimeMs + randomInt(30 * 60 * 1000, 90 * 60 * 1000) : now;
    const endTime = isCompleted ? new Date(endTimeMs) : null;
    
    const candidateEvents = generateEventsForProfile(
      targetProfile, 
      id, 
      startTimeMs, 
      endTimeMs
    );
    
    // Calculate final risk score based on generated events
    const finalScore = calculateCumulativeRisk(candidateEvents, defaultPolicy.correlationTimeWindowMs);
    const levelStr = evaluateThreshold(finalScore, defaultPolicy);
    
    let riskLevel: RiskLevel = 'LOW';
    if (levelStr === 'AUTO_FLAGGED') riskLevel = 'CRITICAL';
    else if (levelStr === 'SUSPICIOUS') riskLevel = 'HIGH';
    else if (finalScore > 20) riskLevel = 'MEDIUM';

    const candidate: Candidate = {
      id,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@example.com`,
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      testStatus: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      riskScore: parseFloat(finalScore.toFixed(1)),
      riskLevel,
      startTime,
      endTime
    };

    result.candidates.push(candidate);
    result.events[id] = candidateEvents;
  }

  return result;
}

function generateEventsForProfile(
  profile: 'NORMAL' | 'SUSPICIOUS' | 'AUTO_FLAGGED',
  candidateId: string,
  startTimeMs: number,
  endTimeMs: number
): ProctorEvent[] {
  const events: ProctorEvent[] = [];
  const duration = endTimeMs - startTimeMs;
  
  let eventCount = 0;
  if (profile === 'NORMAL') {
    eventCount = randomInt(0, 5); // 0-5 minor events
  } else if (profile === 'SUSPICIOUS') {
    eventCount = randomInt(8, 20);
  } else {
    eventCount = randomInt(20, 50);
  }

  if (eventCount === 0) return events;

  const eventPoolNormal = [EventType.GAZE_AWAY, EventType.AUDIO_VOICE, EventType.TAB_SWITCH];
  const eventPoolSuspicious = [...eventPoolNormal, EventType.FACE_ABSENT, EventType.MULTI_MONITOR, EventType.FULLSCREEN_EXIT];
  const eventPoolFlagged = [...eventPoolSuspicious, EventType.PHONE_DETECTED, EventType.MULTIPLE_FACES, EventType.DEVTOOLS_OPEN];

  let currentPool = eventPoolNormal;
  if (profile === 'SUSPICIOUS') currentPool = eventPoolSuspicious;
  if (profile === 'AUTO_FLAGGED') currentPool = eventPoolFlagged;

  let currentTimeMs = startTimeMs;
  const averageGap = duration / eventCount;

  while (events.length < eventCount) {
    // Generate bursts for higher risk profiles
    const doBurst = (profile === 'AUTO_FLAGGED' && Math.random() > 0.6) || 
                    (profile === 'SUSPICIOUS' && Math.random() > 0.8);
    
    if (doBurst) {
      // 2-4 events rapidly in succession (within 10 seconds)
      const burstSize = randomInt(2, 4);
      const burstStart = currentTimeMs + randomInt(10000, averageGap * 2);
      
      const usedTypes = new Set<EventType>();
      
      for (let j = 0; j < burstSize && events.length < eventCount; j++) {
        // Try to pick different event types for higher correlation multipliers
        let type = randomItem(currentPool);
        while (usedTypes.has(type) && usedTypes.size < currentPool.length) {
          type = randomItem(currentPool);
        }
        usedTypes.add(type);
        
        const timestamp = new Date(burstStart + (j * randomInt(500, 3000)));
        events.push(createMockEvent(candidateId, type, timestamp));
      }
      
      currentTimeMs = burstStart + 15000;
    } else {
      // Single scattered event
      currentTimeMs += randomInt(10000, averageGap * 1.5);
      if (currentTimeMs > endTimeMs) break;
      
      const type = randomItem(currentPool);
      events.push(createMockEvent(candidateId, type, new Date(currentTimeMs)));
    }
  }

  // Ensure they are strictly chronological, then map correlation values using the risk engine
  const chronological = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  for (let i = 0; i < chronological.length; i++) {
    const trailingEvents = chronological.slice(0, i + 1);
    const normalizedScore = normalizeEvent(chronological[i]);
    const multiplier = detectCorrelation(trailingEvents, defaultPolicy.correlationTimeWindowMs);
    
    chronological[i].correlationMultiplier = multiplier;
    chronological[i].riskDelta = normalizedScore * multiplier;
  }

  return chronological;
}

function createMockEvent(candidateId: string, eventType: EventType, timestamp: Date): ProctorEvent {
  const baseSeverity = defaultPolicy.severityWeights[eventType] || 5;
  
  return {
    id: crypto.randomUUID(),
    candidateId,
    timestamp,
    eventType,
    detectorConfidence: randomConfidence(),
    baseSeverity,
    correlationMultiplier: 1.0,
    riskDelta: 0
  };
}
