import { NextResponse } from 'next/server';
import { prisma } from '@/lib/store';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id }
    });
    
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    const body = await request.json();
    
    if (!body.action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const reviewAction = await prisma.reviewAction.create({
      data: {
        id: crypto.randomUUID(),
        candidateId: id,
        action: body.action,
        reviewerId: body.reviewerId || 'SYSTEM',
        note: body.note || '',
        timestamp: new Date()
      }
    });
    
    let newStatus = candidate.testStatus;
    if (body.action === 'CONFIRM' || body.action === 'CONFIRM_FLAG') {
      newStatus = 'AUTO_FLAGGED';
    } else if (body.action === 'DISMISS' || body.action === 'DISMISS_FLAG') {
      newStatus = 'NORMAL';
    } else if (body.action === 'ESCALATE') {
      newStatus = 'HIGH_RISK';
    }

    await prisma.candidate.update({
      where: { id },
      data: { testStatus: newStatus }
    });
    
    return NextResponse.json(reviewAction, { status: 201 });
  } catch (error) {
    console.error('Error recording review:', error);
    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    );
  }
}
