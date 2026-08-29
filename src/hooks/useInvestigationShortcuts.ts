'use client';

import { useEffect, useState } from 'react';
import { ReviewerActionType } from '../types';

export interface UseInvestigationShortcutsProps {
  isOpen: boolean;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
  onConfirmFlag: () => void;
  onDismissFlag: () => void;
  onEscalate: () => void;
  onClose: () => void;
}

export function useInvestigationShortcuts({
  isOpen,
  onNavigateNext,
  onNavigatePrev,
  onConfirmFlag,
  onDismissFlag,
  onEscalate,
  onClose,
}: UseInvestigationShortcutsProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigateNext();
        triggerToast('Navigated to Next Incident');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigatePrev();
        triggerToast('Navigated to Previous Incident');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onConfirmFlag();
        triggerToast('Decision Recorded: Disqualification Confirmed');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        onDismissFlag();
        triggerToast('Decision Recorded: Dismissed as False Positive');
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        onEscalate();
        triggerToast('Decision Recorded: Escalated to Committee');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNavigateNext, onNavigatePrev, onConfirmFlag, onDismissFlag, onEscalate, onClose]);

  return { toastMessage };
}
