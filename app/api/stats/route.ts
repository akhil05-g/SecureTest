import { NextResponse } from 'next/server';
import { prisma } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalCandidates = await prisma.candidate.count();
    
    const candidates = await prisma.candidate.findMany({
      select: { riskScore: true, riskLevel: true }
    });
    
    let normalCount = 0;
    let suspiciousCount = 0;
    let autoFlaggedCount = 0;
    let totalRiskScore = 0;
    
    candidates.forEach(c => {
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
      totalCandidates,
      normalCount,
      suspiciousCount,
      autoFlaggedCount,
      averageRiskScore: parseFloat(averageRiskScore.toFixed(1))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
