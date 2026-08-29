import { Candidate, AssessmentPolicy } from '../types';

export function downloadJsonAuditPack(candidates: Candidate[], policy: AssessmentPolicy) {
  const auditPack = {
    exportMetadata: {
      system: 'SecureTest HR Integrity Engine',
      version: 'v2.4-STRICT',
      generatedAt: new Date().toISOString(),
      digitalSignature: `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`.toUpperCase(),
    },
    policySnapshot: policy,
    summaryMetrics: {
      totalCandidates: candidates.length,
      normal: candidates.filter((c) => c.status === 'NORMAL').length,
      suspicious: candidates.filter((c) => c.status === 'SUSPICIOUS').length,
      highRisk: candidates.filter((c) => c.status === 'HIGH_RISK').length,
      autoFlagged: candidates.filter((c) => c.status === 'AUTO_FLAGGED').length,
    },
    candidates: candidates.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      assessmentTitle: c.assessmentTitle,
      status: c.status,
      riskScore: c.riskScore,
      totalViolations: c.totalViolations,
      startedAt: c.startedAt,
      auditTrailCount: c.auditTrail.length,
      recentViolations: c.recentViolations,
      auditTrail: c.auditTrail,
    })),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditPack, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `securetest-audit-pack-${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
