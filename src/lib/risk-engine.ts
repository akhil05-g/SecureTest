import { ProctorEvent, PolicyConfig } from './types';

/**
 * Normalizes a raw event score based on the detector's confidence.
 * The calculated risk is: baseSeverity * (detectorConfidence / 100)
 * 
 * @param event - The raw proctoring event
 * @returns The normalized risk score for the event
 */
export function normalizeEvent(event: ProctorEvent): number {
  const confidence = Math.max(0, Math.min(100, event.detectorConfidence));
  return event.baseSeverity * (confidence / 100);
}

/**
 * Detects correlation clusters (bursts) of different event types within a specified time window.
 * It looks at the most recent event in the array and identifies how many unique
 * event types occurred within the trailing time window.
 * 
 * - 2 different event types = 1.5x multiplier
 * - 3 or more different event types = 2.5x multiplier
 * - Otherwise = 1.0x multiplier
 * 
 * @param events - Array of events leading up to the current evaluation point
 * @param timeWindowMs - The time window in milliseconds to consider for a burst (default 15000ms)
 * @returns The correlation multiplier for the most recent event
 */
export function detectCorrelation(events: ProctorEvent[], timeWindowMs: number = 15000): number {
  if (events.length === 0) return 1.0;

  // Ensure we sort by timestamp to correctly identify the most recent event
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
    const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
    return timeA - timeB;
  });
  
  const currentEvent = sortedEvents[sortedEvents.length - 1];
  const currentTime = currentEvent.timestamp instanceof Date 
    ? currentEvent.timestamp.getTime() 
    : new Date(currentEvent.timestamp).getTime();

  // Find all events within the time window trailing the current event
  const windowEvents = sortedEvents.filter(e => {
    const eventTime = e.timestamp instanceof Date 
      ? e.timestamp.getTime() 
      : new Date(e.timestamp).getTime();
    
    return (currentTime - eventTime) <= timeWindowMs && eventTime <= currentTime;
  });

  // Count unique event types in this correlation window
  const uniqueTypes = new Set(windowEvents.map(e => e.eventType));

  if (uniqueTypes.size >= 3) {
    return 2.5;
  } else if (uniqueTypes.size === 2) {
    return 1.5;
  }

  return 1.0;
}

/**
 * Calculates the total cumulative risk score for a chronological sequence of events.
 * It sums all normalized scores and applies correlation multipliers when burst clusters 
 * of different events are detected within the time window.
 * 
 * @param events - The full array of candidate proctoring events
 * @param timeWindowMs - The time window for correlation detection (default 15000ms)
 * @returns The total cumulative risk score
 */
export function calculateCumulativeRisk(events: ProctorEvent[], timeWindowMs: number = 15000): number {
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
    const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
    return timeA - timeB;
  });

  let totalRisk = 0;

  for (let i = 0; i < sortedEvents.length; i++) {
    const currentEvent = sortedEvents[i];
    
    // Pass the events up to (and including) the current one to detect trailing correlation
    const trailingEvents = sortedEvents.slice(0, i + 1);
    
    const normalizedScore = normalizeEvent(currentEvent);
    const multiplier = detectCorrelation(trailingEvents, timeWindowMs);
    
    totalRisk += (normalizedScore * multiplier);
  }

  return totalRisk;
}

/**
 * Evaluates the final cumulative risk score against the assessment policy thresholds.
 * 
 * @param riskScore - The calculated cumulative risk score
 * @param policy - The policy configuration containing severity thresholds
 * @returns The determined risk level category string based on the thresholds
 */
export function evaluateThreshold(riskScore: number, policy: PolicyConfig): 'NORMAL' | 'SUSPICIOUS' | 'AUTO_FLAGGED' {
  if (riskScore >= policy.thresholds.autoFlagged) {
    return 'AUTO_FLAGGED';
  } else if (riskScore >= policy.thresholds.suspicious) {
    return 'SUSPICIOUS';
  } else {
    return 'NORMAL';
  }
}
