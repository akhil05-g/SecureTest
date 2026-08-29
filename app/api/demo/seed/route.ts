import { NextResponse } from 'next/server';
import { prisma } from '@/lib/store';
import { generateSyntheticData } from '@/lib/demo/generate-synthetic-data';

let isSeeding = false;

export async function POST() {
  if (isSeeding) {
    return NextResponse.json({ success: true, message: 'Seed already in progress.' });
  }
  
  try {
    isSeeding = true;
    
    // Check if we already seeded to avoid duplicates
    const count = await prisma.candidate.count();
    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: 'Database already has data. Skipping seed.',
        stats: { totalCandidates: count }
      });
    }

    const data = generateSyntheticData(1000);

    // Convert map to arrays
    const candidatesData = data.candidates.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      avatar: c.avatar || '',
      testStatus: c.testStatus,
      riskScore: c.riskScore,
      riskLevel: c.riskLevel,
      startTime: c.startTime ? new Date(c.startTime) : new Date(),
      endTime: c.endTime ? new Date(c.endTime) : null
    }));

    const eventsData = [];
    for (const [candidateId, events] of Object.entries(data.events)) {
      for (const e of events) {
        eventsData.push({
          id: e.id,
          candidateId: candidateId,
          timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
          eventType: e.eventType,
          detectorConfidence: e.detectorConfidence,
          baseSeverity: e.baseSeverity,
          correlationMultiplier: e.correlationMultiplier,
          riskDelta: e.riskDelta
        });
      }
    }

    // Insert all in transaction
    await prisma.$transaction([
      prisma.candidate.createMany({ data: candidatesData }),
      prisma.proctorEvent.createMany({ data: eventsData })
    ]);
    
    return NextResponse.json({
      success: true,
      message: 'Successfully seeded SQLite database with 1000 candidates',
      stats: { totalCandidates: 1000 }
    });
    
  } catch (error: any) {
    console.error('Failed to seed database:', error);
    return NextResponse.json(
      { error: 'Failed to generate synthetic data', details: error?.message || String(error) },
      { status: 500 }
    );
  } finally {
    isSeeding = false;
  }
}
