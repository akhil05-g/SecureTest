import { NextResponse } from 'next/server';
import { candidates, candidateIncidents, initializeStore } from '@/lib/store';
import { Incident, ReviewStatus, AuditLog } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  initializeStore();
  
  const id = params.id;
  const candidate = candidates.get(id);
  
  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }
  
  try {
    const body = await request.json();
    const { action, reviewerId, note, incidentId } = body;
    
    if (!action || !reviewerId) {
      return NextResponse.json(
        { error: 'Action and reviewerId are required' },
        { status: 400 }
      );
    }
    
    const incidents = candidateIncidents.get(id) || [];
    
    // Find specific incident if provided, otherwise we're reviewing the candidate generally
    let targetIncident: Incident | undefined;
    
    if (incidentId) {
      targetIncident = incidents.find(i => i.id === incidentId);
      if (!targetIncident) {
        return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
      }
    } else {
      // Find the most recent pending incident if no specific ID provided
      targetIncident = [...incidents].reverse().find(i => i.reviewStatus === ReviewStatus.PENDING);
      
      // If no pending incidents, create a shell one for the manual review
      if (!targetIncident) {
        targetIncident = {
          id: crypto.randomUUID(),
          candidateId: id,
          events: [],
          snapshotUrl: null,
          preRiskScore: candidate.riskScore,
          postRiskScore: candidate.riskScore,
          reviewStatus: ReviewStatus.PENDING,
          auditTrail: []
        };
        incidents.push(targetIncident);
      }
    }
    
    // Update the incident based on the action
    if (action === 'CONFIRM') {
      targetIncident.reviewStatus = ReviewStatus.CONFIRMED;
    } else if (action === 'DISMISS') {
      targetIncident.reviewStatus = ReviewStatus.DISMISSED;
      // Option: lower risk score on dismissal
    }
    
    if (note) {
      targetIncident.reviewerNote = note;
    }
    
    // Add to audit trail
    const auditEntry: AuditLog = {
      timestamp: new Date(),
      reviewerId,
      action: `${action}${note ? ': ' + note : ''}`
    };
    
    targetIncident.auditTrail.push(auditEntry);
    
    return NextResponse.json({
      success: true,
      incident: targetIncident
    });
    
  } catch (error) {
    console.error('Error processing review:', error);
    return NextResponse.json(
      { error: 'Failed to process review' },
      { status: 500 }
    );
  }
}
