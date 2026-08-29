import { NextResponse } from 'next/server';
import { candidates, candidateEvents, initializeStore } from '@/lib/store';
import { EventType } from '@/lib/types';

export async function GET() {
  initializeStore();
  
  const allCandidates = Array.from(candidates.values());
  const totalCandidates = allCandidates.length;
  
  let normalCount = 0;
  let suspiciousCount = 0;
  let autoFlaggedCount = 0;
  let totalRiskScore = 0;
  
  allCandidates.forEach(c => {
    totalRiskScore += c.riskScore;
    
    // Using simple thresholds for the dashboard stats
    if (c.riskLevel === 'CRITICAL' || c.riskScore >= 70) {
      autoFlaggedCount++;
    } else if (c.riskLevel === 'HIGH' || c.riskLevel === 'MEDIUM' || c.riskScore >= 40) {
      suspiciousCount++;
    } else {
      normalCount++;
    }
  });
  
  const averageRiskScore = totalCandidates > 0 ? (totalRiskScore / totalCandidates) : 0;
  
  // Calculate top violation types across all candidates
  const violationCounts = new Map<EventType, number>();
  
  Array.from(candidateEvents.values()).forEach(events => {
    events.forEach(event => {
      const current = violationCounts.get(event.eventType) || 0;
      violationCounts.set(event.eventType, current + 1);
    });
  });
  
  // Sort violations by frequency
  const topViolationTypes = Array.from(violationCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5
  
  return NextResponse.json({
    totalCandidates,
    normalCount,
    suspiciousCount,
    autoFlaggedCount,
    averageRiskScore: parseFloat(averageRiskScore.toFixed(1)),
    topViolationTypes
  });
}
