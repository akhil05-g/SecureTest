import { NextResponse } from 'next/server';
import { candidates, candidateEvents, initializeStore } from '@/lib/store';
import { ProctorEvent, PolicyConfig } from '@/lib/types';
import { calculateCumulativeRisk, evaluateThreshold } from '@/lib/risk-engine';

// Default policy for the engine
const defaultPolicy: PolicyConfig = {
  thresholds: {
    normal: 40,
    suspicious: 70,
    autoFlagged: 90
  },
  correlationTimeWindowMs: 15000,
  severityWeights: {
    FACE_ABSENT: 7,
    MULTIPLE_FACES: 8,
    GAZE_AWAY: 5,
    PHONE_DETECTED: 9,
    TAB_SWITCH: 8,
    AUDIO_VOICE: 6,
    FULLSCREEN_EXIT: 7,
    DEVTOOLS_OPEN: 9,
    MULTI_MONITOR: 8
  }
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  initializeStore();
  
  const id = params.id;
  const candidate = candidates.get(id);
  
  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }
  
  try {
    const rawEvent = await request.json();
    
    // Ensure arrays exist
    if (!candidateEvents.has(id)) {
      candidateEvents.set(id, []);
    }
    
    const events = candidateEvents.get(id)!;
    
    // Create properly typed event
    const newEvent: ProctorEvent = {
      id: rawEvent.id || crypto.randomUUID(),
      candidateId: id,
      timestamp: new Date(rawEvent.timestamp || Date.now()),
      eventType: rawEvent.eventType,
      detectorConfidence: rawEvent.detectorConfidence || 100,
      baseSeverity: defaultPolicy.severityWeights[rawEvent.eventType as keyof typeof defaultPolicy.severityWeights] || 5,
      correlationMultiplier: 1.0, // Will be updated by engine
      riskDelta: 0 // Will be updated by engine
    };
    
    events.push(newEvent);
    
    // Calculate new total risk score
    const newRiskScore = calculateCumulativeRisk(events, defaultPolicy.correlationTimeWindowMs);
    
    // Evaluate new risk level
    const riskLevelStr = evaluateThreshold(newRiskScore, defaultPolicy);
    
    // Map the string returns to our RiskLevel enum equivalent strings
    let mappedRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskLevelStr === 'AUTO_FLAGGED') mappedRiskLevel = 'CRITICAL';
    else if (riskLevelStr === 'SUSPICIOUS') mappedRiskLevel = 'HIGH';
    else if (newRiskScore > 20) mappedRiskLevel = 'MEDIUM';
    
    // Update candidate
    candidate.riskScore = newRiskScore;
    candidate.riskLevel = mappedRiskLevel;
    
    // The engine updates the event objects in place during calculation if we were passing it properly,
    // but we need to run it specifically to get the delta for just this event
    
    return NextResponse.json({ 
      event: newEvent,
      newRiskScore: candidate.riskScore,
      newRiskLevel: candidate.riskLevel
    });
    
  } catch (error) {
    console.error('Error processing event:', error);
    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}
