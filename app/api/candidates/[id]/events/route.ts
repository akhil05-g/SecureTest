import { NextResponse } from 'next/server';
import { prisma } from '@/lib/store';
import { PolicyConfig } from '@/lib/types';
import { calculateCumulativeRisk, evaluateThreshold } from '@/lib/risk-engine';

const defaultPolicy: PolicyConfig = {
  thresholds: { normal: 40, suspicious: 70, autoFlagged: 90 },
  correlationTimeWindowMs: 15000,
  severityWeights: {
    FACE_ABSENT: 7, MULTIPLE_FACES: 8, GAZE_AWAY: 5,
    PHONE_DETECTED: 9, TAB_SWITCH: 8, AUDIO_VOICE: 6,
    FULLSCREEN_EXIT: 7, DEVTOOLS_OPEN: 9, MULTI_MONITOR: 8
  }
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: { events: true }
  });
  
  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }
  
  try {
    const rawEvent = await request.json();
    
    // Create new event
    const newEvent = await prisma.proctorEvent.create({
      data: {
        id: rawEvent.id || crypto.randomUUID(),
        candidateId: id,
        timestamp: new Date(rawEvent.timestamp || Date.now()),
        eventType: rawEvent.eventType,
        detectorConfidence: rawEvent.detectorConfidence || 100,
        baseSeverity: defaultPolicy.severityWeights[rawEvent.eventType as keyof typeof defaultPolicy.severityWeights] || 5,
        correlationMultiplier: 1.0,
        riskDelta: 0
      }
    });
    
    // Calculate new total risk score
    // Prisma returns Date objects for timestamps, risk engine expects standard event shapes
    const allEvents = [...candidate.events, newEvent];
    const newRiskScore = calculateCumulativeRisk(allEvents as ProctorEvent[], defaultPolicy.correlationTimeWindowMs);
    const riskLevelStr = evaluateThreshold(newRiskScore, defaultPolicy);
    
    let mappedRiskLevel = 'LOW';
    if (riskLevelStr === 'AUTO_FLAGGED') mappedRiskLevel = 'CRITICAL';
    else if (riskLevelStr === 'SUSPICIOUS') mappedRiskLevel = 'HIGH';
    else if (newRiskScore > 20) mappedRiskLevel = 'MEDIUM';
    
    // Update candidate
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: {
        riskScore: newRiskScore,
        riskLevel: mappedRiskLevel
      }
    });
    
    return NextResponse.json({ 
      event: newEvent,
      newRiskScore: updatedCandidate.riskScore,
      newRiskLevel: updatedCandidate.riskLevel
    });
    
  } catch (error) {
    console.error('Error processing event:', error);
    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}
