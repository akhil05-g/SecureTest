import { NextResponse } from 'next/server';
import { candidates, candidateEvents, candidateIncidents, clearStore } from '@/lib/store';
import { generateSyntheticData } from '@/lib/demo/generate-synthetic-data';

export async function POST() {
  try {
    const data = generateSyntheticData(1000);
    
    // Clear existing data
    clearStore();
    
    // Populate the global store
    data.candidates.forEach(candidate => {
      candidates.set(candidate.id, candidate);
      candidateEvents.set(candidate.id, data.events[candidate.id] || []);
      candidateIncidents.set(candidate.id, []);
    });
    
    // Calculate the same stats the GET /api/stats endpoint returns
    const allCandidates = Array.from(candidates.values());
    const totalCandidates = allCandidates.length;
    
    let normalCount = 0;
    let suspiciousCount = 0;
    let autoFlaggedCount = 0;
    let totalRiskScore = 0;
    
    allCandidates.forEach(c => {
      totalRiskScore += c.riskScore;
      
      if (c.riskLevel === 'CRITICAL' || c.riskScore >= 70) {
        autoFlaggedCount++;
      } else if (c.riskLevel === 'HIGH' || c.riskLevel === 'MEDIUM' || c.riskScore >= 40) {
        suspiciousCount++;
      } else {
        normalCount++;
      }
    });
    
    const averageRiskScore = totalCandidates > 0 ? (totalRiskScore / totalCandidates) : 0;
    
    return NextResponse.json({
      success: true,
      message: 'Successfully generated 1000 synthetic candidate records',
      stats: {
        totalCandidates,
        normalCount,
        suspiciousCount,
        autoFlaggedCount,
        averageRiskScore: parseFloat(averageRiskScore.toFixed(1))
      }
    });
    
  } catch (error) {
    console.error('Failed to seed synthetic data:', error);
    return NextResponse.json(
      { error: 'Failed to generate synthetic data' },
      { status: 500 }
    );
  }
}
