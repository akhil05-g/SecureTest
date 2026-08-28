"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
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

  // Trigger Violation action
  const triggerViolation = useCallback(
    (eventData: Omit<IntegrityEvent, "id" | "timestamp" | "preRiskScore" | "postRiskScore">) => {
      const { candidateId, eventType, severity, confidence } = eventData;

      setCandidates((prevCandidates) => {
        const candidateIndex = prevCandidates.findIndex((c) => c.id === candidateId);
        const targetCandidate = candidateIndex !== -1 ? prevCandidates[candidateIndex] : null;

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

        // Add to live events feed (max 50, newest first)
        setLiveEvents((prevLive) => [newEvent, ...prevLive].slice(0, 50));

        if (!targetCandidate) return prevCandidates;

        const updatedCandidate: Candidate = {
          ...targetCandidate,
          riskScore: postRiskScore,
          status: newStatus,
          totalViolations: targetCandidate.totalViolations + 1,
          recentViolations: [eventType, ...targetCandidate.recentViolations].slice(0, 10),
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
