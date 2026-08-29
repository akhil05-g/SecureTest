import { NextResponse } from 'next/server';
import { candidates, candidateEvents, candidateIncidents, initializeStore } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  initializeStore();
  
  const id = params.id;
  const candidate = candidates.get(id);
  
  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }
  
  const events = candidateEvents.get(id) || [];
  const incidents = candidateIncidents.get(id) || [];
  
  return NextResponse.json({
    candidate,
    events,
    incidents
  });
}
