import { NextResponse } from 'next/server';
import { prisma } from '@/lib/store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { timestamp: 'desc' }
      },
      incidents: true
    }
  });
  
  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }
  
  return NextResponse.json({
    candidate,
    events: candidate.events,
    incidents: candidate.incidents
  });
}
