import { NextResponse } from 'next/server';
import { prisma } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const candidatesList = await prisma.candidate.findMany({
    orderBy: { riskScore: 'desc' }
  });
  
  return NextResponse.json(candidatesList);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    const newCandidate = await prisma.candidate.create({
      data: {
        id: crypto.randomUUID(),
        name: body.name,
        email: body.email,
        avatar: body.avatar || '',
        testStatus: 'SCHEDULED',
        riskScore: 0,
        riskLevel: 'LOW',
        startTime: new Date(),
      }
    });
    
    return NextResponse.json(newCandidate, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}