import { NextResponse } from 'next/server';
import { candidates, initializeStore } from '@/lib/store';
import { Candidate } from '@/lib/types';

export async function GET() {
  initializeStore();
  
  const candidatesList = Array.from(candidates.values());
  
  // Sort by riskScore descending
  candidatesList.sort((a, b) => b.riskScore - a.riskScore);
  
  return NextResponse.json(candidatesList);
}

export async function POST(request: Request) {
  initializeStore();
  
  try {
    const body = await request.json();
    
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    const id = crypto.randomUUID();
    
    const newCandidate: Candidate = {
      id,
      name: body.name,
      email: body.email,
      avatar: body.avatar || '',
      testStatus: 'SCHEDULED',
      riskScore: 0,
      riskLevel: 'LOW',
      startTime: null,
      endTime: null
    };
    
    candidates.set(id, newCandidate);
    
    // Initialize empty arrays for the candidate
    const { candidateEvents, candidateIncidents } = await import('@/lib/store');
    candidateEvents.set(id, []);
    candidateIncidents.set(id, []);
    
    return NextResponse.json(newCandidate, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}