"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import {
  Candidate,
  CandidateStatus,
  IntegrityEvent,
  AssessmentPolicy,
  ReviewerActionType,
  AuditLogEntry,
  calculateCandidateStatus,
} from "../types";
import { defaultPolicy, mockCandidates, mockEvents } from "../data/mockData";

export interface FilterOptions {
  search: string;
  status: CandidateStatus | "ALL";
  sortBy: "risk_desc" | "risk_asc" | "violations_desc" | "recent";
}

export interface ActiveTestSession {
  isRunning: boolean;
  candidateId: string;
  elapsedTimeSec: number;
  totalViolations: number;
  currentRiskScore: number;
}

interface AssessmentContextType {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  policy: AssessmentPolicy;
  liveEvents: IntegrityEvent[];
  activeTestSession: ActiveTestSession;
  filters: FilterOptions;
  filteredCandidates: Candidate[];
  triggerViolation: (
    eventData: Omit<IntegrityEvent, "id" | "timestamp" | "preRiskScore" | "postRiskScore">
  ) => void;
  selectCandidate: (candidateId: string | null) => void;
  recordReviewerAction: (
    candidateId: string,
    action: ReviewerActionType,
    notes: string,
    reviewerName?: string
  ) => void;
  updatePolicy: (updatedPolicy: Partial<AssessmentPolicy>) => void;
  setFilters: (newFilters: Partial<FilterOptions>) => void;
  loadCandidates: (newCandidates: Candidate[]) => void;
  resetActiveSession: () => void;
  setActiveTestSession: React.Dispatch<React.SetStateAction<ActiveTestSession>>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [policy, setPolicy] = useState<AssessmentPolicy>(defaultPolicy);
  const [liveEvents, setLiveEvents] = useState<IntegrityEvent[]>(mockEvents);
  const [filters, setFiltersState] = useState<FilterOptions>({
    search: "",
    status: "ALL",
    sortBy: "risk_desc",
  });

  const [activeTestSession, setActiveTestSession] = useState<ActiveTestSession>({
    isRunning: false,
    candidateId: "cand-001",
    elapsedTimeSec: 0,
    totalViolations: 0,
    currentRiskScore: 0,
  });

  // Derived selected candidate
  const selectedCandidate = useMemo(() => {
    if (!selectedCandidateId) return null;
    return candidates.find((c) => c.id === selectedCandidateId) || null;
  }, [candidates, selectedCandidateId]);

  // Select Candidate helper
  const selectCandidate = useCallback((candidateId: string | null) => {
    setSelectedCandidateId(candidateId);
  }, []);

  // Update Filters helper
  const setFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Load Candidates (Bulk replace)
  const loadCandidates = useCallback((newCandidates: Candidate[]) => {
    setCandidates(newCandidates);
  }, []);

  // Reset Active Test Session
  const resetActiveSession = useCallback(() => {
    setActiveTestSession({
      isRunning: false,
      candidateId: "cand-001",
      elapsedTimeSec: 0,
      totalViolations: 0,
      currentRiskScore: 0,
    });
  }, []);

  // ──────────────────────────────────────────────
  // Backend API Integration: Seed + Fetch on mount
  // ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function initFromBackend() {
      try {
        // 1. Seed the backend with 1000 synthetic candidates
        await fetch("/api/demo/seed", { method: "POST" });

        // 2. Fetch candidates from the backend
        const res = await fetch("/api/candidates");
        if (!res.ok) return;
        const data = await res.json();

        if (cancelled) return;

        // Map backend Candidate shape to frontend Candidate shape
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Candidate[] = data.map((c: Record<string, unknown>) => ({
            id: c.id as string,
            name: c.name as string,
            email: c.email as string,
            avatar: (c.avatar as string) || "",
            assessmentTitle: "Enterprise Assessment",
            status: mapRiskLevelToStatus(c.riskLevel as string, c.riskScore as number),
            riskScore: Math.min(100, Math.round(c.riskScore as number)),
            startedAt: c.startTime ? new Date(c.startTime as string).toISOString() : new Date().toISOString(),
            completedAt: c.endTime ? new Date(c.endTime as string).toISOString() : undefined,
            totalViolations: 0,
            recentViolations: [],
            auditTrail: [],
          }));
          setCandidates(mapped);
        }

        // 3. Fetch dashboard stats
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          // Stats fetched successfully — data is available for future use
          await statsRes.json();
        }
      } catch (err) {
        // Backend API not available — fall back to mock data (already loaded)
        console.warn("Backend API not reachable, using mock data:", err);
      }
    }

    initFromBackend();
    return () => { cancelled = true; };
  }, []);

  // Helper: map backend RiskLevel to frontend CandidateStatus
  function mapRiskLevelToStatus(riskLevel: string, riskScore: number): CandidateStatus {
    if (riskLevel === "CRITICAL" || riskScore >= 70) return "AUTO_FLAGGED";
    if (riskLevel === "HIGH" || riskScore >= 55) return "HIGH_RISK";
    if (riskLevel === "MEDIUM" || riskScore >= 40) return "SUSPICIOUS";
    return "NORMAL";
  }

  // Trigger Violation action
  const triggerViolation = useCallback(
    (eventData: Omit<IntegrityEvent, "id" | "timestamp" | "preRiskScore" | "postRiskScore">) => {
      const { candidateId, eventType, severity, confidence } = eventData;

      // We must not put side effects (like setLiveEvents or fetch) inside setCandidates updater,
      // because React StrictMode will run the updater twice, causing duplicates.
      // So we do the lookup directly from the current 'candidates' state in scope.
      
      const targetCandidate = candidates.find((c) => c.id === candidateId) || null;
      const preRiskScore = targetCandidate ? targetCandidate.riskScore : 0;

      // Calculate score delta based on policy weight & confidence multiplier
      const baseWeight = policy.eventWeights[eventType] || 10;
      const confidenceFactor = (confidence || 80) / 100;
      let severityMultiplier = 1;
      if (severity === "MEDIUM") severityMultiplier = 1.2;
      if (severity === "HIGH") severityMultiplier = 1.5;
      if (severity === "CRITICAL") severityMultiplier = 2.0;

      // Check multi-signal bonus
      const recentViolations = targetCandidate ? targetCandidate.recentViolations : [];
      const hasMultipleSignals = recentViolations.length >= 2;
      const bonusMultiplier = hasMultipleSignals ? policy.multiSignalBonusMultiplier : 1.0;

      const delta = Math.round(baseWeight * confidenceFactor * severityMultiplier * bonusMultiplier);
      const postRiskScore = Math.min(100, preRiskScore + delta);

      const newStatus = calculateCandidateStatus(
        postRiskScore,
        policy.autoFlagThreshold,
        policy.suspiciousThreshold
      );

      // Format current timestamp (HH:MM:SS)
      const now = new Date();
      const timestamp = now.toTimeString().split(" ")[0];

      const newEvent: IntegrityEvent = {
        ...eventData,
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp,
        preRiskScore,
        postRiskScore,
      };

      // Add to live events feed ONCE
      setLiveEvents((prevLive) => [newEvent, ...prevLive].slice(0, 50));

      setCandidates((prevCandidates) => {
        const candidateIndex = prevCandidates.findIndex((c) => c.id === candidateId);
        if (candidateIndex === -1) return prevCandidates;
        
        const existingCandidate = prevCandidates[candidateIndex];

        const updatedCandidate: Candidate = {
          ...existingCandidate,
          riskScore: postRiskScore,
          status: newStatus,
          totalViolations: existingCandidate.totalViolations + 1,
          recentViolations: [eventType, ...existingCandidate.recentViolations].slice(0, 10),
        };

        const updatedList = [...prevCandidates];
        updatedList[candidateIndex] = updatedCandidate;
        return updatedList;
      });

      // Update active session if matching
      setActiveTestSession((prev) => {
        if (prev.candidateId === candidateId) {
          const preRisk = prev.currentRiskScore;
          const baseWeight = policy.eventWeights[eventData.eventType] || 10;
          const delta = Math.round(baseWeight * (eventData.confidence / 100));
          return {
            ...prev,
            totalViolations: prev.totalViolations + 1,
            currentRiskScore: Math.min(100, preRisk + delta),
          };
        }
        return prev;
      });

      // Fire-and-forget: persist event to backend API
      fetch(`/api/candidates/${candidateId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: eventType,
          severity: severity,
          detectorConfidence: confidence || 80,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => { /* Backend sync failed silently — UI already updated */ });
    },
    [policy]
  );

  // Record Reviewer Action
  const recordReviewerAction = useCallback(
    (
      candidateId: string,
      action: ReviewerActionType,
      notes: string,
      reviewerName: string = "HR Compliance Lead"
    ) => {
      const nowIso = new Date().toISOString();
      const auditEntry: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        candidateId,
        reviewerName,
        action,
        timestamp: nowIso,
        notes,
      };

      setCandidates((prevCandidates) =>
        prevCandidates.map((cand) => {
          if (cand.id !== candidateId) return cand;

          let newStatus = cand.status;
          if (action === "CONFIRM_FLAG") {
            newStatus = "AUTO_FLAGGED";
          } else if (action === "DISMISS_FLAG") {
            newStatus = "NORMAL";
          } else if (action === "ESCALATE") {
            newStatus = "HIGH_RISK";
          }

          return {
            ...cand,
            status: newStatus,
            auditTrail: [auditEntry, ...cand.auditTrail],
          };
        })
      );

      // Fire-and-forget: persist review action to backend API
      const reviewAction = action === "CONFIRM_FLAG" ? "CONFIRM" : action === "DISMISS_FLAG" ? "DISMISS" : action;
      fetch(`/api/candidates/${candidateId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reviewAction,
          reviewerId: reviewerName,
          note: notes,
        }),
      }).catch(() => { /* Backend sync failed silently */ });
    },
    []
  );

  // Update Policy settings
  const updatePolicy = useCallback((updatedPolicy: Partial<AssessmentPolicy>) => {
    setPolicy((prev) => {
      const nextPolicy = { ...prev, ...updatedPolicy };

      // Recalculate candidate statuses across all candidates with new thresholds
      setCandidates((prevCandidates) =>
        prevCandidates.map((cand) => ({
          ...cand,
          status: calculateCandidateStatus(
            cand.riskScore,
            nextPolicy.autoFlagThreshold,
            nextPolicy.suspiciousThreshold
          ),
        }))
      );

      return nextPolicy;
    });
  }, []);

  // Filtered & Sorted candidates derived memo
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((cand) => {
        // Status filter
        if (filters.status !== "ALL" && cand.status !== filters.status) {
          return false;
        }
        // Search filter
        if (filters.search.trim() !== "") {
          const q = filters.search.toLowerCase();
          const matchesName = cand.name.toLowerCase().includes(q);
          const matchesEmail = cand.email.toLowerCase().includes(q);
          const matchesAssessment = cand.assessmentTitle.toLowerCase().includes(q);
          if (!matchesName && !matchesEmail && !matchesAssessment) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "risk_desc") return b.riskScore - a.riskScore;
        if (filters.sortBy === "risk_asc") return a.riskScore - b.riskScore;
        if (filters.sortBy === "violations_desc") return b.totalViolations - a.totalViolations;
        if (filters.sortBy === "recent")
          return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
        return 0;
      });
  }, [candidates, filters]);

  const value = {
    candidates,
    selectedCandidate,
    policy,
    liveEvents,
    activeTestSession,
    filters,
    filteredCandidates,
    triggerViolation,
    selectCandidate,
    recordReviewerAction,
    updatePolicy,
    setFilters,
    loadCandidates,
    resetActiveSession,
    setActiveTestSession,
  };

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
};

export const useAssessment = (): AssessmentContextType => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};
